import { ethers, Contract } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import BakiNFTArtifacts from "../abi/BakiNFT.json";
import { CONTRACT_ADDRESS, WHITELIST } from "../utils/constants";

interface DataProps {
  status: number;
  message: string;
  data: any;
}

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

/**
 * Request access to the user's MetaMask account
 * @returns {any}
 */
const requestAccount = async (): Promise<any> => {
  if (window.ethereum?.request)
    return window.ethereum.request({ method: "eth_requestAccounts" });

  throw new Error(
    "Missing install Metamask. Please access https://metamask.io/ to install extension on your browser"
  );
};

const getContact = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, BakiNFTArtifacts.abi, signer);

  return contract;
};

/**
 * The function to fetch the information of contract
 * @returns {DataProps}
 */
const fetchContractInfo = async (): Promise<DataProps> => {
  const contract = getContact();

  try {
    const currentSupply = await contract.fetchCurrentSupply();
    const totalSupply = await contract._totalSupply();
    const publicPrice = await contract._publicPrice();
    const whitelistPrice = await contract._whitelistPrice();
    const baseURI = await contract._baseTokenURI();
    const maxMint = await contract._maxMint();

    return {
      status: 200,
      message: "",
      data: {
        currentSupply: Number(currentSupply.toString()),
        totalSupply: Number(totalSupply.toString()),
        publicPrice: Number(publicPrice.toString()) / 10 ** 18,
        whitelistPrice: Number(whitelistPrice.toString()) / 10 ** 18,
        baseURI,
        maxMint: Number(maxMint.toString()),
      },
    };
  } catch (err) {
    return {
      status: 500,
      message: "Error on fetching the information of contract.",
      data: {},
    };
  }
};

/**
 * The function to public mint
 * @param {number} amount
 * @returns {DataProps}
 */
const publicMint = async (amount: number): Promise<DataProps> => {
  const contract = getContact();

  try {
    const info: DataProps = await fetchContractInfo();

    if (info.status === 200) {
      const price = Number(info.data.publicPrice) * amount;
      console.log("price: ", price);
      const tx = await contract.publicMint(amount, {
        value: ethers.utils.parseEther(price.toString()),
      });

      await tx.wait();

      console.log("Successed in public mint NFT: ", tx.hash);

      return {
        status: 200,
        message: "",
        data: true,
      };
    } else {
      return info;
    }
  } catch (err) {
    console.log(err);

    return {
      status: 500,
      message: "Error on public minting.",
      data: false,
    };
  }
};

/**
 * The function to whitelist mint
 * @param {number} amount
 * @returns {DataProps}
 */
const whitelistMint = async (amount: number): Promise<DataProps> => {
  const contract = getContact();

  try {
    const info: DataProps = await fetchContractInfo();

    if (info.status === 200) {
      const price = Number(info.data.whitelistPrice) * amount;
      const tx = await contract.whitelistMint(amount, {
        value: ethers.utils.parseEther(price.toString()),
      });

      await tx.wait();

      console.log("Successed in white mint NFT: ", tx.hash);

      return {
        status: 200,
        message: "",
        data: true,
      };
    } else {
      return info;
    }
  } catch (err) {
    console.log(err);

    return {
      status: 500,
      message: "Error on whitelist minting.",
      data: false,
    };
  }
};

/**
 * The function to check about that the address is whitelist
 * @param {string} walletAddress
 * @returns {boolean}
 */
const checkIsWhitelist = (walletAddress: string): boolean => {
  const leftNodes = WHITELIST.map((address) => keccak256(address));
  const merkleTree = new MerkleTree(leftNodes, keccak256, { sortPairs: true });
  const rootHash = merkleTree.getHexRoot();
  const hashedAddress = keccak256(walletAddress);
  const proof = merkleTree.getHexProof(hashedAddress);
  const checkIsWhitelist = merkleTree.verify(proof, hashedAddress, rootHash);

  return checkIsWhitelist;
};

export {
  requestAccount,
  fetchContractInfo,
  publicMint,
  whitelistMint,
  checkIsWhitelist,
};

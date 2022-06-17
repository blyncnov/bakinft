import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { SimpleGrid, Box, Button, Spinner } from "@chakra-ui/react";
import {
  requestAccount,
  fetchContractInfo,
  publicMint,
  whitelistMint,
  checkIsWhitelist,
} from "../services/web3";
import { IMAGES } from "../utils/image";
import styles from "../styles/global.module.css";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mintCount, setMintCount] = useState<number>(1);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [contractInfo, setContractInfo] = useState<any>({});
  const [mintMax, setMintMax] = useState<number>(1);

  const connectWallet = async () => {
    const accounts = await requestAccount();
    setWalletAddress(accounts[0]);
  };

  const disconnectWallet = () => {
    setWalletAddress("");
  };

  const increaseCount = () => {
    if (mintCount < mintMax) {
      setMintCount(mintCount + 1);
    }
  };

  const decreaseCount = () => {
    if (mintCount > 1) {
      setMintCount(mintCount - 1);
    }
  };

  const setMax = () => {
    setMintCount(mintMax);
  };

  const fetchInfo = async () => {
    setIsLoading(true);
    const result = await fetchContractInfo();

    if (result.status === 200) {
      setContractInfo(result.data);
      setMintMax(result.data.maxMint || 1);
    }
    setIsLoading(false);
  };

  const mintNFT = async () => {
    setIsLoading(true);
    const isWhitelist = checkIsWhitelist(walletAddress);

    if (isWhitelist) {
      const result = await whitelistMint(mintCount);

      if (result.status === 200) {
        await fetchInfo();
      }
    } else {
      const result = await publicMint(mintCount);

      if (result.status === 200) {
        await fetchInfo();
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className="full-screen">
          <Spinner size="xl" color="white" thickness="0.25rem" />
        </div>
      )}

      {!isLoading && (
        <>
          <div className={`text-center`}>
            <span className={`bi bi-twitter ${styles.icons}`} />
            <span className={`bi bi-twitter ${styles.icons}`} />
            <span className={`bi bi-twitter ${styles.icons}`} />
          </div>

          <SimpleGrid columns={{ lg: 1, xl: 2 }} className="fs-5">
            <Box className="d-flex justify-content-center my-4">
              <div className={styles.card}>
                <Box>
                  <Image
                    src={IMAGES.LOGO}
                    width="360px"
                    height="192px"
                    alt="logo"
                  />
                  <h4 className="lh-lg">Minted: </h4>
                  <h4 className="lh-lg">
                    {contractInfo.currentSupply || 0} /{" "}
                    {contractInfo.totalSupply || 0}
                  </h4>
                  <div className="h-91px p-5 d-flex justify-content-around align-items-center">
                    <div
                      className="cursor-pointer min-width-20px"
                      onClick={decreaseCount}
                    >
                      <span className="bi bi-dash-lg" />
                    </div>
                    <div className="cursor-pointer min-width-20px fs-3">
                      {mintCount}
                    </div>
                    <div
                      className="cursor-pointer min-width-20px"
                      onClick={increaseCount}
                    >
                      <span className="bi bi-plus-lg" />
                    </div>
                    <div
                      className="cursor-pointer min-width-20px text-decoration-underline"
                      onClick={setMax}
                    >
                      Mint Max
                    </div>
                  </div>
                  {walletAddress === "" && (
                    <Button
                      className="bg-primary w-100 height-51px fs-5"
                      onClick={connectWallet}
                    >
                      Connect Wallet
                    </Button>
                  )}
                  {walletAddress !== "" && (
                    <>
                      <Button
                        className="bg-primary w-100 height-51px fs-5 my-2"
                        onClick={mintNFT}
                      >
                        Mint
                      </Button>
                      <Button
                        className="bg-primary w-100 height-51px fs-5 my-2"
                        onClick={disconnectWallet}
                      >
                        Disconnect
                      </Button>
                    </>
                  )}
                </Box>
              </div>
            </Box>
            <Box className="d-flex justify-content-center my-4">
              <div className={styles.card}>
                <Box>
                  <h4 className="lh-lg">
                    1 free + gas mint per wallet. Mint more for 0.005Ξ each.
                    5000 max supply.
                  </h4>
                  <Image
                    src={IMAGES.ANIMATION}
                    width="360px"
                    height="480px"
                    alt="animation"
                  />
                  <div className="twitter-section">
                    <h2 className="lh-lg fs-2">#MechaFollowMecha</h2>
                  </div>
                </Box>
              </div>
            </Box>
          </SimpleGrid>
        </>
      )}
    </div>
  );
};

export default Home;

const BakiNFT = artifacts.require("BakiNFT");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

module.exports = function (deployer) {
  const name = "Baki NFT";
  const symbol = "BAKI";
  const rate = 1e18;
  const totalSupply = 7777;
  const whitelistPrice = 0.8;
  const publicPrice = 0.9;
  const whitelist = [
    "0x51166c556370778061763E60948C93b6d8a6739b",
    "0xB852A356f5088d6355e7E8f673E9DbF96aE6c158",
  ];
  const baseURI = "https://google.com";
  const maxMint = 5;

  // Get the Merkleroot hash
  const leftNodes = whitelist.map((address) => keccak256(address));
  const merkleTree = new MerkleTree(leftNodes, keccak256, { sortPairs: true });
  const rootHash = merkleTree.getHexRoot();

  deployer.deploy(
    BakiNFT,
    name,
    symbol,
    totalSupply,
    whitelistPrice * rate,
    publicPrice * rate,
    rootHash,
    baseURI,
    maxMint
  );
}



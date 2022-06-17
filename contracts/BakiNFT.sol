// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BakiNFT is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  address _owner; // Address of owner of this contract
  Counters.Counter private _tokenIdTracker; // The tracker to count of tokenId
  uint256 public _whitelistPrice; // The price when whitelist mint
  uint256 public _publicPrice; // The price when public mint
  uint256 public _totalSupply; // The total supply of NFT in this contract
  bool public _enabled; // The status of this contract
  bytes32 public _merkleRoot; // The Merkleroot hash for check the whitelist
  uint256 public _maxMint; // Maximum usable mint amount of NFTs
  string public _baseTokenURI; // Base token URI

  constructor(
    string memory name, // Contract name
    string memory symbol, // Contract symbol
    uint256 totalSupply, // Contract totalSupply
    uint256 whitelistPrice, // Contract whitelistPrice
    uint256 publicPrice, // Contract publicPrice
    bytes32 merkleRoot, // Contract merkleRoot
    string memory baseURI, // Token base URI
    uint256 maxMint // Maximum usable mint amount of NFTs
  ) ERC721(name, symbol) {
    _owner = msg.sender;
    _totalSupply = totalSupply;
    _whitelistPrice = whitelistPrice;
    _publicPrice = publicPrice;
    _merkleRoot = merkleRoot;
    _baseTokenURI = baseURI;
    _maxMint = maxMint;
    _enabled = true;
  }

  // The modifier to check about that whitelist
  modifier isWhitelist(bytes32[] calldata merkleProof, bytes32 root) {
    require(
      MerkleProof.verify(
        merkleProof,
        root,
        keccak256(abi.encodePacked(msg.sender))
      ),
      "Address does not exist in whitelist."
    );
    _;
  }

  // The modifier to check the status of smart contract
  modifier isEnabled() {
    require(_enabled, "The minting disabled now.");
    _;
  }

  // The function to mint
  function mint(uint256 amount) private {
    require(balanceOf(msg.sender) + amount <= _maxMint, "The number of NFTs minted is limited by the max mint.");

    uint256 i;
    while(i < amount) {
      i++;
      // check total supply
      require(_tokenIdTracker.current() < _totalSupply, "The number of NFTs minted is limited by the total supply.");
      
      // get token id
      uint256 tokenId = _tokenIdTracker.current();

      // mint for person that called function
      _safeMint(msg.sender, tokenId);

      // increments token id count
      _tokenIdTracker.increment();
    }
  }

  // The function to mint the NFT
  function publicMint(uint256 amount) public payable isEnabled {
    require(_publicPrice * amount == msg.value, "The money is not enough to mint NFT.");

    mint(amount);
  }

  // The function to whitelist mint
  function whitelistMint(
    uint256 amount,
    bytes32[] calldata merkleProof
  ) public payable isWhitelist(merkleProof, _merkleRoot) isEnabled {
    require(_whitelistPrice * amount == msg.value, "The money is not enough to mint NFT.");

    mint(amount);
  }

  // The function to set the private price
  function setWhitelistPrice(uint256 whitelistPrice) public onlyOwner {
    _whitelistPrice = whitelistPrice;
  }

  // The function to set the private price
  function setPublicPrice(uint256 publicPrice) public onlyOwner {
    _publicPrice = publicPrice;
  }

  // The function to set the total supply
  function setTotalSupply(uint256 totalSupply) public onlyOwner {
    _totalSupply = totalSupply;
  }

  // The function to set the status of this contract
  function setEnabled(bool status) public onlyOwner {
    _enabled = status;
  }

  // The function to withdraw
  function withdraw() public onlyOwner {
    (bool success, ) = owner().call{value: address(this).balance}("");
    require(success, "Failed to withdraw.");
  }

  // The function to set the merkleRoot hash
  function setMerkleRoot(bytes32 merkleRoot) public onlyOwner {
    _merkleRoot = merkleRoot;
  }

  // The function to fetch current supply
  function fetchCurrentSupply() public view returns (uint256) {
    return _tokenIdTracker.current();
  }

  // The function to get token base uri
  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  // The function to set token base uri
  function setBaseURI(string calldata baseURI) public onlyOwner {
    _baseTokenURI = baseURI;
  }

  // The function to set max mint
  function setMaxMint(uint256 maxMint) public onlyOwner {
    _maxMint = maxMint;
  }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduChain is ERC20, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint256 public constant MINT_THRESHOLD = 100; // Points needed to mint tokens
    uint256 public constant TOKEN_REWARD = 10;    // EDU tokens per threshold
    uint256 public constant NFT_MILESTONE = 500;  // Points needed to mint an NFTx
    mapping(address => bool) public hasMintedNFT;
    event TokensMinted(address indexed user, uint256 amount);
    event NFTMinted(address indexed user, uint256 tokenId, string tokenURI);

    constructor() ERC20("EduToken", "EDU") ERC721("EduLearnBadge", "EDULB") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    function claimTokens(uint256 points) public {
        require(points >= MINT_THRESHOLD, "Not enough points to mint tokens");

        uint256 rewardAmount = (points / MINT_THRESHOLD) * TOKEN_REWARD;

        _mint(msg.sender, rewardAmount * 10 ** decimals()); // Mint tokens
        emit TokensMinted(msg.sender, rewardAmount);

        // If the user reached 500+ points, allow NFT minting
        if (points >= NFT_MILESTONE && !hasMintedNFT[msg.sender]) {
            mintNFT(msg.sender);
        }
    }

    // Internal function to mint an NFT
    function mintNFT(address user, string memory metadataURI) internal {
    _tokenIds++;
    uint256 newItemId = _tokenIds;

    _mint(user, newItemId);
    _setTokenURI(newItemId, metadataURI); // Dynamically assign metadata URI

    hasMintedNFT[user] = true; // Ensure one NFT per user
    emit NFTMinted(user, newItemId, metadataURI);
}

}

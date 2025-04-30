pragma solidity ^0.8.29;

// ----------------------------------------------------------------------------
// CryptoPunksHelper v0.8.0a - Helper to retrieve CryptoPunks data
//
// Deployed to Mainnet 0xf2374fa8904baa02AB3C374def572f37a20d6584
//
// https://github.com/bokkypoobah/Explorer
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2025
// ----------------------------------------------------------------------------

interface CryptoPunksV1 {
    struct Offer {
        bool isForSale;
        uint punkIndex;
        address seller;
        uint minValue;
        address onlySellTo;
    }

    function standard() external view returns (string memory);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function punkIndexToAddress(uint punkId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
    function punksOfferedForSale(uint punkId) external view returns (Offer memory);
    function pendingWithdrawals(address owner) external view returns (uint256);
}

interface CryptoPunksV2 {
    struct Offer {
        bool isForSale;
        uint punkIndex;
        address seller;
        uint minValue;
        address onlySellTo;
    }
    struct Bid {
        bool hasBid;
        uint punkIndex;
        address bidder;
        uint value;
    }

    function standard() external view returns (string memory);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function punkIndexToAddress(uint punkId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
    function punksOfferedForSale(uint punkId) external view returns (Offer memory);
    function punkBids(uint punkId) external view returns (Bid memory);
    function pendingWithdrawals(address owner) external view returns (uint256);
}

interface CryptoPunksData {
    function punkImage(uint16 index) external view returns (bytes memory);
    function punkImageSvg(uint16 index) external view returns (string memory svg);
    function punkAttributes(uint16 index) external view returns (string memory text);
}

contract CryptoPunksHelper {
    address public constant CRYPTOPUNKSMARKET_V1 = 0x6Ba6f2207e343923BA692e5Cae646Fb0F566DB8D;
    address public constant CRYPTOPUNKSMARKET_V2 = 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB;
    address public constant WRAPPED_CRYPTOPUNKS_V1 = 0x282BDD42f4eb70e7A9D9F40c8fEA0825B7f68C5D;
    address public constant WRAPPED_CRYPTOPUNKS_V2 = 0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6;
    address public constant CRYPTOPUNKS_DATA = 0x16F5A35647D6F03D5D3da7b35409D65ba03aF3B2;

    function getImages(uint start, uint length) external view returns(bytes[] memory images) {
        images = new bytes[](length);
        for (uint i = 0; i < length; i++) {
            images[start + i] = CryptoPunksData(CRYPTOPUNKS_DATA).punkImage(uint16(start + i));
        }
    }
    function getImageSvgs(uint start, uint length) external view returns(string[] memory svgs) {
        svgs = new string[](length);
        for (uint i = 0; i < length; i++) {
            svgs[start + i] = CryptoPunksData(CRYPTOPUNKS_DATA).punkImageSvg(uint16(start + i));
        }
    }
    function getAttributes(uint start, uint length) external view returns(string[] memory texts) {
        texts = new string[](length);
        for (uint i = 0; i < length; i++) {
            texts[start + i] = CryptoPunksData(CRYPTOPUNKS_DATA).punkAttributes(uint16(start + i));
        }
    }
}

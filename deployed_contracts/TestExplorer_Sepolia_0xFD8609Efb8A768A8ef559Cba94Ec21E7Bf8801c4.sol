/**
 *Submitted for verification at Etherscan.io on 2025-03-25
*/

pragma solidity ^0.8.29;

// ----------------------------------------------------------------------------
// TestExplorer v0.8.0a - Testing Explorer's read and write function input and
// output parameters
//
// Deployed to Sepolia 0xFD8609Efb8A768A8ef559Cba94Ec21E7Bf8801c4 for testing
//
// https://github.com/bokkypoobah/Explorer
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2025
// ----------------------------------------------------------------------------


contract TestExplorer {

    function testUint256(
        uint256 u256,
        uint256[] memory u256d,
        uint256[5] memory u256f
    ) public  pure returns (
        uint256 _u256,
        uint256[] memory _u256d,
        uint256[5] memory _u256f
    ) {
        _u256 = u256;
        _u256d = new uint256[](u256d.length);
        for (uint256 i; i < u256d.length; i++) {
            _u256d[i] = u256d[i];
        }
        for (uint256 i; i < 5; i++) {
            _u256f[i] = u256f[i];
        }
    }

    function testUint8(
        uint8 u8,
        uint8[] memory u8d,
        uint8[5] memory u8f
    ) public  pure returns (
        uint8 _u8,
        uint8[] memory _u8d,
        uint8[5] memory _u8f
    ) {
        _u8 = u8;
        _u8d = new uint8[](u8d.length);
        for (uint256 i; i < u8d.length; i++) {
            _u8d[i] = u8d[i];
        }
        for (uint256 i; i < 5; i++) {
            _u8f[i] = u8f[i];
        }
    }

    function testInt256(
        int256 i256,
        int256[] memory i256d,
        int256[5] memory i256f
    ) public  pure returns (
        int256 _i256,
        int256[] memory _i256d,
        int256[5] memory _i256f
    ) {
        _i256 = i256;
        _i256d = new int256[](i256d.length);
        for (uint256 i; i < i256d.length; i++) {
            _i256d[i] = i256d[i];
        }
        for (uint256 i; i < 5; i++) {
            _i256f[i] = i256f[i];
        }
    }

}

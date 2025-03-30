/**
 *Submitted for verification at Etherscan.io on 2025-03-30
*/

pragma solidity ^0.8.29;

// ----------------------------------------------------------------------------
// TestExplorer v0.8.0b - Testing Explorer's read and write function input and
// output parameters
//
// Deployed to Sepolia 0xd873a572631cD837B03218369974C26b7A82f245 for testing
//
// https://github.com/bokkypoobah/Explorer
//
// SPDX-License-Identifier: MIT
//
// Enjoy. (c) BokkyPooBah / Bok Consulting Pty Ltd 2025
// ----------------------------------------------------------------------------


contract TestExplorer {

    // bool: true or false
    function testBool(
        bool b,
        bool[] memory bd,
        bool[5] memory bf
    ) public pure returns (
        bool _b,
        bool[] memory _bd,
        bool[5] memory _bf
    ) {
        _b = b;
        _bd = new bool[](bd.length);
        for (uint i; i < bd.length; i++) {
            _bd[i] = bd[i];
        }
        for (uint i; i < 5; i++) {
            _bf[i] = bf[i];
        }
    }

      // int/uint: 8 to 256 bits
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

    function testUint8(
        uint8 u8,
        uint8[] memory u8d,
        uint8[5] memory u8f
    ) public pure returns (
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

    function testUint256(
        uint256 u256,
        uint256[] memory u256d,
        uint256[5] memory u256f
    ) public pure returns (
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

    // address
    function testAddress(
        address a,
        address[] memory ad,
        address[5] memory af
    ) public pure returns (
        address _a,
        address[] memory _ad,
        address[5] memory _af
    ) {
        _a = a;
        _ad = new address[](ad.length);
        for (uint256 i; i < ad.length; i++) {
            _ad[i] = ad[i];
        }
        for (uint256 i; i < 5; i++) {
            _af[i] = af[i];
        }
    }

    // bytesX: X = 1 to 32
    function testBytes(
        bytes memory b,
        bytes[] memory bd,
        bytes[5] memory bf
    ) public pure returns (
        bytes memory _b,
        bytes[] memory _bd,
        bytes[5] memory _bf
    ) {
        _b = b;
        _bd = new bytes[](bd.length);
        for (uint256 i; i < bd.length; i++) {
            _bd[i] = bd[i];
        }
        for (uint256 i; i < 5; i++) {
            _bf[i] = bf[i];
        }
    }
    function testBytes7(
        bytes7 b7,
        bytes7[] memory b7d,
        bytes7[5] memory b7f
    ) public pure returns (
        bytes7 _b7,
        bytes7[] memory _b7d,
        bytes7[5] memory _b7f
    ) {
        _b7 = b7;
        _b7d = new bytes7[](b7d.length);
        for (uint256 i; i < b7d.length; i++) {
            _b7d[i] = b7d[i];
        }
        for (uint256 i; i < 5; i++) {
            _b7f[i] = b7f[i];
        }
    }
    function testBytes32(
        bytes32 b32,
        bytes32[] memory b32d,
        bytes32[5] memory b32f
    ) public pure returns (
        bytes32 _b32,
        bytes32[] memory _b32d,
        bytes32[5] memory _b32f
    ) {
        _b32 = b32;
        _b32d = new bytes32[](b32d.length);
        for (uint256 i; i < b32d.length; i++) {
            _b32d[i] = b32d[i];
        }
        for (uint256 i; i < 5; i++) {
            _b32f[i] = b32f[i];
        }
    }

    // string
    // enums
    // user defined types
    // arrays
    // structs

}

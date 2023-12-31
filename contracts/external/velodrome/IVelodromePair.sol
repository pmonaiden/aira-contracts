// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.9;

interface IVelodromePair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function stable() external view returns (bool);

    function totalSupply() external view returns (uint256);

    function getReserves()
        external
        view
        returns (
            uint112 reserve0,
            uint112 reserve1,
            uint32 blockTimestampLast
        );
}

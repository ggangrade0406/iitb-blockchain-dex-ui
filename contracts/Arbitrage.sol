// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDEX {
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
    function spotPrice() external view returns (uint256);
    function swapAforB(uint256 amountAIn) external returns (uint256);
    function swapBforA(uint256 amountBIn) external returns (uint256);
}

contract Arbitrage {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute");
        _;
    }

    function executeAtoBtoA(
        address dex1Address, 
        address dex2Address, 
        uint256 amountAIn,
        uint256 minProfit
    ) external onlyOwner {
        IDEX dex1 = IDEX(dex1Address);
        IDEX dex2 = IDEX(dex2Address);
        IERC20 tokenA = IERC20(dex1.tokenA());
        IERC20 tokenB = IERC20(dex1.tokenB());

        uint256 price1 = dex1.spotPrice();
        uint256 price2 = dex2.spotPrice();
        
        require(price1 != price2, "Prices are identical, no opportunity");

        require(tokenA.balanceOf(address(this)) >= amountAIn, "Insufficient initial capital");

        bool startOnDex1 = price1 > price2;

        IDEX firstDEX = startOnDex1 ? dex1 : dex2;
        IDEX secondDEX = startOnDex1 ? dex2 : dex1;

        tokenA.approve(address(firstDEX), amountAIn);
        uint256 amountBReceived = firstDEX.swapAforB(amountAIn);

        tokenB.approve(address(secondDEX), amountBReceived);
        uint256 finalAmountA = secondDEX.swapBforA(amountBReceived);

        require(finalAmountA > amountAIn, "Arbitrage failed: Loss incurred");
        
        uint256 profit = finalAmountA - amountAIn;
        require(profit >= minProfit, "Profit below minimum threshold");

        require(tokenA.transfer(owner, finalAmountA), "Failed to return funds");
    }
}
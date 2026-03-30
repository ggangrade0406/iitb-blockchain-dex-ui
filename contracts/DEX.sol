// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LPToken.sol";

contract DEX {
    IERC20 public tokenA;
    IERC20 public tokenB;
    LPToken public lpToken;

    uint256 public reserveA;
    uint256 public reserveB;

    constructor(address _tokenA, address _tokenB, address _lpToken) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        lpToken = LPToken(_lpToken);
    }

    function getReserves() public view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    function spotPrice() public view returns (uint256) {
        require(reserveA > 0, "Pool is empty");
        return (reserveB * 1e18) / reserveA;
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 shares) {
        require(amountA > 0 && amountB > 0, "Must deposit more than 0");

        if (reserveA == 0 && reserveB == 0) {
            shares = amountA; 
        } else {
            require(amountA * reserveB == amountB * reserveA, "Unbalanced liquidity ratio");
            uint256 totalSupply = lpToken.totalSupply();
            shares = (amountA * totalSupply) / reserveA;
        }
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Token A transfer failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Token B transfer failed");

        lpToken.mint(msg.sender, shares);

        reserveA += amountA;
        reserveB += amountB;
    }

    function removeLiquidity(uint256 shares) external {
        require(shares > 0, "Must withdraw more than 0");
        
        uint256 totalSupply = lpToken.totalSupply();
        require(totalSupply > 0, "No liquidity in pool");
        uint256 amountA = (shares * reserveA) / totalSupply;
        uint256 amountB = (shares * reserveB) / totalSupply;
        lpToken.burn(msg.sender, shares);
        reserveA -= amountA;
        reserveB -= amountB;
        require(tokenA.transfer(msg.sender, amountA), "Token A transfer failed");
        require(tokenB.transfer(msg.sender, amountB), "Token B transfer failed");
    }

    function swapAforB(uint256 amountAIn) external returns (uint256 amountBOut) {
        require(amountAIn > 0, "Must swap more than 0");
        require(reserveA > 0 && reserveB > 0, "Liquidity pool is empty");
        uint256 amountInWithFee = amountAIn * 997;
        
        uint256 numerator = amountInWithFee * reserveB;
        
        uint256 denominator = (reserveA * 1000) + amountInWithFee;
        
        amountBOut = numerator / denominator;

        require(amountBOut > 0, "Insufficient output amount");
        require(amountBOut < reserveB, "Insufficient liquidity in pool");

        require(tokenA.transferFrom(msg.sender, address(this), amountAIn), "Transfer of Token A failed");
        require(tokenB.transfer(msg.sender, amountBOut), "Transfer of Token B failed");

        reserveA += amountAIn;
        reserveB -= amountBOut;
    }

    function swapBforA(uint256 amountBIn) external returns (uint256 amountAOut) {
        require(amountBIn > 0, "Must swap more than 0");
        require(reserveA > 0 && reserveB > 0, "Liquidity pool is empty");

        uint256 amountInWithFee = amountBIn * 997;
        uint256 numerator = amountInWithFee * reserveA;
        uint256 denominator = (reserveB * 1000) + amountInWithFee;
        amountAOut = numerator / denominator;

        require(amountAOut > 0, "Insufficient output amount");
        require(amountAOut < reserveA, "Insufficient liquidity in pool");

        require(tokenB.transferFrom(msg.sender, address(this), amountBIn), "Transfer of Token B failed");
        require(tokenA.transfer(msg.sender, amountAOut), "Transfer of Token A failed");

        reserveB += amountBIn;
        reserveA -= amountAOut;
    }
}
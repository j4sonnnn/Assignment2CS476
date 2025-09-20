// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title CampusCredit - Simple ERC20 token for Assignment 2
contract CampusCredit is ERC20 {
    constructor(uint256 initialSupply) ERC20("CampusCredit", "CAMP") {
        _mint(msg.sender, initialSupply);
    }
}

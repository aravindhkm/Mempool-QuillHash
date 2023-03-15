// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;


import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {Pausable} from "openzeppelin-contracts/security/Pausable.sol";
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";


contract ReentrancyMock is Ownable, Pausable {
    using SafeTransferLib for address;

    uint256 public claimAmount;
    mapping (address => bool) public walletClaim;
    uint256 private count;

    error InvalidAmount();
    error AlreadyClaim(address);

    event Reentrancy(address indexed user,uint256 entry);

    constructor() {
        claimAmount = 0.01e18;
    }

    receive() external payable {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setClaimAmount(uint256 newAmount) external onlyOwner{
        if(newAmount == 0) revert InvalidAmount();

        claimAmount = newAmount;
    }

    function getLeftOverEth() external onlyOwner {
        owner().safeTransferETH(address(this).balance);
    }

    function claim() external whenNotPaused {
        if(walletClaim[msg.sender]) revert AlreadyClaim(msg.sender);

        emit Reentrancy(msg.sender,++count);

        msg.sender.safeTransferETH(claimAmount);

        //  Reentrancy vulnerable
        walletClaim[msg.sender] = true;
        count = 0;
    }

    function contractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

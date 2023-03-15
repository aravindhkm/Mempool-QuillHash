// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "forge-std/Test.sol";
import {ReentrancyAttack} from "src/ReentrancyAttack.sol";
import {ReentrancyMock} from "src/ReentrancyMock.sol";

contract ReentrancyTest is Test {
    ReentrancyAttack public reentrancyAttack;
    ReentrancyMock public reentrancyMock;
    address aravindh;

    function setUp() public {
        reentrancyMock = new ReentrancyMock();
        reentrancyAttack = new ReentrancyAttack();
        aravindh = makeAddr("aravindh");
        vm.deal(address(aravindh), 5 ether);
        vm.deal(address(reentrancyMock), 1 ether);
    }

    function testHack() public {
        vm.startPrank(aravindh,aravindh);
        assertEq(address(reentrancyMock).balance, 1 ether, "reentrancyMock contract should have 1 ether");
        reentrancyAttack.claim(address(reentrancyMock));     
        assertEq(address(reentrancyMock).balance, 0, "reentrancyMock contract should have 0 ether");     
        assertEq(address(aravindh).balance, 6 ether, "aravindh should have 6 ether");      
        vm.stopPrank();
    }
}
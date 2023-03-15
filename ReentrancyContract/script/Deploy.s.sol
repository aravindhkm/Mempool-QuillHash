// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from 'forge-std/Script.sol';

// import {Greeter} from "src/Greeter.sol";

import "forge-std/console.sol";

/// @notice A very simple deployment script
contract Deploy is Script {

  function run() external  {

    uint256 deployerPrivateKey = vm.envUint("DEPLOYER_KEY");   
    console.log("deployerPrivateKey", deployerPrivateKey);

    vm.startBroadcast(deployerPrivateKey);
    //greeter = new Greeter("GM");
    vm.stopBroadcast();
  }
}
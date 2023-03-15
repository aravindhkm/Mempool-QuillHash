import web3 from "web3";
import dotenv from 'dotenv';
import {ReentrancyMockAbi,ReentrancyContractAddress} from "../abi/ReentrancyMock.js";
dotenv.config();

var options = {
  timeout: 30000,
  clientConfig: {
    maxReceivedFrameSize: 100000000,
    maxReceivedMessageSize: 100000000,
  },
  reconnect: {
    auto: true,
    delay: 5000,
    maxAttempts: 15,
    onTimeout: false,
  },
};

const currentWeb3 = new web3(new web3.providers.HttpProvider(process.env.ALCHEMY_GOERLI_TESTNET));
const currentWeb3Socket = new web3(new web3.providers.WebsocketProvider(process.env.ALCHEMY_GOERLI_TESTNET_SOCKET,options));

const ReentrancyMockContract = ReentrancyContractAddress;
const ReentrancyMockContractInstance = new currentWeb3.eth.Contract(ReentrancyMockAbi,ReentrancyMockContract);
const adminPrivateKey = process.env.ADMIN_PRIVATEKEY;
let owner;

let estimateGas;
let tx_data;
let callData;

export const config = async() => {
  owner = (await currentWeb3.eth.accounts.wallet.add(adminPrivateKey)).address;  
  
  tx_data = await ReentrancyMockContractInstance.methods.pause().encodeABI();
  estimateGas = await  ReentrancyMockContractInstance.methods.pause().estimateGas({from:owner});
  const gasPrice = Math.round((await currentWeb3.eth.getGasPrice()) * 40); 
  callData = {
    from: owner,
    to: ReentrancyMockContract,
    gas: estimateGas,
    gasPrice: gasPrice, 
    data: tx_data
};
}

const pauseContractSign = async() => {  
  const receipt = await currentWeb3.eth.sendTransaction(callData);
  return `https://goerli.etherscan.io/tx/${receipt.transactionHash}`; 
}

export const suspiciousTransaction = async() => {
    const txSocket = currentWeb3Socket.eth.subscribe('pendingTransactions');
    txSocket.on('data',async txHash => {
      try{
        const txData = await currentWeb3Socket.eth.getTransaction(txHash);
        if(txData.to == ReentrancyMockContract && txData.input == "0x4e71d92d") {
          let hash = await pauseContractSign();
          console.log("Paused hash", hash);
          console.log("txData",txData);
        }
      } catch (e){
        // console.log("error", e);
      }
    })
}

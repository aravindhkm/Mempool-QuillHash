import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import web3 from "web3";
import {ReentrancyContractAddress} from "../abi/ReentrancyMock.js";
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
const mailSend = async(content) => {
    const to_mail = process.env.ADMIN_MAIL;
    const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.FROM_MAIL,
            pass: process.env.FROM_MAIL_APP_PWD
        }
    })

    var mailOptions = {
        from: process.env.FROM_MAIL,
        to: to_mail,
        subject: content.subject,
        text: content.text
    };

    smtpTransport.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("err",error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export const eventSocket = async() => {
    const Reentrancy = {
        address: [ReentrancyMockContract],
        topics: [
            currentWeb3.utils.sha3('Reentrancy(address,uint256)')
        ]
    }

    const eventSubscribe = currentWeb3Socket.eth.subscribe('logs', Reentrancy);
    eventSubscribe.on('data',async event => {
        try {        
            let transaction = currentWeb3.eth.abi.decodeLog(
            [{type: 'address',name: 'user',indexed: true },{type: 'uint256',name: 'entry'}],
            event.data, [event.topics[1], event.data]);
        
            const hash =  `https://goerli.etherscan.io/tx/${event.transactionHash}`
        
            const text = 
                "Wallet Address - " +
                transaction.user +
                "," +
                "\n\n" +
                "Transaction Count - " +
                transaction.entry +
                "\n\n" +
                "Transaction Hash - " +
                hash
        
            mailSend({
                subject: "Reentrancy transaction happen",
                text: text
            })
            
        } catch (e){
            console.log("error", e);
        }


        
    })
}


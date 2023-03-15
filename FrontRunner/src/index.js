import express from "express";
import {config,suspiciousTransaction} from "./utils/bot.js";
import {eventSocket} from "./utils/event.js";

var eventApp = express(); 
var frontRunApp = express();

config();

eventApp.listen(8000,function(){ 
    eventSocket();
    console.log('eventApp started on port: ' + 8000); 
});

frontRunApp.listen(8001,function(){ 
    suspiciousTransaction();
    console.log('frontRunApp started on port: ' + 8001); 
});


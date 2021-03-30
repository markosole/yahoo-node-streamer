// package version: npm install protobufjs@5.0.1 --save
//                  npm install bytebuffer
// useful:  https://webapplog.com/json-is-not-cool-anymore/
// data source: https://finance.yahoo.com/__finStreamer-proto.js
const WebSocket = require('ws')
var ProtoBuf = require("protobufjs");
const io = require("socket.io-client");

"use strict";
//let ProtoBuf = decode.protobuf;
let Message = ProtoBuf
  .loadProtoFile('./PricingData.proto', (err, builder)=>{
    Message = builder.build('PricingData') // StaticData // PricingData
    loadMessage()
  })

// Settings - Setup connection for local server. Disabled by default, if such server isn't running or not configured
var useSocket = false;
let socketClientID = "xyz";

const socket = io("http://localhost:3200");
if(useSocket){
    // connect to local socket server - for distributed messages
    socket.on('connect', () => {
         console.log("Socket ID: "+socket.id)
         socketClientID = socket.id;
     })
 }


// Main Yahoo connection
let loadMessage = ()=> {
    const url = 'wss://streamer.finance.yahoo.com'
    const connection = new WebSocket(url)

    connection.onopen = () => {
    // Subscribe to AMC and Tesla symbols. List can contain many symbols
    connection.send('{"subscribe":["AMC", "TSLA"]}')
    }

    connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`)
    }

    connection.onmessage = (e) => {

    let msg = Message.decode(e.data)
    console.log('All data set: ', msg)
    console.log('Decoded message', msg.id + ' with price: ' + msg.price)

    // Create object which will be sent to distribution over local socket.io server
    var trackedData = {
        name: msg.id,
        price: msg.price,
        identifier: hashCode(msg.id),
        sender: "Yahoo",
        clientid: socketClientID,
        symbol: msg.id
    }

    // Use socket server if enabled
    if(useSocket){
        socket.emit('tracked', trackedData);
    }

    }
  }

// Helper function - converts string into number. Can be used in html to generate unique class names etc.
  function hashCode(str) {
	var hash = 0, i, chr;
	for (i = 0; i < str.length; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	 }
	if (hash < 0) {
	 // if negative, convert to positive
	 hash = hash * (-1);
	}
	return hash;
}

































// Normalna ne-dekodirana verzija
// const url = 'wss://streamer.finance.yahoo.com' // wss://streamer.finance.yahoo.com //wss://flavio-websockets-server-example.glitch.me
// const connection = new WebSocket(url)

// connection.onopen = () => {
//   connection.send('{"subscribe":["TSLA","AXSM","UBER","MIRM","GRKZF","BTCUSD=X","ETHUSD=X","AUDUSD=X","^DJI","^IXIC","^RUT","^TNX","^VIX","^CMC200","^FTSE","^N225"]}') 
// }

// connection.onerror = (error) => {
//   console.log(`WebSocket error: ${error}`)
// }

// connection.onmessage = (e) => {
//   console.log(e.data)
//   //let data = 'c3RhY2thYnVzZS5jb20=';
//   let buff = new Buffer(e.data, 'base64');
//   let text = buff.toString('ascii');

//   console.log('Converted: ' + text);
// }
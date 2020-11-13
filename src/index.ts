import { Context } from 'koa';
import Koa from 'koa';
const app = new Koa();

import os from 'os';
import http from 'http'; // use require('https') for https
import socketIO from 'socket.io';
const fs = require("fs");

let sampleData = ["삼계탕", "김밥", "스테이크", "짜장면", "부먹",
          "곰탕", "순대", "알리오 올리오 파스타", "짬뽕", "찍먹"]

class GameInfo {
  stage: number;
  previousResult!: string;
  itemLeft: string;
  itemRight: string;
  imageLeft: string;
  imageRight: string;

  constructor(stage: number, itemLeft: string, itemRight: string, imageLeft: string, imageRight: string){
    this.stage = stage;
    this.itemLeft = itemLeft;
    this.itemRight = itemRight;
    this.imageLeft = imageLeft;
    this.imageRight = imageRight;
  }
}
// const options = {
//   for https:
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

// app.use((ctx: Context) => { ctx.body = 'hello, Jacob!'; });
// app.listen(4000,
//   () => { console.log('Listening to port 4000'); }
// );

const server = http.createServer(app.callback());

const io = socketIO(server);
server.listen(4000, () => {
  console.log('Application is starting on port 4000')
})

io.sockets.on('connection', function(socket) {

  let roomName: string;

  // convenience function to log server messages on the client
  function log(input: string) {
    console.log(input)
    socket.emit('log', input);
  }

  log("connected!")

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    const myRoom = io.sockets.adapter.rooms[room] || {length: 0};
    const numClients = myRoom.length;
    roomName = room;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('ready', true, socket.id);
      socket.broadcast.to(room).emit('ready', false);
    } else {
      socket.emit('full', room);
    }
  });

  socket.on('offer', function(sessionDescription) {
    // let data = JSON.parse(offer);
    // log("offer")
    // log(data["room"])
    // log(data["sessionDescription"])
    socket.broadcast.to(roomName).emit('offer', sessionDescription)
  });

  socket.on('answer', function(sessionDescription) {
    // log("answer")
    // let data = JSON.parse(answer);
    // log(data["room"])
    // log(data["sessionDescription"])
    socket.broadcast.to(roomName).emit('answer', sessionDescription)
  });

  socket.on('send iceCandidate', function(candidate) {
    // let data = JSON.parse(candidate);
    // log("candidate")
    // log(data["room"])
    // log(data)
    socket.broadcast.to(roomName).emit('candidate', candidate)
  })

  socket.on('hangup', function(reason) {
    socket.leave(roomName);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function() {
    socket.leave(roomName);
  });

  /*********** Gamification *********/ 
  socket.on('start likeness', function(){
    log(__dirname)
    log("start game likeness")
    let imageAsBase64 = fs.readFileSync(__dirname + '/images/sample.png', 'base64');
    let gameInfo = new GameInfo(0, sampleData[0], sampleData[5], imageAsBase64, imageAsBase64)
    socket.to(roomName).emit('play likeness', gameInfo)
    // socket.emit('play likeness', gameInfo)
  })

  /* 매 라운드가 끝난 결과를 받으면 결과 일치 여부와 다음 라운드 정보를 전송 */
  socket.on('likeness result', function(gameInfo){
    let data = JSON.parse(gameInfo);
    let stage = data["stage"]
    let previousResult: string = stage ? 'same' : 'diff'

    if(stage == 10) {
      socket.to(roomName).emit('end likeness', previousResult)
      // socket.emit('end likeness', previousResult)
      return
    }

    let imageAsBase64 = fs.readFileSync(__dirname + '/images/sample.png', 'base64');
    let nextGameInfo = new GameInfo(stage+1, sampleData[stage+1], sampleData[stage+6], imageAsBase64, imageAsBase64)
    nextGameInfo.previousResult = previousResult
  
    socket.to(roomName).emit('play likeness', nextGameInfo)
    // socket.emit('play likeness', nextGameInfo)
  })

});

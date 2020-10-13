import { Context } from 'koa';
import Koa from 'koa';
const app = new Koa();

import os from 'os';
import http from 'http'; // use require('https') for https
import socketIO from 'socket.io';
// const fs = require("fs");
const options = {
  // for https:
  //key: fs.readFileSync('key.pem'),
  //cert: fs.readFileSync('cert.pem')
};

// app.use((ctx: Context) => { ctx.body = 'hello, Jacob!'; });
// app.listen(4000,
//   () => { console.log('Listening to port 4000'); }
// );

const server = http.createServer(app.callback());

const io = socketIO(server);
server.listen(3000, () => {
  console.log('Application is starting on port 3000')
})

io.sockets.on('connection', function(socket) {

  // convenience function to log server messages on the client
  function log(input: string) {
    console.log(input)
    socket.emit('log', input);
  }

  socket.on('create or join', function(room) {
    log('Received request to create or join room ' + room);
    const numClients: number = Object.keys(io.sockets.sockets).length;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 1) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

    } else if (numClients === 2) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');
    } else {
      socket.emit('full', room);
    }
  });

  socket.on('offer', function(offer) {
    socket.broadcast.to(offer.room).emit('offer', offer.sessionDescription)
  });

  socket.on('answer', function(answer) {
    socket.broadcast.to(answer.room).emit('offer', answer.sessionDescription)
  });

  socket.on('send candidate', function(candidate) {
    socket.broadcast.to(candidate.room).emit('candidate', candidate)
  })

  socket.on('hangup', function(reason) {
    console.log(`Peer or server disconnected. Reason: ${reason}.`);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function(room) {
    console.log(`Peer said bye on room ${room}.`);
  });

});
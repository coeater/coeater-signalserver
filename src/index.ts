import Koa from 'koa';
const app = new Koa();
import http from 'http'; // use require('https') for https
import socketIO from 'socket.io';
import { GameFinalResult, GameInfo, GameMatchResult, GameSelect } from './model';
import { GameMatchCacher } from './cacher/game_match_cacher';
import { createConnection } from 'typeorm';
import { fetchStage, fetchStageCount } from './api/stage';
import { deleteMatchHistory, findSimilarity, insertMatchHistory } from './api/match_history';

createConnection().then(async connection => {

  const server = http.createServer(app.callback());

  const io = socketIO(server);
  server.listen(4000, () => {
    console.log('Application is starting on port 4000')
  })
  const cacher = new GameMatchCacher();

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
    socket.on('start likeness', async function(){
      log(__dirname)
      log("start game likeness")
      const gameInfo = await fetchStage(1);
      await deleteMatchHistory(roomName);
      socket.to(roomName).emit('play likeness', gameInfo);
      socket.emit('play likeness', gameInfo);
    })

    /* 매 라운드가 끝난 결과를 받으면 결과 일치 여부와 다음 라운드 정보를 전송 */
    socket.on('likeness result', async function(data){
      const gameSelect = JSON.parse(data) as GameSelect;
      cacher.save(roomName, socket.id, gameSelect);
      /**
       * 두 상대방이 모두 대답한 경우
       */
      if (cacher.can_get_result(roomName, gameSelect.stage)) {
        const isMatched = cacher.is_matched(roomName);
        const totalCount = await fetchStageCount();
        await insertMatchHistory(roomName, isMatched);
        console.log(gameSelect.stage)
        console.log(totalCount)
        if (gameSelect.stage === totalCount) {
          /**
           * 맨 마지막 스테이지까지 다 진행함
           */
          console.log("finish")
          const similarity = await findSimilarity(roomName);
          const matchFinalResult = new GameFinalResult(isMatched, similarity);
          socket.to(roomName).emit('end likeness', matchFinalResult)
          socket.emit('end likeness', matchFinalResult)
        } else {
          const gameInfo = await fetchStage(gameSelect.stage + 1);
          if (gameInfo === undefined) { return; }
          const matchResult = new GameMatchResult(isMatched, gameInfo);
          socket.to(roomName).emit('match likeness', matchResult)
          socket.emit('match likeness', matchResult)
        }
      }
    })

    socket.on('delete emoji', function(request) {
      log(request)
      socket.broadcast.to(roomName).emit('delete emoji', request)
    })

    socket.on('emoji', function(request) {
      log(request)
      socket.broadcast.to(roomName).emit('emoji', request)
    })


    //Youtube Sync Features
    socket.on('youtube sync push', function(request) {
      socket.broadcast.to(roomName).emit('youtube sync update', request)
    })

    socket.on('youtube sync response', function(request) {
      socket.broadcast.to(roomName).emit('youtube sync update', request)
    })

    socket.on('youtube sync requset', function(request) {
      socket.broadcast.to(roomName).emit('youtube sync pull', request)
    })

  });

}).catch(error => console.log(error));
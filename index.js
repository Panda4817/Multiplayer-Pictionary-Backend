const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint } = require('./users')
const { chooseWord, updateRoom, getWord, removeRoom, checkWord } = require('./words')
const { addRound, increaseRound, getRound, whoseTurn } = require('./turn')
const { addTotalScore, reduceTotalScore } = require('./score')

const PORT = process.env.PORT || 5000

const router = require('./router');
const { captureRejectionSymbol } = require('events');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

const myClientList = {};
const timers = {};
const line_history = {};
const choiceTime = 5000
const turnTime = 35000

io.on('connection', (socket) => {
    console.log('We have a new connection');
    myClientList[socket.id] = socket;
    const updatePlayers = (socket, room) => {
        let list = getUsersInRoom(room);
        socket.emit('updateUsers', list);
        socket.broadcast.to(room).emit('updateUsers', list);
        return;
    }
    socket.on('join', ({ name, room }, callback) => {
        console.log(name, room)
        let { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        
        socket.join(user.room).emit();
        updatePlayers(socket, user.room);
        if (timers[room] != '') {
            io.to(user.room).emit('waitingTrue');
            clearInterval(timers[room]);
            console.log(timers[room])
        }
        timers[room] = '';
        console.log(timers[room])
        line_history[room] = []
        
    });

    socket.on('changeWaiting', (room) => {
        socket.broadcast.to(room).emit('waitingFalse');
    });

    

    socket.on('chosenWord', ({word, room, chosen, round}) => {
        updateRoom(room, word);
    })

    const emitChoice = (round, room, socket, word1, word2, word3, chosen) => {
        if (!socket) {
            clearInterval(timers[room]);
            return;
        }
        socket.emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
        socket.broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});
        console.log("emitted choice")
    }

    const emitTurn = (round, room, socket, chosen, word1) => {
        if (!socket) {
            clearInterval(timers[room]);
            return;
        }
        const t = setTimeout(() => {
            if (getWord(room) == '') {
                updateRoom(room, word1);
                socket.emit('myturn', {"chosen": chosen, "word": word1, "round": round});
                socket.broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
            } else {
                socket.emit('myturn', {"chosen": chosen, "word": getWord(room), "round": round});
                socket.broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
            }
            io.to(room).emit('resetTime');
            console.log("emitted reset time")
        }, choiceTime);
    }

    const gameOver = (room) => {
        const t = setTimeout(() => {
            io.to(room).emit('gameOver')
              clearInterval(timers[room]);
          }, choiceTime)
    }

    const resetPoints = (room) => {
        const users = getUsersInRoom(room);
        users.map(user => resetPoint(user.id));
        return;
    }

    socket.on('gameStart', ({ room, round }) => {
        resetPoints(room);
        addTotalScore(room);
        updatePlayers(socket, room);
        addRound(room);
        const { word1, word2, word3 } = chooseWord(round, room);
        const chosen = getUser(socket.id);
        changeTurn(socket.id, true);
        emitChoice(round, room, socket, word1, word2, word3, chosen);
        emitTurn(round, room, socket, chosen, word1);
        timers[room] = setInterval(() => {
            io.to(room).emit('message', { user: "admin", text: "word was "+ getWord(room) });
            addTotalScore(room);
            //line_history[room] = [];
            const { chosen, word1, word2, word3, round } = whoseTurn(room)
            const r = getRound(room);
            if (r > 5) {
                io.to(room).emit('spinner')
                gameOver(room);    
            } else {
                emitChoice(round, room, myClientList[chosen.id], word1, word2, word3, chosen); 
                emitTurn(round, room, myClientList[chosen.id], chosen, word1);
            }
        }, turnTime);
        
        
    })
    
    socket.on('emitDrawing', ({data, room}) => {
        //line_history[room].push(data);
        socket.broadcast.to(room).emit('draw_line', data);
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const text = checkWord(message, user.room);
        if (text === "Correct!"){
            const count = reduceTotalScore(user.room);
            addPoint(socket.id, count * 100);
            updatePlayers(socket, user.room);
        }
        io.to(user.room).emit('message', { user: user.name, text: text });
    
        callback();
      });

    socket.on('disconnect', () => {
        console.log('User has left');
        const user = getUser(socket.id)
        clearInterval(timers[user.room]);
        console.log(timers[user.room])
        io.to(user.room).emit('waitingTrue');
        removeRoom(user.room);
        removeUser(socket.id);
        delete myClientList[socket.id];
        let list = getUsersInRoom(user.room);
        io.to(user.room).emit('updateUsers', list);
        
        
    })
});

app.use(router);
app.options("/*", function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));


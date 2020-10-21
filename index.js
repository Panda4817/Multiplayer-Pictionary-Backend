const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint, changeHadPoints, resetHadPoints } = require('./users')
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
const turnTime = 36000

io.on('connection', (socket) => {
    console.log('We have a new connection');
    myClientList[socket.id] = socket;
    const updatePlayers = (socket, room) => {
        const list = getUsersInRoom(room);
        socket.emit('updateUsers', list);
        socket.broadcast.to(room).emit('updateUsers', list);
        return;
    }
    socket.on('join', ({ name, room }, callback) => {
        let { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        
        socket.join(user.room).emit();
        updatePlayers(socket, user.room);
        if (timers[room] != '') {
            clearInterval(timers[room]);
            io.to(user.room).emit('waitingTrue'); 
        }
        timers[room] = '';
        //line_history[room] = []
        
    });

    socket.on('changeWaiting', (room) => {
        socket.broadcast.to(room).emit('waitingFalse');
    });

    

    socket.on('chosenWord', ({word, room }) => {
        updateRoom(room, word);
    })

    const emitChoice = (round, room, socket, word1, word2, word3, chosen) => {
        if (!socket) {
            clearInterval(timers[room]);
            return;
        }
        socket.emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
        socket.broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});
    }

    const emitTurn = (round, room, socket, chosen, word1) => {
        if (!socket) {
            clearInterval(timers[room]);
            return;
        }
        console.log("start 5s choosing time", new Date().toLocaleTimeString())
        const t = setTimeout(() => {
            console.log("end 5s choosing time", new Date().toLocaleTimeString())
            if (getWord(room) == '') {
                updateRoom(room, word1);
                socket.emit('myturn', {"chosen": chosen, "word": word1, "round": round});
                socket.broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
            } else {
                socket.emit('myturn', {"chosen": chosen, "word": getWord(room), "round": round});
                socket.broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
            }
            io.to(room).emit('resetTime');
            console.log("turn starts", new Date().toLocaleTimeString())
            
        }, choiceTime);
        
    }

    const gameOver = (room) => {
        clearInterval(timers[room]);
        const t = setTimeout(() => {
            io.to(room).emit('gameOver')
          }, choiceTime)
        
    }

    const resetPoints = (room) => {
        const users = getUsersInRoom(room);
        users.map(user => resetPoint(user.id));
        return;
    }

    const resetPlayerHadPoints = (room) => {
        const users = getUsersInRoom(room);
        users.map(user => resetHadPoints(user.id));
        return;
    }

    const resetPlayerTurns = (room) => {
        const users = getUsersInRoom(room);
        users.map(u => changeTurn(u.id, false));
        return;
    }

    const restartGame = (room, socket) => {
        clearInterval(timers[room])
        timers[room] = '';
        console.log(timers[room])
        resetPoints(room);
        resetPlayerHadPoints(room);
        resetPlayerTurns(room);
        addTotalScore(room);
        addRound(room);
        updatePlayers(socket, room);
        socket.broadcast.to(room).emit('reset');
    }

    const turn = (socket, room) => {
        const user = getUser(socket.id);
        if (user === undefined || !user) {
            clearInterval(timers[room])
            return;
        }
        const r = getRound(room);
        if (user.turn === false) {
            const { word1, word2, word3 } = chooseWord(r, room);
            changeTurn(socket.id, true);
            emitChoice(r, room, socket, word1, word2, word3, user); 
            emitTurn(r, room, socket, user, word1);
        } else {
            io.to(room).emit('message', { user: "admin", text: "word was "+ getWord(room) });
            addTotalScore(room);
            resetPlayerHadPoints(room);
            const { chosen, word1, word2, word3, round } = whoseTurn(room)
            if (round > 5) {
                io.to(room).emit('spinner')
                gameOver(room);
                return;
            } else {
                emitChoice(round, room, myClientList[chosen.id], word1, word2, word3, chosen); 
                emitTurn(round, room, myClientList[chosen.id], chosen, word1);
            }
        }  
    }

    socket.on('gameStart', (room) => {
        restartGame(room, socket);
        turn(socket, room);
        console.log("start interval timer", new Date().toLocaleTimeString())
            timers[room] = setInterval(() => {
                console.log("interval timer completed", new Date().toLocaleTimeString())
                turn(socket, room);
            }, turnTime);  
        
        
        
        
    })
    
    socket.on('emitDrawing', ({data, room}) => {
        //line_history[room].push(data);
        socket.broadcast.to(room).emit('draw_line', data);
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        let text = checkWord(message, user.room);
        if (text === "Correct!"){
            if (user.hadPoints === true) {
                text = user.name[0].toUpperCase() + user.name.slice(1) + " already guessed right!"
            } else {
                changeHadPoints(socket.id);
                const count = reduceTotalScore(user.room);
                addPoint(socket.id, count * 100);
                updatePlayers(socket, user.room);
                text = user.name[0].toUpperCase() + user.name.slice(1) + " is correct!"
            }
            
        }
        io.to(user.room).emit('message', { user: user.name, text: text });
    
        callback();
      });

    socket.on('clear', (room) => {
        socket.broadcast.to(room).emit('clear');
    })

    socket.on('disconnect', () => {
        console.log('User has left');
        const user = getUser(socket.id);
        if (user === undefined || !user) {
            return;
        }
        clearInterval(timers[user.room]);
        io.to(user.room).emit('waitingTrue');
        removeRoom(user.room);
        delete myClientList[socket.id];
        removeUser(socket.id);
        const newlist = getUsersInRoom(user.room);
        io.to(user.room).emit('updateUsers', newlist);
        
        
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


const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom, changeTurn } = require('./users')
const { chooseWord, updateRoom, getWord, removeRoom } = require('./words')
const { addRound, increaseRound, getRound, whoseTurn } = require('./turn.js')

const PORT = process.env.PORT || 5000

const router = require('./router');
const { clearTimeout } = require('timers');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

const myClientList = {};

io.on('connection', (socket) => {
    console.log('We have a new connection');
    myClientList[socket.id] = socket;

    socket.on('join', ({ name, room }, callback) => {
        console.log(name, room)
        let { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        
        socket.join(user.room).emit();
        let list = getUsersInRoom(room)
        console.log(list)
        socket.emit('updateUsers', list);
        socket.broadcast.to(user.room).emit('updateUsers', list);
        
    });

    socket.on('changeWaiting', (room) => {
        socket.broadcast.to(room).emit('waitingFalse');
    });

    socket.on('chosenWord', ({word, room, chosen, round}) => {
        updateRoom(room, word);
    })

    socket.on('gameStart', ({ room, round }) => {
        addRound(room);
        const { word1, word2, word3 } = chooseWord(round, room);
        const chosen = getUser(socket.id);
        socket.emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
        socket.broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});
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
        }, 5000);
        const timer = setInterval(() => {
            const { chosen, word1, word2, word3, round } = whoseTurn(room)
            const r = getRound(room);
            if (r > 5) {
                socket.emit('gameOver')
                socket.broadcast.to(room).emit('gameOver')
                clearInterval(timer);
            } else {
                myClientList[chosen.id].emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
                myClientList[chosen.id].broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});   
                const t = setTimeout(() => {
                    if (getWord(room) == '') {
                        updateRoom(room, word1);
                        myClientList[chosen.id].emit('myturn', {"chosen": chosen, "word": word1, "round": round});
                        myClientList[chosen.id].broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});  
                    } else {
                        myClientList[chosen.id].emit('myturn', {"chosen": chosen, "word": getWord(room), "round": round});
                        myClientList[chosen.id].broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
                    }
                    io.to(room).emit('resetTime');    
                }, 5000);
            }
        }, 60000);
        
        
    })

    /*socket.on('whoseTurn', ({ round, room }) => {
        const users = getUsersInRoom(room)
        const users_false = users.filter(u => u.turn == false)
        console.log(users_false, users_false.length)
        if (users_false.length > 0){
            const chosen = users_false[Math.floor(Math.random()*users_false.length)];
            console.log(chosen)
            changeTurn(chosen.id, true);
            const word = chooseWord(round);
            updateRoom(room, word);
            socket.emit('turn', {"chosen": chosen, "word": word});
            socket.broadcast.to(room).emit('turn', {"chosen": chosen, "word": word}); 
        } else {
            socket.emit('round');
            socket.broadcast.to(room).emit('round');
            const usersReset = users.map(u => changeTurn(u.id, false));
            const chosen = users[Math.floor(Math.random()*users.length)];
            console.log(chosen)
            const word = chooseWord(round + 1);
            updateRoom(room, word);
            socket.emit('turn', {"chosen": chosen, "word": word});
            socket.broadcast.to(room).emit('turn', {"chosen": chosen, "word": word});
        }
    })*/

    /*socket.on('word', (room) =>{
        const chosen = getUser(socket.id)
        const round = getRound(room)
        const word = chooseWord(round);
        updateRoom(room, word);
        socket.emit('myturn', {"chosen": chosen, "word": word, "round": round});
        socket.broadcast.to(room).emit('turn', {"chosen": chosen, "round": round});
    });*/

    socket.on('startDrawing', ({ x, y }) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('startDrawing', { "x": x, "y": y });
    })
    socket.on('moveDrawing', ({ x, y }) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('moveDrawing', { "x": x, "y": y });
    })
    socket.on('endDrawing', () => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('endDrawing');
    })

    socket.on('disconnect', (room) => {
        console.log('User has left');
        const users = getUsersInRoom(room);
        if (users.length == 0){
            removeRoom(room);
        }
        removeUser(socket.id);
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


const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom, changeTurn } = require('./users')
const { chooseWord, updateRoom, getWord, removeRoom } = require('./words')
const { addRound, increaseRound, getRound, whoseTurn } = require('./turn.js')

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

const myClientList = {};
const rooms = {};
const line_history = {};

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
        if (rooms[room] != '') {
            io.to(user.room).emit('waitingTrue');
            clearInterval(rooms[room]);
            console.log(rooms[room])
        }
        rooms[room] = '';
        console.log(rooms[room])
        line_history[room] = []
        
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
        changeTurn(socket.id, true);
        socket.emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
        socket.broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});
        console.log("emitted choice")
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
        }, 5000);
        rooms[room] = setInterval(() => {
            line_history[room] = [];
            const { chosen, word1, word2, word3, round } = whoseTurn(room)
            console.log(chosen, round)
            const r = getRound(room);
            if (r > 5) {
                const t = setTimeout(() => {
                  io.to(room).emit('gameOver')
                    clearInterval(rooms[room]);
                }, 5000)
                
            } else {
                myClientList[chosen.id].emit('choice', {"chosen": chosen, "word1": word1, "word2": word2, "word3": word3,  "round": round})
                myClientList[chosen.id].broadcast.to(room).emit('choosing', {"chosen": chosen, "round": round});   
                console.log("emitted choice")
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
                    console.log("emitted reset time")    
                }, 5000);
            }
        }, 10000);
        
        
    })
    
    socket.on('emitDrawing', ({data, room}) => {
        line_history[room].push(data);
        socket.broadcast.to(room).emit('draw_line', data);
    })

    socket.on('disconnect', () => {
        console.log('User has left');
        const user = getUser(socket.id)
        console.log(rooms[user.room])
        clearInterval(rooms[user.room]);
        console.log(rooms[user.room])
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


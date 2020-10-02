const express = require('express');
const socketio = require('socket.io');
const cors = require('cors')
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom, changeTurn } = require('./users')
const { chooseWord, updateRoom, getWord, removeRoom } = require('./words')

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('We have a new connection');

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

    socket.on('whoseTurn', ({round, room}) => {
        const users = getUsersInRoom(room)
        const users_false = users.filter(u => u.turn == false)
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
    })
    socket.on('word', (round) =>{
        const chosen = getUser(socket.id)
        const word = chooseWord(round);
        updateRoom(chosen.room, word);
        socket.emit('turn', {"chosen": chosen , "word": word});
        socket.emit('skipped');
        socket.broadcast.to(chosen.room).emit('skipped');
    });

    socket.on('startDrawing', ({ x, y }) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('startDrawing', { x, y });
    })
    socket.on('moveDrawing', ({ x, y }) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('moveDrawing', { x, y });
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


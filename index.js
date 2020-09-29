const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
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
    })

    socket.on('disconnect', () => {
        console.log('User has left');
        removeUser(socket.id);
    })
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));


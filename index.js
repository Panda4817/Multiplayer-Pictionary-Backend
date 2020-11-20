// Importing packages
const express = require('express')
const socketio = require('socket.io')
const cors = require('cors')
const http = require('http')

// My custom modules and their functions imported
const { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint, changeHadPoints, resetHadPoints } = require('./users')
const { chooseWord, updateRoom, getWord, removeRoom, checkWord } = require('./words')
const { addRound, increaseRound, getRound, whoseTurn } = require('./turn')
const { addTotalScore, reduceTotalScore } = require('./score')

// App set up
const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = socketio(server)

// List of all client sockets
const myClientList = {}
// Timers per room
const timers = {}
// Standard times for choosing and drawing
const choiceTime = 5000
const turnTime = 36000
//Standard number of rounds
const ROUND = 5
// List of current person drawing per room
const currentArtist = {}
// Line history
const lines = {}

// All functions over sockets
io.on('connection', (socket) => {
    console.log('We have a new connection')
    // Add new socket connection
    myClientList[socket.id] = socket

    // Function to emit any change to player data (room players)
    const updatePlayers = (socket, room) => {
        const list = getUsersInRoom(room)
        if (list.length == 1) {
            timers[room] = ''
        }
        socket.emit('updateUsers', list)
        socket.broadcast.to(room).emit('updateUsers', list)
        return
    }

    // Join event to handle new players joining
    socket.on('join', ({ name, room, avatar }, callback) => {
        let { error, user } = addUser({ id: socket.id, name, room, avatar })
        console.log(user)
        if (error) return callback(error)

        socket.join(user.room).emit()
        updatePlayers(socket, user.room)
        // Update player with line data if game has already started
        if (timers[room] != '') {
            socket.emit('waitingFalse')
            if (lines[room]) {
                lines[room].map((data) => {
                    socket.emit('draw_line', data)
                })  
            }
            addTotalScore(room)
            socket.emit('message', { user: "admin", text: "You have joined an existing game. The timer and round number will update in the next turn. You can guess now." })
            socket.broadcast.to(room).emit('message', { user: "admin", text: user.name[0].toUpperCase() + user.name.slice(1) + " has joined!" })
        }
    })

    // change waiting event, emits when game started to let everyone enter the game room 
    socket.on('changeWaiting', (room) => {
        socket.broadcast.to(room).emit('waitingFalse')
    })


    // chosen word event, updates room information
    socket.on('chosenWord', ({ word, room }) => {
        updateRoom(room, word)
    })

    // Function to handle what happens when it is player choosing time
    const emitChoice = (round, room, socket, word1, word2, word3, chosen) => {
        if (!socket) {
            clearInterval(timers[room])
            timers[room] = ''
            io.to(room).emit('gameOver')
            return
        }
        socket.emit('choice', { "chosen": chosen, "word1": word1, "word2": word2, "word3": word3, "round": round })
        socket.broadcast.to(room).emit('choosing', { "chosen": chosen, "round": round })
    }

    // Function to handle what happens when it is player drawing time
    const emitTurn = (round, room, socket, chosen, word1) => {
        if (!socket) {
            clearInterval(timers[room])
            timers[room] = ''
            io.to(room).emit('gameOver')
            return
        }
        console.log("start 5s choosing time", new Date().toLocaleTimeString())
        const t = setTimeout(() => {
            console.log("end 5s choosing time", new Date().toLocaleTimeString())
            if (getWord(room) == '') {
                updateRoom(room, word1)
                socket.emit('myturn', { "chosen": chosen, "word": word1, "round": round })
                socket.broadcast.to(room).emit('turn', { "chosen": chosen, "round": round })
            } else {
                socket.emit('myturn', { "chosen": chosen, "word": getWord(room), "round": round })
                socket.broadcast.to(room).emit('turn', { "chosen": chosen, "round": round })
            }
            io.to(room).emit('resetTime')
            console.log("turn starts", new Date().toLocaleTimeString())

        }, choiceTime)

    }

    // Function to handle what happens when game is over, emits game over event
    const gameOver = (room) => {
        clearInterval(timers[room])
        timers[room] = ''
        io.to(room).emit('spinner')
        const t = setTimeout(() => {
            io.to(room).emit('gameOver')
        }, choiceTime)

    }

    // A function to handle resetting points for each player in the room
    const resetPoints = (room) => {
        const users = getUsersInRoom(room)
        users.map(user => resetPoint(user.id))
        return
    }

    // A function to reset the hadPoints property for each user
    const resetPlayerHadPoints = (room) => {
        const users = getUsersInRoom(room)
        users.map(user => resetHadPoints(user.id))
        return
    }

    // A function to handle changing turn property for each user in the room
    const resetPlayerTurns = (room) => {
        const users = getUsersInRoom(room)
        users.map(u => changeTurn(u.id, false))
        return
    }

    // A function to handle the restart of a game
    const restartGame = (room, socket) => {
        clearInterval(timers[room])
        timers[room] = ''
        currentArtist[room] = ''
        lines[room] = []
        console.log(timers[room])
        resetPoints(room)
        resetPlayerHadPoints(room)
        resetPlayerTurns(room)
        addTotalScore(room)
        addRound(room)
        updatePlayers(socket, room)
        socket.broadcast.to(room).emit('reset')
    }

    // a function  to handle the turn logic 
    const turn = (room) => {
        if (getWord(room)) {
            io.to(room).emit('message', { user: "admin", text: "word was " + getWord(room) })
        }
        addTotalScore(room)
        resetPlayerHadPoints(room)
        lines[room] = []
        const { chosen, word1, word2, word3, round } = whoseTurn(room)
        if (chosen === undefined || !chosen) {
            clearInterval(timers[room])
            timers[room] = ''
            io.to(room).emit('gameOver')
            return
        }
        currentArtist[room] = chosen.id
        if (round > ROUND) {
            gameOver(room)
            return
        } else {
            emitChoice(round, room, myClientList[chosen.id], word1, word2, word3, chosen)
            emitTurn(round, room, myClientList[chosen.id], chosen, word1)
        }
    }

    // game start event, starts turn logic
    socket.on('gameStart', (room) => {
        restartGame(room, socket)
        turn(room)
        console.log("start interval timer", new Date().toLocaleTimeString())
        timers[room] = setInterval(() => {
            console.log("interval timer completed", new Date().toLocaleTimeString())
            turn(room)
        }, turnTime)




    })

    // emit drawing event, emits drawing data to players
    socket.on('emitDrawing', ({ data, room }) => {
        if (lines[room]) {
           lines[room].push(data) 
        } else {
            lines[room] = []
            lines[room].push(data) 
        }
        
        socket.broadcast.to(room).emit('draw_line', data)
    })

    // send message event, emits whether guess was right or wrong to all players
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        let text = checkWord(message, user.room)
        if (text === "Correct!") {
            if (user.hadPoints === true) {
                text = user.name[0].toUpperCase() + user.name.slice(1) + " already guessed right!"
            } else {
                changeHadPoints(socket.id)
                const count = reduceTotalScore(user.room)
                addPoint(socket.id, count * 100)
                addPoint(currentArtist[user.room], 100)
                updatePlayers(socket, user.room)
                text = user.name[0].toUpperCase() + user.name.slice(1) + " is correct!"
            }

        }
        io.to(user.room).emit('message', { user: user.name, text: text, img: user.avatar })

        callback()
    })

    // clear event, emits clear canvas event to players
    socket.on('clear', (room) => {
        lines[room] = []
        socket.broadcast.to(room).emit('clear')
    })

    // undo event, emits undo event to players (so all players in the room see the same drawing)
    socket.on('undo', (room) => {
        lines[room] = lines[room].slice(0, -10)
        socket.broadcast.to(room).emit('undo')
    })

    // disconnect event, when player leaves the room
    socket.on('disconnect', () => {
        console.log('User has left')
        const user = getUser(socket.id)
        if (user === undefined || !user) {
            return
        }
        delete myClientList[socket.id]
        removeUser(socket.id)
        const newlist = getUsersInRoom(user.room)
        io.to(user.room).emit('updateUsers', newlist)
        // If the current number of players in the room is less than 2, last player kicked to the waiting room
        if (newlist.length < 2) {
            clearInterval(timers[user.room])
            timers[user.room] = ''
            io.to(user.room).emit('waitingTrue')
            removeRoom(user.room)
        // Else, users are sent a message stating a player has left
        } else {
            addTotalScore(user.room)
            io.to(user.room).emit('message', { user: "admin", text: user.name[0].toUpperCase() + user.name.slice(1) + " has left! If they were drawing, wait for their turn to end to continue." })
        }


    })
})

app.use(router)
app.options("/*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://picto.netlify.app')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    res.sendStatus(200)
})

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    next()
})

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`))
module.exports = server

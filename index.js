// Importing packages
require("dotenv").config();
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const http = require("http");

// My custom modules and their functions imported
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	changeTurn,
	addPoint,
	resetPoint,
	changeHadPoints,
	resetHadPoints,
	resetPoints,
	resetPlayerHadPoints,
	resetPlayerTurns,
} = require("./users");
const {
	chooseWord,
	updateRoom,
	getWord,
	removeRoom,
	checkWord,
} = require("./words");
const {
	addRound,
	increaseRound,
	getRound,
	whoseTurn,
} = require("./turn");
const {
	addTotalScore,
	reduceTotalScore,
	getTotalScore,
} = require("./score");
const {
	myClientList,
	timers,
	lines,
	currentArtist,
	choiceTime,
	turnTime,
	ROUND,
	updatePlayers,
	socketCheck,
	emitChoice,
	emitTurn,
	gameOver,
	restartGame,
	turn,
	updateMsgTextAndAddPoints,
	disconnectCleanUp,
} = require("./socketio_util");

// App set up
const PORT = process.env.PORT || 5000;
const router = require("./router");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketio(server, {
	allowEIO3: false,
	cors: {
		origin: "https://picto.netlify.app", //"http://localhost:3000",
		methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Content-Length",
			"X-Requested-With",
		],
		credentials: true,
	},
});

// socket events
io.on("connection", (socket) => {
	console.log("We have a new connection", socket.id);
	// Add new socket connection
	myClientList[socket.id] = socket;

	// Join event to handle new players joining
	socket.on("join", ({ name, room, avatar }, callback) => {
		let { error, user } = addUser({
			id: socket.id,
			name,
			room,
			avatar,
		});
		if (error) return callback(error);

		socket.join(user.room);
		socket.emit();
		updatePlayers(socket, user.room);
		// Update player with line data if game has already started
		if (timers[room] != undefined) {
			socket.emit("waitingFalse");
			if (lines[room]) {
				lines[room].map((data) => {
					socket.emit("draw_line", data);
				});
			}
			addTotalScore(room);
			socket.emit("message", {
				user: "admin",
				text: "You have joined an existing game. The timer and round number will update in the next turn. You can guess now.",
			});
			socket.broadcast
				.to(room)
				.emit("message", {
					user: "admin",
					text:
						user.name[0].toUpperCase() +
						user.name.slice(1) +
						" has joined!",
				});
		}
	});

	// change waiting event, emits when game started to let everyone enter the game room
	socket.on("changeWaiting", (room) => {
		socket.broadcast.to(room).emit("waitingFalse");
	});

	// chosen word event, updates room information
	socket.on("chosenWord", ({ word, room }) => {
		updateRoom(room, word);
	});

	// game start event, starts turn logic
	socket.on("gameStart", (room) => {
		restartGame(room, socket);
		turn(room, io);
		console.log(
			"start interval timer",
			new Date().toLocaleTimeString()
		);
		timers[room] = setInterval(() => {
			console.log(
				"interval timer completed",
				new Date().toLocaleTimeString()
			);
			turn(room, io);
		}, turnTime);
	});

	// emit drawing event, emits drawing data to players
	socket.on("emitDrawing", ({ data, room }) => {
		if (lines[room]) {
			lines[room].push(data);
		} else {
			lines[room] = [];
			lines[room].push(data);
		}
		socket.broadcast.to(room).emit("draw_line", data);
	});

	// send message event, emits whether guess was right or wrong to all players
	socket.on("sendMessage", (message, callback) => {
		const user = getUser(socket.id);
		const text = updateMsgTextAndAddPoints(
			socket,
			user,
			message
		);
		io.to(user.room).emit("message", {
			user: user.name,
			text: text,
			img: user.avatar,
		});
		callback();
	});

	// clear event, emits clear canvas event to players
	socket.on("clear", (room) => {
		lines[room] = [];
		socket.broadcast.to(room).emit("clear");
	});

	// undo event, emits undo event to players (so all players in the room see the same drawing)
	socket.on("undo", (room) => {
		lines[room] = lines[room].slice(0, -10);
		socket.broadcast.to(room).emit("undo");
	});

	// disconnect event, when player leaves the room
	socket.on("disconnect", () => {
		console.log("User has left", socket.id);
		disconnectCleanUp(socket, io);
	});
});

app.use(router);
app.options("/*", function (req, res, next) {
	res.header(
		"Access-Control-Allow-Origin",
		"https://picto.netlify.app"
	);
	res.header(
		"Access-Control-Allow-Methods",
		"GET,PUT,POST,DELETE,OPTIONS"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, Content-Length, X-Requested-With"
	);
	res.sendStatus(200);
});

app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

server.listen(PORT, () =>
	console.log(`Server has started on port ${PORT}`)
);

module.exports = { server };

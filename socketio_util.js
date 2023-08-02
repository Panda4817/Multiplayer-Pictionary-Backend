import { removeUser, getUser, getUsersInRoom, addPoint, changeHadPoints, resetPoints, resetPlayerHadPoints, resetPlayerTurns } from "./users.js";
import { updateRoom, getWord, removeRoom, checkWord } from "./words.js";
import { addRound, whoseTurn } from "./turn.js";
import { addTotalScore, reduceTotalScore } from "./score.js";
// import {sendRoomStats} from "./kafka.js";

// Standard times for choosing and drawing
export const envDependentVariables = (process) => {
	let choiceTime = 1000;
	let turnTime = 2000;
	let ROUND = 1;
	if (process.env.TEST == "false") {
		choiceTime = 5000;
		turnTime = 36000;
		ROUND = 5;
	}
	return [choiceTime, turnTime, ROUND];
};
export const [choiceTime, turnTime, ROUND] = envDependentVariables(process);

// List of all client sockets
export const myClientList = {};
// Timers per room
export const timers = {};
// List of current person drawing per room
export const currentArtist = {};
// Line history
export const lines = {};

// Function to emit any change to player data (room players)
export const updatePlayers = (socket, room) => {
	const list = getUsersInRoom(room);
	if (list.length == 1) {
		timers[room] = undefined;
	}
	socket.emit("updateUsers", list);
	socket.broadcast.to(room).emit("updateUsers", list);
	return;
};

// Function to hand no socket
export const socketCheck = (socket, room, io) => {
	if (socket === undefined || !socket) {
		clearInterval(timers[room]);
		timers[room] = undefined;
		const operator = io.to(room);
		operator.emit("gameOver");
		return true;
	}
	return false;
};

// Function to handle what happens when it is player choosing time
export const emitChoice = (round, room, socket, word1, word2, word3, chosen, io) => {
	if (socketCheck(socket, room, io)) {
		return;
	}
	socket.emit("choice", { chosen: chosen, word1: word1, word2: word2, word3: word3, round: round });
	socket.broadcast.to(room).emit("choosing", { chosen: chosen, round: round });
};

// Function to handle what happens when it is player drawing time
export const emitTurn = (round, room, socket, chosen, word1, io) => {
	if (socketCheck(socket, room, io)) {
		return;
	}
	console.log("start 5s choosing time", new Date().toLocaleTimeString());
	const t = setTimeout(() => {
		console.log("end 5s choosing time", new Date().toLocaleTimeString());
		if (getWord(room) == "") {
			updateRoom(room, word1);
			socket.emit("myturn", { chosen: chosen, word: word1, round: round });
			socket.broadcast.to(room).emit("turn", { chosen: chosen, round: round });
		} else {
			socket.emit("myturn", { chosen: chosen, word: getWord(room), round: round });
			socket.broadcast.to(room).emit("turn", { chosen: chosen, round: round });
		}
		io.to(room).emit("resetTime");
		console.log("turn starts", new Date().toLocaleTimeString());
	}, choiceTime);
};

// Function to handle what happens when game is over, emits game over event
export const gameOver = (room, io) => {
	clearInterval(timers[room]);
	timers[room] = undefined;
	io.to(room).emit("spinner");
	const t = setTimeout(() => {
		io.to(room).emit("gameOver");
	}, choiceTime);
};

// A function to handle the restart of a game
export const restartGame = (room, socket) => {
	clearInterval(timers[room]);
	timers[room] = undefined;
	currentArtist[room] = "";
	lines[room] = [];
	console.log("timer for ", room, timers[room]);
	resetPoints(room);
	resetPlayerHadPoints(room);
	resetPlayerTurns(room);
	addTotalScore(room);
	addRound(room);
	updatePlayers(socket, room);
	// sendRoomStats(getUsersInRoom(room).length).then(console.log).catch((e) => console.log(e.message));
	socket.broadcast.to(room).emit("reset");
};

// a function  to handle the turn logic
export const turn = (room, io) => {
	if (getWord(room)) {
		const operator = io.to(room);
		operator.emit("message", { user: "admin", text: "word was " + getWord(room) });
	}
	addTotalScore(room);
	resetPlayerHadPoints(room);
	lines[room] = [];
	const { chosen, word1, word2, word3, round } = whoseTurn(room);
	if (socketCheck(chosen, room, io)) {
		return;
	}
	currentArtist[room] = chosen.id;
	if (round > ROUND) {
		gameOver(room, io);
		return;
	} else {
		emitChoice(round, room, myClientList[chosen.id], word1, word2, word3, chosen, io);
		emitTurn(round, room, myClientList[chosen.id], chosen, word1, io);
	}
};

// Send Message event function - checks message, adds points
export const updateMsgTextAndAddPoints = (socket, user, message) => {
	let text = checkWord(message, user.room);
	if (text === "Correct!") {
		if (user.hadPoints === true) {
			text = user.name[0].toUpperCase() + user.name.slice(1) + " already guessed right!";
		} else {
			changeHadPoints(socket.id);
			const count = reduceTotalScore(user.room);
			addPoint(socket.id, count * 100);
			addPoint(currentArtist[user.room], 100);
			updatePlayers(socket, user.room);
			text = user.name[0].toUpperCase() + user.name.slice(1) + " is correct!";
		}
	}
	return text;
};

// Disconnect clean up function
export const disconnectCleanUp = (socket, io) => {
	delete myClientList[socket.id];
	const user = getUser(socket.id);
	if (user === undefined || !user) {
		return;
	}
	removeUser(socket.id);
	const newList = getUsersInRoom(user.room);
	const operator = io.to(user.room);
	operator.emit("updateUsers", newList);
	// If the current number of players in the room is less than 2, last player kicked to the waiting room
	if (newList.length < 2) {
		clearInterval(timers[user.room]);
		timers[user.room] = undefined;
		removeRoom(user.room);
		delete lines[user.room];
		delete currentArtist[user.room];
		const operator = io.to(user.room);
		operator.emit("waitingTrue");
		// Else, users are sent a message stating a player has left
	} else {
		addTotalScore(user.room);
		const operator = io.to(user.room);
		operator.emit("message", {
			user: "admin",
			text:
				user.name[0].toUpperCase() +
				user.name.slice(1) +
				" has left! If they were drawing, wait for their turn to end to continue.",
		});
	}
};

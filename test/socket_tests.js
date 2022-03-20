const chai = require("chai");
const assert = chai.assert;
const { server, io } = require("../index");
const io_client = require("socket.io-client");
const socketURL = "http://localhost:5001";
const options = {
	transports: ["websocket"],
	forceNew: true,
};

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
} = require("../users");
const { chooseWord, updateRoom, getWord, removeRoom, checkWord } = require("../words");
const { addRound, increaseRound, getRound, whoseTurn } = require("../turn");
const { addTotalScore, reduceTotalScore, getTotalScore } = require("../score");
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
} = require("../socketio_util");

// global variables
const avatar = "0x1F600";
const n1 = "test";
const n2 = "test2";
const n3 = "test3";
const small_time = 20;
const medium_time = 30;

describe("Socket integration tests", function () {
	let sockets;
	let room;
	beforeEach(() => {
		sockets = [];
		room = randomRoomName();
		server.listen(5001);
	});
	afterEach(() => {
		sockets.forEach((e) => e.disconnect());
		server.close();
	});

	const makeSocket = () => {
		const socket = io_client.connect(socketURL, options);
		socket.on("connection", function () {
			assert.deepEqual(myClientList[socket.id], socket);
		});
		socket.on("disconnect", function () {
			assert.equal(myClientList[socket.id], undefined);
			assert.equal(getUser(socket.id), undefined);
			let others = getUsersInRoom(room);
			if (others < 2) {
				assert.equal(timers[room], undefined);
				assert.equal(getWord(room), undefined);
				assert.equal(lines[room], undefined);
				assert.equal(currentArtist[room], undefined);
			} else {
				assert.equal(addTotalScore(room), others.length);
			}
		});

		sockets.push(socket);
		return socket;
	};

	const randomRoomName = () => {
		return "testsocket" + Math.floor(Math.random() * 100).toString(10);
	};

	it("No socket, socketCheck returns true", function (done) {
		const socket = undefined;
		let ans = socketCheck(socket, room, io);
		assert.equal(ans, true);
		ans = emitTurn(1, room, socket, socket, "", io);
		assert.equal(ans, undefined);
		ans = emitChoice(1, room, socket, "", "", "", socket, io);
		assert.equal(ans, undefined);
		room = randomRoomName();
		ans = turn(room, io);
		assert.equal(ans, undefined);
		done();
	});

	it("join event, 1 person in room", function (done) {
		// arrange
		const socket = makeSocket();
		console.log(room);
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket.on("updateUsers", (data) => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 1);
			assert.deepEqual(data, users);
			done();
		});
	});

	it("join event via update", function (done) {
		// arrange
		const socket = makeSocket();
		console.log(room);
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: true });
		socket.on("updateUsers", (data) => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 1);
			assert.deepEqual(data, users);
			done();
		});
	});

	it("join event, 2 people in room", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		setTimeout(() => {
			socket2.emit("join", { name: n2, room, avatar, update: false });
			socket.on("updateUsers", (data2) => {
				console.log("client1 receives updated list");
				const users2 = getUsersInRoom(room);
				assert.equal(users2.length, 2);
				assert.deepEqual(data2, users2);
			});
			socket2.on("updateUsers", (data2) => {
				console.log("client2 receives updated list");
				const users2 = getUsersInRoom(room);
				assert.equal(users2.length, 2);
				assert.deepEqual(data2, users2);
				done();
			});
		}, medium_time);
	});

	it("disconnection event, 1 person leaves, other person kicked to waiting room", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		setTimeout(() => {
			socket.disconnect();
			socket2.on("waitingTrue", () => {
				console.log("other player kicked to waiting room");
				assert.equal(getUsersInRoom(room).length, 1);
				done();
			});
		}, small_time);
	});

	it("disconnection event, 1 person leaves, other 2 people get a message from the admin", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket3.emit("join", { name: n3, room, avatar, update: false });
		setTimeout(() => {
			socket.disconnect();
			socket2.on("message", (data) => {
				console.log("client2 received admin message");
				assert.hasAllDeepKeys(data, ["user", "text"]);
				assert.deepEqual(data, {
					user: "admin",
					text: "Test has left! If they were drawing, wait for their turn to end to continue.",
				});
			});
			socket3.on("message", (data) => {
				console.log("client3 received admin message");
				assert.hasAllDeepKeys(data, ["user", "text"]);
				assert.deepEqual(data, {
					user: "admin",
					text: "Test has left! If they were drawing, wait for their turn to end to continue.",
				});
				done();
			});
		}, medium_time);
	});

	it("join event, error thrown if two people same room and same name", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		const callback = (err) => {
			console.log(err);
			assert.notEqual(err, null);
			assert.isString(err);
			done();
		};
		socket2.emit("join", { name: n1, room, avatar }, callback);
	});

	it("join event, error thrown if room name is empty", function (done) {
		// arrange
		const socket = makeSocket();
		// act and assert
		const callback = (err) => {
			console.log(err);
			assert.notEqual(err, null);
			assert.isString(err);
			done();
		};
		socket.emit("join", { name: n1, room: "", avatar, update: false }, callback);
	});

	it("join event, error thrown if username is empty", function (done) {
		// arrange
		const socket = makeSocket();
		// act and assert
		const callback = (err) => {
			console.log(err);
			assert.notEqual(err, null);
			assert.isString(err);
			done();
		};
		socket.emit("join", { name: "", room, avatar, update: false }, callback);
	});

	it("gameStart event - reset emitted", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		socket.on("reset", () => {
			console.log("reset emitted to other players");
			assert.isTrue(true);
			done();
		});
	});

	it("gameStart event - admin messages last word from last turn", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		updateRoom(room, "testword");
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		setTimeout(() => {
			socket2.emit("gameStart", room);
			socket2.on("message", (data) => {
				console.log("client 2 receives last word");
				assert.deepEqual(data, { user: "admin", text: "word was testword" });
			});
			socket.on("message", (data) => {
				console.log("client 1 receives last word");
				assert.deepEqual(data, { user: "admin", text: "word was testword" });
				done();
			});
		}, small_time);
	});

	it("gameStart event - choice event emitted", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		setTimeout(() => {
			socket2.emit("gameStart", room);
			socket.on("choice", (data) => {
				console.log(typeof data, " sent to client 1");
				assert.hasAllDeepKeys(data, ["chosen", "word1", "word2", "word3", "round"]);
				assert.equal(getTotalScore(room), 2);
				assert.isTrue(getUser(socket.id)["turn"]);
				assert.equal(currentArtist[room], socket.id);
				assert.deepEqual(lines[room], []);
				done();
			});
		}, choiceTime + small_time);
	});

	it("gameStart event - choosing event emitted", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });

		setTimeout(() => {
			socket2.emit("gameStart", room);
			socket.on("choosing", (data) => {
				console.log(typeof data, " sent to client 1");
				assert.hasAllDeepKeys(data, ["chosen", "round"]);
				assert.equal(getTotalScore(room), 2);
				assert.isTrue(getUser(socket2.id)["turn"]);
				assert.equal(currentArtist[room], socket2.id);
				assert.deepEqual(lines[room], []);
				done();
			});
		}, choiceTime + small_time);
	});

	it("gameStart event - myturn event emitted", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });

		setTimeout(() => {
			socket2.emit("gameStart", room);
		}, small_time);
		setTimeout(() => {
			socket.on("myturn", (data) => {
				console.log(typeof data, " sent to client 1");
				assert.hasAllDeepKeys(data, ["chosen", "word", "round"]);
				assert.equal(getTotalScore(room), 2);
				assert.isTrue(getUser(socket.id)["turn"]);
				assert.equal(currentArtist[room], socket.id);
				assert.deepEqual(lines[room], []);
				done();
			});
		}, choiceTime + small_time);
	});

	it("gameStart event - turn event emitted", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });

		setTimeout(() => {
			socket2.emit("gameStart", room);
		}, small_time);
		setTimeout(() => {
			socket.on("turn", (data) => {
				console.log(typeof data, " sent to client 1");
				assert.hasAllDeepKeys(data, ["chosen", "round"]);
				assert.equal(getTotalScore(room), 2);
				assert.isTrue(getUser(socket2.id)["turn"]);
				assert.equal(currentArtist[room], socket2.id);
				assert.deepEqual(lines[room], []);
				done();
			});
		}, choiceTime + small_time);
	});

	it("gameStart event - resetTime event emitted", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });

		setTimeout(() => {
			socket2.emit("gameStart", room);
		}, small_time);
		setTimeout(() => {
			socket2.on("resetTime", () => {
				console.log("resetTime event fired to everyone in room client 2 test");
				assert.isTrue(true);
			});
			socket.on("resetTime", () => {
				console.log("resetTime event fired to everyone in room client 1 test");
				assert.isTrue(true);
				done();
			});
		}, choiceTime + small_time);
	});

	it("gameStart event - gameOver function runs after const ROUND reached, spinner event fired", function (done) {
		this.timeout(5000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		setTimeout(() => {
			socket2.emit("gameStart", room);
			socket.on("spinner", () => {
				console.log("spinner event fired client 1");
				assert.deepEqual(timers[room], undefined);
			});
			socket2.on("spinner", () => {
				console.log("spinner event fired client 2");
				assert.deepEqual(timers[room], undefined);
				done();
			});
		}, small_time);
	});

	it("gameStart event - gameOver function runs after const ROUND reached, gameOver event fired", function (done) {
		this.timeout(6000);
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		setTimeout(() => {
			socket.on("gameOver", () => {
				console.log("gameOver event fired client 1");
				assert.deepEqual(timers[room], undefined);
			});
			socket2.on("gameOver", () => {
				console.log("gameOver event fired client 2");
				assert.deepEqual(timers[room], undefined);
				done();
			});
		}, turnTime * 2);
	});

	it("join event, joining an existing game - waiting false", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		setTimeout(() => {
			socket3.emit("join", { name: n3, room, avatar, update: false });
			socket3.on("waitingFalse", () => {
				console.log("waiting is false so taken straight to game");
				const totalScore = addTotalScore(room);
				assert.equal(totalScore, 3);
				done();
			});
		}, small_time);
	});

	it("join event, joining an existing game - draw_line event", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();
		const data = {
			x0: 0.1,
			y0: 0.1,
			x1: 1,
			y1: 2,
			c: "black",
			l: 5,
		};

		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		setTimeout(() => {
			lines[room] = [data];
		}, small_time);
		setTimeout(() => {
			socket3.emit("join", { name: n3, room, avatar, update: false });
			assert.deepEqual(lines[room], [data]);
			socket3.on("draw_line", (sent_data) => {
				console.log("line history data emitted");
				assert.deepEqual(sent_data, data);
				done();
			});
		}, medium_time);
	});

	it("join event, joining an existing game - message for joined user", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		setTimeout(() => {
			socket3.emit("join", { name: n3, room, avatar, update: false });

			socket3.on("message", (obj) => {
				console.log("admin sends message to connected user");
				assert.equal(
					obj["text"],
					"You have joined an existing game. The timer and round number will update in the next turn. You can guess now."
				);
				assert.equal(obj["user"], "admin");
				done();
			});
		}, small_time);
	});

	it("join event, joining an existing game - message for other players", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);

		setTimeout(() => {
			socket3.emit("join", { name: n3, room, avatar, update: false });
			socket.on("message", (obj2) => {
				console.log("admin sends message to all other users client 1 test");
				assert.equal(obj2["text"], "Test3 has joined!");
				assert.equal(obj2["user"], "admin");
			});
			socket2.on("message", (obj3) => {
				console.log("admin sends message to all other users client 2 test");
				assert.equal(obj3["text"], "Test3 has joined!");
				assert.equal(obj3["user"], "admin");
				done();
			});
		}, small_time);
	});

	it("join event, joining an existing game - no lines", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const socket3 = makeSocket();

		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket2.emit("gameStart", room);
		setTimeout(() => {
			lines[room] = undefined;
		}, small_time);
		setTimeout(() => {
			socket3.emit("join", { name: n3, room, avatar, update: false });
			assert.deepEqual(lines[room], undefined);
			done();
		}, medium_time);
	});

	it("changeWaiting event", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();

		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });

		setTimeout(() => {
			socket.emit("changeWaiting", room);
			socket2.on("waitingFalse", () => {
				console.log("waiting is false for everyone in the room");
				assert.isFalse(false);
				done();
			});
		}, small_time);
	});

	it("chosenWord event", function (done) {
		// arrange
		const socket = makeSocket();
		const word = "testword";

		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket.emit("chosenWord", { word, room });

		setTimeout(() => {
			const received_word = getWord(room);
			assert.equal(received_word, word);
			done();
		}, medium_time);
	});

	it("emitDrawing event", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const data = {
			x0: 0.1,
			y0: 0.1,
			x1: 1,
			y1: 2,
			c: "black",
			l: 5,
		};
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		assert.equal(lines[room], undefined);
		setTimeout(() => {
			socket.emit("emitDrawing", { data, room });
			socket2.on("draw_line", (sent_data) => {
				assert.deepEqual(sent_data, data);
				assert.deepEqual(lines[room], [data]);
				done();
			});
		}, medium_time);
	});

	it("emitDrawing event x2", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const data = {
			x0: 0.1,
			y0: 0.1,
			x1: 1,
			y1: 2,
			c: "black",
			l: 5,
		};
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		assert.equal(lines[room], undefined);
		socket.emit("emitDrawing", { data, room });
		setTimeout(() => {
			assert.equal(lines[room].length, 1);
		}, small_time);
		setTimeout(() => {
			socket.emit("emitDrawing", { data, room });
			socket2.on("draw_line", (sent_data) => {
				assert.deepEqual(sent_data, data);
				assert.deepEqual(lines[room], [data, data]);
				done();
			});
		}, medium_time);
	});

	it("clear event", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const data = {
			x0: 0.1,
			y0: 0.1,
			x1: 1,
			y1: 2,
			c: "black",
			l: 5,
		};
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		socket.emit("emitDrawing", { data, room });
		setTimeout(() => {
			assert.equal(lines[room].length, 1);
		}, small_time);
		setTimeout(() => {
			socket.emit("clear", room);
			socket2.on("clear", () => {
				console.log("clear event emitted to other players in the room");
				assert.deepEqual(lines[room], []);
				done();
			});
		}, medium_time);
	});

	it("undo event", function (done) {
		const socket = makeSocket();
		const socket2 = makeSocket();
		const data = {
			x0: 0.1,
			y0: 0.1,
			x1: 1,
			y1: 2,
			c: "black",
			l: 5,
		};
		lines[room] = [];
		// act and assert
		socket.emit("join", { name: n1, room, avatar, update: false });
		socket2.emit("join", { name: n2, room, avatar, update: false });
		for (let i = 0; i < 11; i++) {
			lines[room].push(data);
			assert.equal(lines[room].length, i + 1);
		}
		setTimeout(() => {
			socket.emit("undo", room);
			socket2.on("undo", () => {
				console.log("undo event emitted to other players in the room");
				assert.deepEqual(lines[room], [data]);
				assert.equal(lines[room].length, 1);
				done();
			});
		}, medium_time);
	});

	it("sendMessage event - wrong word", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const word = "testword";
		const message1 = "test";
		const callback = () => {
			console.log("test callback");
		};

		// act and assert
		socket.emit("join", { name: n1, room: room, avatar: avatar, update: false });
		socket2.emit("join", { name: n2, room: room, avatar: avatar, update: false });
		setTimeout(() => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 2);
			addTotalScore(room);
			socket.emit("chosenWord", { word, room });
			currentArtist[room] = socket.id;
		}, small_time);
		setTimeout(() => {
			socket2.emit("sendMessage", message1, callback);
			socket.on("message", (data) => {
				console.log("msg sent to all users, client 1 tests");
				assert.hasAllDeepKeys(data, ["user", "text", "img"]);
				assert.equal(data["user"], n2);
				assert.equal(data["text"], "Not the word!\n" + message1);
				assert.equal(data["img"], avatar);
			});
			socket2.on("message", (data) => {
				console.log("msg sent to all users, client 2 tests");
				assert.hasAllDeepKeys(data, ["user", "text", "img"]);
				assert.equal(data["user"], n2);
				assert.equal(data["text"], "Not the word!\n" + message1);
				assert.equal(data["img"], avatar);
				done();
			});
		}, medium_time);
	});

	it("sendMessage event - filter bad word", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const word = "testword";
		const message1 = "asshole";
		const callback = () => {
			console.log("test callback");
		};

		// act and assert
		socket.emit("join", { name: n1, room: room, avatar: avatar, update: false });
		socket2.emit("join", { name: n2, room: room, avatar: avatar, update: false });
		setTimeout(() => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 2);
			addTotalScore(room);
			socket.emit("chosenWord", { word, room });
			currentArtist[room] = socket.id;
		}, small_time);
		setTimeout(() => {
			socket2.emit("sendMessage", message1, callback);
			socket.on("message", (data) => {
				console.log("msg sent to all users, client 1 tests");
				assert.hasAllDeepKeys(data, ["user", "text", "img"]);
				assert.equal(data["user"], n2);
				assert.equal(data["text"], "Not the word!\n" + "*******");
				assert.equal(data["img"], avatar);
			});
			socket2.on("message", (data) => {
				console.log("msg sent to all users, client 2 tests");
				assert.hasAllDeepKeys(data, ["user", "text", "img"]);
				assert.equal(data["user"], n2);
				assert.equal(data["text"], "Not the word!\n" + "*******");
				assert.equal(data["img"], avatar);
				done();
			});
		}, medium_time);
	});

	it("sendMessage event - right word", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const word = "testword";
		const callback = () => {
			console.log("test callback");
		};

		// act and assert
		socket.emit("join", { name: n1, room: room, avatar: avatar, update: false });
		socket2.emit("join", { name: n2, room: room, avatar: avatar, update: false });
		setTimeout(() => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 2);
			addTotalScore(room);
			socket.emit("chosenWord", { word, room });
			currentArtist[room] = socket.id;
		}, small_time);
		setTimeout(() => {
			socket2.emit("sendMessage", word, callback);
			socket.on("message", (data2) => {
				console.log("msg sent to all users, client 1 tests");
				assert.hasAllDeepKeys(data2, ["user", "text", "img"]);
				assert.equal(data2["user"], n2);
				assert.equal(data2["text"], "Test2 is correct!");
				assert.equal(data2["img"], avatar);
				const user = getUser(socket.id);
				const user2 = getUser(socket2.id);
				assert.equal(user2["hadPoints"], true);
				assert.equal(user2["points"], 200);
				assert.equal(user["points"], 100);
			});
			socket2.on("message", (data2) => {
				console.log("msg sent to all users, client 2 tests");
				assert.hasAllDeepKeys(data2, ["user", "text", "img"]);
				assert.equal(data2["user"], n2);
				assert.equal(data2["text"], "Test2 is correct!");
				assert.equal(data2["img"], avatar);
				const user = getUser(socket.id);
				const user2 = getUser(socket2.id);
				assert.equal(user2["hadPoints"], true);
				assert.equal(user2["points"], 200);
				assert.equal(user["points"], 100);
				done();
			});
		}, medium_time);
	});

	it("sendMessage event - repeat word", function (done) {
		// arrange
		const socket = makeSocket();
		const socket2 = makeSocket();
		const word = "testword";
		const callback = () => {
			console.log("test callback");
		};

		// act and assert
		socket.emit("join", { name: n1, room: room, avatar: avatar, update: false });
		socket2.emit("join", { name: n2, room: room, avatar: avatar, update: false });
		setTimeout(() => {
			const users = getUsersInRoom(room);
			assert.equal(users.length, 2);
			addTotalScore(room);
			socket.emit("chosenWord", { word, room });
			currentArtist[room] = socket.id;
			socket2.emit("sendMessage", word, callback);
		}, small_time);
		setTimeout(() => {
			socket2.emit("sendMessage", word, callback);
			socket.on("message", (data3) => {
				console.log("msg sent to all users, client 1 tests");
				assert.hasAllDeepKeys(data3, ["user", "text", "img"]);
				assert.equal(data3["user"], n2);
				assert.equal(data3["text"], "Test2 already guessed right!");
				assert.equal(data3["img"], avatar);
				const userAgain = getUser(socket.id);
				const user2Again = getUser(socket2.id);
				assert.equal(user2Again["hadPoints"], true);
				assert.equal(user2Again["points"], 200);
				assert.equal(userAgain["points"], 100);
			});
			socket2.on("message", (data3) => {
				console.log("msg sent to all users, client 2 tests");
				assert.hasAllDeepKeys(data3, ["user", "text", "img"]);
				assert.equal(data3["user"], n2);
				assert.equal(data3["text"], "Test2 already guessed right!");
				assert.equal(data3["img"], avatar);
				const userAgain = getUser(socket.id);
				const user2Again = getUser(socket2.id);
				assert.equal(user2Again["hadPoints"], true);
				assert.equal(user2Again["points"], 200);
				assert.equal(userAgain["points"], 100);
				done();
			});
		}, medium_time);
	});
});

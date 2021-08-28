const { getUsersInRoom, changeTurn } = require("./users");
const { chooseWord } = require("./words");

// list of rounds per room
const rounds = {};

// A function to add a room to the rounds object with start round value to 0
const addRound = (room) => {
	const round = 1;
	rounds[room] = round;
	return round;
};

// A function increase the round by 1
const increaseRound = (room) => {
	const old = rounds[room];
	const n = old + 1;
	rounds[room] = n;
	return n;
};

// A function to get round value for a room
const getRound = (room) => {
	return rounds[room];
};

// A function to choose the next person to draw in a round
const whoseTurn = (room) => {
	const users = getUsersInRoom(room);
	const users_false = users.filter((u) => u.turn == false);
	if (users_false.length > 0) {
		const chosen = users_false[Math.floor(Math.random() * users_false.length)];
		changeTurn(chosen.id, true);
		const round = getRound(room);
		const { word1, word2, word3 } = chooseWord(round, room);
		return { chosen, word1, word2, word3, round };
	} else {
		const round = increaseRound(room);
		const usersReset = users.map((u) => changeTurn(u.id, false));
		const chosen = users[Math.floor(Math.random() * users.length)];
		if (chosen) {
			changeTurn(chosen.id, true);
		}
		const { word1, word2, word3 } = chooseWord(round, room);
		return { chosen, word1, word2, word3, round };
	}
};

module.exports = {
	addRound,
	increaseRound,
	getRound,
	whoseTurn,
};

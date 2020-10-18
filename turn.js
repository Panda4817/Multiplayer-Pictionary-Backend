const { getUsersInRoom, changeTurn } = require('./users')
const { chooseWord } = require('./words')


rounds = {}

const addRound = (room) => {
    const round = 1
    rounds[room] = round;
    return round
}

const increaseRound = (room) => {
    const old = rounds[room];
    const n = old + 1
    rounds[room] = n;
    return n;
}

const getRound = (room) => {
    return rounds[room];
}

const whoseTurn = (room) => {
    const users = getUsersInRoom(room)
    const users_false = users.filter(u => u.turn == false)
    if (users_false.length > 0){
        const chosen = users_false[Math.floor(Math.random()*users_false.length)];
        changeTurn(chosen.id, true);
        const round = getRound(room);
        const { word1, word2, word3 } = chooseWord(round, room);
        return {chosen, word1, word2, word3, round }
    } else {
        const round = increaseRound(room)
        const usersReset = users.map(u => changeTurn(u.id, false));
        const chosen = users[Math.floor(Math.random()*users.length)];
        changeTurn(chosen.id, true);
        const { word1, word2, word3 } = chooseWord(round, room);
        return { chosen, word1, word2, word3, round }
    }
}

module.exports = {
    addRound,
    increaseRound,
    getRound,
    whoseTurn,
}
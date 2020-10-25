const { getUsersInRoom } = require('./users')

const scores = {}

const addTotalScore = (room) => {
    const users = getUsersInRoom(room)
    scores[room] = users.length
    return users.length
}

const reduceTotalScore = (room) => {
    const old = scores[room]
    const n = old - 1
    scores[room] = n
    return old
}

module.exports = {
    addTotalScore,
    reduceTotalScore
}

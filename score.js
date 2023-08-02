import { getUsersInRoom } from './users.js'

const scores = {}

// A function to add a room to the scores object with total points for that room (dependent number of player)
export const addTotalScore = (room) => {
    const users = getUsersInRoom(room)
    scores[room] = users.length
    return users.length
}

// Reduce the number in the scores object for that room (the final person to guess right will get lowest score)
export const reduceTotalScore = (room) => {
    const old = scores[room]
    const n = old - 1
    scores[room] = n
    return old
}

// Get total scores
export const getTotalScore = (room) => {
    return scores[room]
}

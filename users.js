const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (existingUser) {
        return { error: `Username ${name} is taken in room ${room}` }
    }

    const turn = false
    const points = 0
    const user = { id, name, room, turn, points }

    users.push(user);

    return { user }
}

const changeTurn = (id, bool) => {
    const index = users.findIndex((user) => user.id === id);
    const user = users[index];
    user.turn = bool;
    users[index] = user;
    return;
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const addPoint = (id, point) => {
    const index = users.findIndex((user) => user.id === id);
    const user = users[index];
    user.points += point;
    return; 
}

const resetPoint = (id) => {
    const index = users.findIndex((user) => user.id === id);
    const user = users[index];
    user.points = 0;
    return;
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint };
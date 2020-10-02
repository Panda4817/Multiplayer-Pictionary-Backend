const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (existingUser) {
        return { error: `Username ${name} is taken in room ${room}` }
    }

    const turn = false
    const user = { id, name, room, turn }

    users.push(user);

    return { user }
}

const changeTurn = (id, bool) => {
    const index = users.findIndex((user) => user.id === id);
    const user = users[index];
    user.turn = bool;
    users[index] = user;
    console.log("changed to ", bool, users[index])
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

module.exports = { addUser, removeUser, getUser, getUsersInRoom, changeTurn };
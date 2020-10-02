current_word = {}

const chooseWord = (round) => {
    // Find list of nouns
    return "word"
}

const updateRoom = (room, word) => {
    current_word[room] = word;
    return true;
}

const getWord = (room) => {
    return current_word[room];
}

const removeRoom = (room) => {
    delete current_word[room];
    return;
}

module.exports = { 
    chooseWord,
    updateRoom, 
    getWord, 
    removeRoom 
};
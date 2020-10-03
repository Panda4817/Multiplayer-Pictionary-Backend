current_word = {}

const chooseWord = (round, room) => {
    // Find list of nouns
    current_word[room] = '';
    return {"word1": "cat", "word2": "dog", "word3": "hat"};
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
current_word = {}
const fs = require("fs");
//const SpellChecker = require('simple-spellchecker');
//const dictionary = SpellChecker.getDictionarySync("en-GB");    


const chooseWord = (round, room) => {
    // Find list of nouns
    current_word[room] = '';
    let text;
    if (round < 3) {
        text = fs.readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => {return w.trim()}).filter(w => w.length < 6)  
    } else if (round < 5) {
        text = fs.readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => {return w.trim()}).filter(w => w.length < 7)
    } else {
        text = fs.readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => {return w.trim()}).filter(w => w.length > 7)
    }

    const word1 = text.splice(Math.floor(Math.random()*text.length), 1);
    const word2 = text.splice(Math.floor(Math.random()*text.length), 1);
    const word3 = text.splice(Math.floor(Math.random()*text.length), 1);   
    

    return {"word1": word1, "word2": word2, "word3": word3};
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

const checkWord = (message, room) => {
    var msg = '';
    const myWord = message.toLowerCase();
    const word = getWord(room);
    if(word != myWord) {
        msg =  "Not the word!\n" + message;
    } else {
        msg  =  "Correct!"
    }
    return msg;

}

module.exports = { 
    chooseWord,
    updateRoom, 
    getWord, 
    removeRoom,
    checkWord
};
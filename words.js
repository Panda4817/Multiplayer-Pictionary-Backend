current_word = {}
const fs = require("fs")
//const SpellChecker = require('simple-spellchecker')
//const dictionary = SpellChecker.getDictionarySync("en-GB")    
previous_words = {}

const chooseWord = (round, room) => {
    if (current_word[room]) {
        previous_words[room] = [...previous_words[room], current_word[room]]
    }
    current_word[room] = ''
    let text = fs.readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => { return w.trim() }).filter((w) => {
        for (var i=0; i<previous_words[room].length; i++) {
            if (w === previous_words[room][i]) {
                return false
            }
        }
        return true
    })
    const word1 = text.splice(Math.floor(Math.random() * text.length), 1)
    const word2 = text.splice(Math.floor(Math.random() * text.length), 1)
    const word3 = text.splice(Math.floor(Math.random() * text.length), 1)


    return { "word1": word1, "word2": word2, "word3": word3 }
}

const updateRoom = (room, word) => {
    if (current_word[room]) {
        previous_words[room] = [...previous_words[room], current_word[room]]
    }
    current_word[room] = word
    return true
}

const getWord = (room) => {
    return current_word[room]
}

const removeRoom = (room) => {
    delete current_word[room]
    delete previous_words[room]
    return
}

const checkWord = (message, room) => {
    var msg = ''
    const myWord = message.trim().toLowerCase()
    const word = getWord(room)
    if (word != myWord) {
        msg = "Not the word!\n" + message
    } else {
        msg = "Correct!"
    }
    return msg

}

module.exports = {
    chooseWord,
    updateRoom,
    getWord,
    removeRoom,
    checkWord
}
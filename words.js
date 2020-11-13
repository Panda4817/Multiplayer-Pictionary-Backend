current_word = {}
previous_words = {}
const fs = require("fs")
//const SpellChecker = require('simple-spellchecker')
//const dictionary = SpellChecker.getDictionarySync("en-GB")    

// Function to choose 3 words from the noun list
const chooseWord = (round, room) => {
    // Keep track of previous words so all new words are provided for the duration of the room
    if (current_word[room]) {
        if (previous_words[room]) {
            previous_words[room] = [...previous_words[room], current_word[room]]
        } else {
            previous_words[room] = [current_word[room]]
        }
    }
    // Clear the current word
    current_word[room] = ''
    // Retrieve words from txt file
    let text = fs.readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => { return w.trim() })
    // Filter list, checking against previous words used
    if (previous_words[room]) {
        text = text.filter((w) => {
            for (var i=0; i<previous_words[room].length; i++) {
                if (w === previous_words[room][i]) {
                    return false
                }
            }
            return true
        })
    }
    const word1 = text.splice(Math.floor(Math.random() * text.length), 1)
    const word2 = text.splice(Math.floor(Math.random() * text.length), 1)
    const word3 = text.splice(Math.floor(Math.random() * text.length), 1)


    return { "word1": word1, "word2": word2, "word3": word3 }
}

// Function to update current word for room
const updateRoom = (room, word) => {
    current_word[room] = word
    return true
}

// Function to get word for a room
const getWord = (room) => {
    return current_word[room]
}

// Function to remove room from object when no players are left
const removeRoom = (room) => {
    delete current_word[room]
    delete previous_words[room]
    return
}

// Function to check message against room word to check if it has been guessed right
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
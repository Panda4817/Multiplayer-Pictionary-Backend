import Filter from 'bad-words';
import { readFileSync } from "fs";
// import {sendWordMessage} from "./kafka.js";

const filter = new Filter();
const current_word = {}
const previous_words = {}

// Function to choose 3 words from the noun list
export const chooseWord = (round, room) => {
    // Clear the current word
    current_word[room] = ''
    // Retrieve words from txt file
    let text = readFileSync("./pictionary.txt", "utf-8").split('\n').map(w => { return w.trim() })
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

    return { "word1": word1[0], "word2": word2[0], "word3": word3[0] }
}

// Function to update current word for room
export const updateRoom = (room, word) => {
    // sendWordMessage(word).then(console.log).catch((e) => console.log(e.message));
    current_word[room] = word
    // Keep track of previous words so all new words are provided for the duration of the room
    if (previous_words[room]) {
        previous_words[room].push(current_word[room])
    } else {
        previous_words[room] = [current_word[room]]
    }
    return true
}

// Function to get word for a room
export const getWord = (room) => {
    return current_word[room]
}

// Function to remove room from object when no players are left
export const removeRoom = (room) => {
    delete current_word[room]
    delete previous_words[room]
    return
}

// Function to check message against room word to check if it has been guessed right
export const checkWord = (message, room) => {
    var msg = ''
    const sanitizedMessage = message.replace(/[^A-Za-z]/g," ")
    const myWord = sanitizedMessage.trim().toLowerCase()
    const word = getWord(room)
    const parts = word.split(" ")
    if (word != myWord) {
        msg = sanitizedMessage.trim() === "" ? "Not the word!\n" + message : "Not the word!\n" + filter.clean(sanitizedMessage)
        if (parts.length > 1) {
            const msg_parts = myWord.split(parts[0])
            if (msg_parts.length < 2) {
                return msg
            }
            if (msg_parts[1] == parts[1]) {
                msg = "Correct!"
            }
        } else {
            const msg_parts = myWord.split(" ")
            if (msg_parts.join("") == word) {
                msg = "Correct!"
            }
        }
    } else {
        msg = "Correct!"
    }
    return msg

}
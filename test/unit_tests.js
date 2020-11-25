const chai = require('chai')
const assert = chai.assert

// My custom modules and their functions imported
const { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint, changeHadPoints, resetHadPoints, resetPoints, resetPlayerHadPoints, resetPlayerTurns } = require('../users')
const { chooseWord, updateRoom, getWord, removeRoom, checkWord } = require('../words')
const { addRound, increaseRound, getRound, whoseTurn } = require('../turn')
const { addTotalScore, reduceTotalScore, getTotalScore } = require('../score')
const { myClientList, timers, lines, currentArtist, choiceTime, turnTime, ROUND, updatePlayers, socketCheck, emitChoice, emitTurn, gameOver, restartGame, turn, updateMsgTextAndAddPoints, disconnectCleanUp } = require('../socketio_util')

// Global const
const room = 'testroom'
const room_addUser = 'TestRoom '
const room2 = 'testroom2'
const avatar = '0x1F600'
const id = 123
const id2 = 456
const id3 = 789
const id4 = 101
const id5 = 112
const id6 = 134
const name = 'Test '
const name2 = 'Test2'
const name3 = 'Test3'
const longName = 'abcdefghijklm'
const longRoom = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstu'
const invalidAvatar = 'qwerty'
const otherHexCode = '123'
const uncleanWord = 'asshole'

describe('Custom functions test suite (with chai):', function() {
    it('addUser', function() {
        // Arrange
        let expectedName = 'test'
        let expectedRoom = room

        // Act
        const expectedOutput = {"user": { 
            "id": id, "name": expectedName, "room": expectedRoom, "avatar": avatar, "turn": false, "points": 0, "hadPoints": false 
            }, "error": undefined
        }
        const { error, user } = addUser({ id, name, room: room_addUser, avatar })

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)
        assert.equal(user['name'], expectedOutput['user']['name'])
        assert.equal(user['room'], expectedOutput['user']['room'])
    });

    it('addUser - long name fails', function() {
        // Act
        const {error, user} = addUser({ id:id2, name:longName, room, avatar})
        const expectedOutput = {"user": undefined, "error": "Username is too long"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - long room fails', function() {
        // Act
        const {error, user} = addUser({ id:id3, name:name2, room:longRoom, avatar})
        const expectedOutput = {"user": undefined, "error": "Room name is too long"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - same username fails', function() {
        // Act
        const {error, user} = addUser({ id:id4, name, room, avatar})
        const expectedOutput = {"user": undefined, "error": "Username is taken in room testroom"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - username empty fails', function() {
        // Act
        const {error, user} = addUser({ id:id5, name:'', room, avatar})
        const expectedOutput = {"user": undefined, "error": "Username and/or room name is empty"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })
    it('addUser - room name empty fails', function() {
        // Act
        const {error, user} = addUser({ id:id6, name, room:'', avatar})
        const expectedOutput = {"user": undefined, "error": "Username and/or room name is empty"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - unclean name fails', function() {
        // Act
        const {error, user} = addUser({ id4, name:uncleanWord, room, avatar})
        const expectedOutput = {"user": undefined, "error": "Ensure username and/or room name is clean"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - unclean room fails', function() {
        // Act
        const {error, user} = addUser({ id5, name, room:uncleanWord, avatar})
        const expectedOutput = {"user": undefined, "error": "Ensure username and/or room name is clean"}

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)

    })

    it('addUser - invalid hexcode results in invisible avatar', function() {
        // Act
        const {error, user} = addUser({ id:id4, name, room:room2, avatar:invalidAvatar})
        const expectedOutput = {"user": { 
            "id": id4, "name": 'test', "room":'testroom2', "avatar": '', "turn": false, "points": 0, "hadPoints": false 
            }, "error": undefined
        }

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)
        assert.deepEqual(user['avatar'], '')
    })

    it('addUser - a hexcode not in the array results in invisible avatar', function() {
        // Act
        const {error, user} = addUser({ id:id5, name:name2, room:room2, avatar:otherHexCode})
        const expectedOutput = {"user": { 
            "id": id5, "name": 'test2', "room":'testroom2', "avatar": '', "turn": false, "points": 0, "hadPoints": false 
            }, "error": undefined
        }

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)
        assert.deepEqual(user['avatar'], '')
    })

    it('getUser', function() {
        // Act
        const expected = { 
            "id": id, "name": 'test', "room": room, "avatar": '0x1F600', "turn": false, "points": 0, "hadPoints": false 
        }
        const actual = getUser(id)

        // Assert
        assert.deepEqual(actual, expected)
    })

    it('getUsersInRoom', function() {
        // Act
        const expected = [{ 
            "id": id, "name": 'test', "room": room, "avatar": '0x1F600', "turn": false, "points": 0, "hadPoints": false 
        }]
        const actual = getUsersInRoom(room)

        // Assert
        assert.equal(actual.length, expected.length)
        assert.deepEqual(actual, expected)
    })

    it('changeTurn', function() {
        // Act
        changeTurn(id, true)
        const actual = getUser(id)

        // Assert
        assert.equal(actual['turn'], true)
        assert.notEqual(actual['turn'], false)

        // Act
        changeTurn(id, false)
        const secondActual = getUser(id)

        // Assert
        assert.equal(secondActual['turn'], false)
        assert.notEqual(actual['turn'], true)
    })

    it('addPoint', function() {
        // Act
        addPoint(id, 100)
        const actual = getUser(id)

        // Assert
        assert.equal(actual['points'], 100)

        // Act
        addPoint(id, 300)
        const secondActual = getUser(id)

        // Assert
        assert.equal(secondActual['points'], 400)
    })

    it('resetPoint', function() {
        // Act
        resetPoint(id)
        const actual = getUser(id)

        // Assert
        assert.equal(actual['points'], 0)
    })

    it('changeHadPoints', function() {
        // Act
        changeHadPoints(id)
        const actual = getUser(id)

        // Assert
        assert.equal(actual['hadPoints'], true)
        assert.notEqual(actual['hadPoints'], false)
    })

    it('resetHadPoints', function() {
        // Act
        resetHadPoints(id)
        const actual = getUser(id)

        // Assert
        assert.equal(actual['hadPoints'], false)
        assert.notEqual(actual['hadPoints'], true)
    })

    it('resetPoints', function() {
        // Arrange
        addUser({'id': id2, 'name': name2, room: room_addUser, avatar})
        addUser({'id': id3, 'name': name3, room: room_addUser, avatar})
        addPoint(id, 100)
        addPoint(id2, 100)
        addPoint(id3, 100)

        assert.notEqual(getUser(id)['points'], 0)
        assert.notEqual(getUser(id2)['points'], 0)
        assert.notEqual(getUser(id3)['points'], 0)

        // Act
        resetPoints(room)

        setTimeout(() => {
            // Assert
            assert.equal(getUser(id)['points'], 0)
            assert.equal(getUser(id2)['points'], 0)
            assert.equal(getUser(id3)['points'], 0)
        }, 10)
        

    })

    it('resetPlayerHadPoints', function() {
        // Arrange
        changeHadPoints(id)
        changeHadPoints(id2)
        changeHadPoints(id3)

        assert.notEqual(getUser(id)['hadPoints'], false)
        assert.notEqual(getUser(id2)['hadPoints'], false)
        assert.notEqual(getUser(id3)['hadPoints'], false)

        // Act
        resetPlayerHadPoints(room)

        // Assert
        setTimeout(() => {
            assert.equal(getUser(id)['hadPoints'], false)
            assert.equal(getUser(id2)['hadPoints'], false)
            assert.equal(getUser(id3)['hadPoints'], false)

        }, 10)
        
        
        
    })

    it('resetPlayerTurns', function() {
        // Arrange
        changeTurn(id, true)
        changeTurn(id2, true)
        changeTurn(id3, true)

        assert.notEqual(getUser(id)['turn'], false)
        assert.notEqual(getUser(id2)['turn'], false)
        assert.notEqual(getUser(id3)['turn'], false)

        // Act
        resetPlayerTurns(room)

        setTimeout(() => {
            // Assert
            assert.equal(getUser(id)['turn'], false)
            assert.equal(getUser(id2)['turn'], false)
            assert.equal(getUser(id3)['turn'], false)
        }, 10)
        
    })

    it('removeUser', function() {
        // Act
        const removed1 = removeUser(id)
        const removed2 = removeUser(id2)
        const removed3 = removeUser(id3)
        const actual1 = getUser(id)
        const actual2 = getUser(id2)
        const actual3 = getUser(id3)

        // Assert
        assert.equal(actual1, undefined)
        assert.equal(removed1['id'], id)
        assert.equal(actual2, undefined)
        assert.equal(removed2['id'], id2)
        assert.equal(actual3, undefined)
        assert.equal(removed3['id'], id3)
        
    })

    it('updateRoom and getWord', function() {
        // Act
        const actual1 = getWord(room)
        const actual = updateRoom(room, 'car')
        const actual2 = getWord(room)

        // Assert
        assert.equal(actual1, undefined)
        assert.isTrue(actual)
        assert.equal(actual2, 'car')
    })

    it('chooseWord', function() {
        // Act
        const actual = chooseWord(1, room)
        const actual2 = getWord(room)
        
        // Assert
        assert.equal(actual2, '')
        assert.hasAllDeepKeys(actual, ['word1', 'word2', 'word3'])
        assert.notEqual(actual['word1'], 'car')
        assert.notEqual(actual['word2'], 'car')
        assert.notEqual(actual['word3'], 'car')
        assert.notEqual(actual['word1'], actual['word2'])
        assert.notEqual(actual['word2'], actual['word3'])
        assert.notEqual(actual['word1'], actual['word3'])
        assert.isString(actual['word1'])
        assert.isString(actual['word2'])
        assert.isString(actual['word3'])
    })

    it('checkWord', function() {
        // Act
        updateRoom(room, 'cat')
        const actual = checkWord('cat', room)
        const actual1 = checkWord('cat ', room)
        const actual2 = checkWord('CAT', room)
        const actual3 = checkWord('dog', room)

        // Assert
        assert.equal(actual, "Correct!")
        assert.equal(actual1, "Correct!")
        assert.equal(actual2, "Correct!")
        assert.notEqual(actual3, "Correct!")
        assert.equal(actual3, "Not the word!\ndog")
    })

    it('removeRoom', function() {
        // Act
        removeRoom(room)
        const actual = getWord(room)

        // Assert
        assert.equal(actual, undefined)
        assert.notEqual(actual, '')
        assert.isNotString(actual)
    })

    it('addRound', function() {
        // Act
        const actual = addRound(room)

        // Assert
        assert.equal(actual, 1)
    })

    it('increaseRound', function() {
        // Act
        const actual = increaseRound(room)

        // Assert
        assert.equal(actual, 2)
    })

    it('getRound', function() {
        // Act
        const actual = getRound(room)

        // Assert
        assert.equal(actual, 2)
    })

    it('whoseTurn', function() {
        // Arrange
        addUser({id, name, room: room_addUser, avatar})
        addUser({'id': id2, 'name': name2, room: room_addUser, avatar})
        addUser({'id': id3, 'name': name3, room: room_addUser, avatar})

        // Act
        addRound(room)
        const actual = whoseTurn(room)
        const user = getUser(actual['chosen']['id'])
        const word = updateRoom(room, actual['word1'])
        const actual2 = whoseTurn(room)
        const user2 = getUser(actual2['chosen']['id'])
        const word2 = updateRoom(room, actual2['word2'])
        const actual3 = whoseTurn(room)
        const user3 = getUser(actual3['chosen']['id'])
        const word3 = updateRoom(room, actual3['word3'])

        // Assert
        // right keys
        assert.hasAllDeepKeys(actual, ['chosen', 'word1', 'word2', 'word3', 'round'])
        assert.hasAllDeepKeys(actual2, ['chosen', 'word1', 'word2', 'word3', 'round'])
        assert.hasAllDeepKeys(actual3, ['chosen', 'word1', 'word2', 'word3', 'round'])
        // Right round number
        assert.equal(actual['round'], 1)
        assert.equal(actual2['round'], 1)
        assert.equal(actual3['round'], 1)
        // Chosen user has had their turn variable changed to true
        assert.equal(user['turn'], true)
        assert.equal(user2['turn'], true)
        assert.equal(user3['turn'], true)
        // 3 strings provided
        assert.isString(actual['word1'])
        assert.isString(actual['word2'])
        assert.isString(actual['word3'])
        assert.isNumber(actual['round'])
        // Chosen word is not in the other choice words
        assert.notEqual(actual2['word1'], actual['word1'])
        assert.notEqual(actual2['word2'], actual['word1'])
        assert.notEqual(actual2['word3'], actual['word1'])
        assert.notEqual(actual3['word1'], actual2['word2'])
        assert.notEqual(actual3['word2'], actual2['word2'])
        assert.notEqual(actual3['word3'], actual2['word2'])


        // Act 2
        const actual4 = whoseTurn(room)
        const users = getUsersInRoom(room)
        const users_false = users.filter(u => u.turn == false)

        // Assert 2
        assert.hasAllDeepKeys(actual4, ['chosen', 'word1', 'word2', 'word3', 'round'])
        assert.equal(actual4['round'], 2)
        assert.equal(users_false.length, 2)

        // Act 3
        const usersReset = users.map(u => changeTurn(u.id, false))
        const users_false2 = users.filter(u => u.turn == false)

        // Assert 3
        assert.equal(users_false2.length, 3)
    })

    it('addTotalScore', function() {
        // Act
        const actual = addTotalScore(room)

        // Assert
        assert.equal(actual, 3)
    })

    it('reduceTotalScore', function() {
        // Act
        const actual = reduceTotalScore(room)
        // Assert
        assert.equal(actual, 3)
        // Act 2
        const actual2 = reduceTotalScore(room)
        // Assert 2
        assert.equal(actual2, 2)
    })

    it('getTotalScore', function() {
        // Act
        const actual = getTotalScore(room)

        // Assert
        assert.equal(actual, 1)
    })
});

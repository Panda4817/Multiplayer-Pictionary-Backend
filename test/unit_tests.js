const chai = require('chai')
const assert = chai.assert

// My custom modules and their functions imported
const { addUser, removeUser, getUser, getUsersInRoom, changeTurn, addPoint, resetPoint, changeHadPoints, resetHadPoints } = require('../users')
const { chooseWord, updateRoom, getWord, removeRoom, checkWord } = require('../words')
const { addRound, increaseRound, getRound, whoseTurn } = require('../turn')
const { addTotalScore, reduceTotalScore } = require('../score')

describe('Custom functions test suite (with chai):', function() {
    it('addUser', function() {
        // Arrange
        let id = 123
        let name = 'Test '
        let room = 'TestRoom '
        let avatar = '0x1F600'
        let expectedName = 'test'
        let expectedRoom = 'testroom'

        // Act
        const expectedOutput = {"user": { 
            "id": id, "name": expectedName, "room": expectedRoom, "avatar": avatar, "turn": false, "points": 0, "hadPoints": false 
            }, "error": undefined
        }
        const { error, user } = addUser({ id, name, room, avatar })

        // Assert
        assert.deepEqual({ user, error }, expectedOutput)
        assert.equal(user['name'], expectedOutput['user']['name'])
        assert.equal(user['room'], expectedOutput['user']['room'])
    });

    it('getUser', function() {
        // Act
        const expected = { 
            "id": 123, "name": 'test', "room": 'testroom', "avatar": '0x1F600', "turn": false, "points": 0, "hadPoints": false 
        }
        const actual = getUser(123)

        // Assert
        assert.deepEqual(actual, expected)
    })

    it('getUsersInRoom', function() {
        // Act
        const expected = [{ 
            "id": 123, "name": 'test', "room": 'testroom', "avatar": '0x1F600', "turn": false, "points": 0, "hadPoints": false 
        }]
        const actual = getUsersInRoom('testroom')

        // Assert
        assert.equal(actual.length, expected.length)
        assert.deepEqual(actual, expected)
    })

    it('changeTurn', function() {
        // Act
        changeTurn(123, true)
        const actual = getUser(123)

        // Assert
        assert.equal(actual['turn'], true)
        assert.notEqual(actual['turn'], false)

        // Act
        changeTurn(123, false)
        const secondActual = getUser(123)

        // Assert
        assert.equal(secondActual['turn'], false)
        assert.notEqual(actual['turn'], true)
    })

    it('addPoint', function() {
        // Act
        addPoint(123, 100)
        const actual = getUser(123)

        // Assert
        assert.equal(actual['points'], 100)

        // Act
        addPoint(123, 300)
        const secondActual = getUser(123)

        // Assert
        assert.equal(secondActual['points'], 400)
    })

    it('resetPoint', function() {
        // Act
        resetPoint(123)
        const actual = getUser(123)

        // Assert
        assert.equal(actual['points'], 0)
    })

    it('changeHadPoints', function() {
        // Act
        changeHadPoints(123)
        const actual = getUser(123)

        // Assert
        assert.equal(actual['hadPoints'], true)
        assert.notEqual(actual['hadPoints'], false)
    })

    it('resetHadPoints', function() {
        // Act
        resetHadPoints(123)
        const actual = getUser(123)

        // Assert
        assert.equal(actual['hadPoints'], false)
        assert.notEqual(actual['hadPoints'], true)
    })

    it('removeUser', function() {
        // Act
        const removed = removeUser(123)
        const actual = getUser(123)

        // Assert
        assert.equal(actual, undefined)
        assert.equal(removed['id'], 123)
    })

    it('updateRoom and getWord', function() {
        // Act
        const actual1 = getWord('testroom')
        const actual = updateRoom('testroom', 'car')
        const actual2 = getWord('testroom')

        // Assert
        assert.equal(actual1, undefined)
        assert.isTrue(actual)
        assert.equal(actual2, 'car')
    })

    it('chooseWord', function() {
        // Act
        const actual = chooseWord(1, 'testroom')
        const actual2 = getWord('testroom')
        
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
        updateRoom('testroom', 'cat')
        const actual = checkWord('cat', 'testroom')
        const actual1 = checkWord('cat ', 'testroom')
        const actual2 = checkWord('CAT', 'testroom')
        const actual3 = checkWord('dog', 'testroom')

        // Assert
        assert.equal(actual, "Correct!")
        assert.equal(actual1, "Correct!")
        assert.equal(actual2, "Correct!")
        assert.notEqual(actual3, "Correct!")
        assert.equal(actual3, "Not the word!\ndog")
    })

    it('removeRoom', function() {
        // Act
        removeRoom('testroom')
        const actual = getWord('testroom')

        // Assert
        assert.equal(actual, undefined)
        assert.notEqual(actual, '')
        assert.isNotString(actual)
    })

    it('addRound', function() {
        // Act
        const actual = addRound('testroom')

        // Assert
        assert.equal(actual, 1)
    })

    it('increaseRound', function() {
        // Act
        const actual = increaseRound('testroom')

        // Assert
        assert.equal(actual, 2)
    })

    it('getRound', function() {
        // Act
        const actual = getRound('testroom')

        // Assert
        assert.equal(actual, 2)
    })

    it('whoseTurn', function() {
        // Arrange
        let id = 123
        let id2 = 456
        let id3 = 789
        let name = 'Test '
        let name2 = 'Test2'
        let name3 = 'Test3'
        let room = 'TestRoom '
        let avatar = '0x1F600'
        addUser({id, name, room, avatar})
        addUser({'id': id2, 'name': name2, room, avatar})
        addUser({'id': id3, 'name': name3, room, avatar})

        // Act
        addRound('testroom')
        const actual = whoseTurn('testroom')
        const user = getUser(actual['chosen']['id'])
        const word = updateRoom('testroom', actual['word1'])
        const actual2 = whoseTurn('testroom')
        const user2 = getUser(actual2['chosen']['id'])
        const word2 = updateRoom('testroom', actual2['word2'])
        const actual3 = whoseTurn('testroom')
        const user3 = getUser(actual3['chosen']['id'])
        const word3 = updateRoom('testroom', actual3['word3'])

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
        const actual4 = whoseTurn('testroom')
        const users = getUsersInRoom('testroom')
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
        const actual = addTotalScore('testroom')

        // Assert
        assert.equal(actual, 3)
    })

    it('reduceTotalScore', function() {
        // Act
        const actual = reduceTotalScore('testroom')
        // Assert
        assert.equal(actual, 3)
        // Act 2
        const actual2 = reduceTotalScore('testroom')
        // Assert 2
        assert.equal(actual2, 2)
    })
});

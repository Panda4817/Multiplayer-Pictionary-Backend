# Multiplayer Pictionary App BACKEND

[![Build Status](https://travis-ci.com/Panda4817/Multiplayer-Pictionary-Backend.svg?branch=master)](https://travis-ci.com/Panda4817/Multiplayer-Pictionary-Backend)

The backend for a web application that lets you play pictionary with your friends.
Made using NodeJS and Express server.

## Requirements
- Node version 17
- "bad-words": "^3.0.4",
- "chai": "^4.3.4",
- "chai-http": "^4.3.0",
- "cors": "^2.8.5",
- "dotenv": "^8.2.0",
- "express": "^4.17.1",
- "mocha": "^8.3.2",
- "nodemon": "^2.0.7",
- "socket.io": "^4.0.1",
- "socket.io-client": "^4.0.1"
- "nyc": "^15.1.0"

## Usage
### Run `npm start`
Runs the backend of the app in the development mode.<br />
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

Make sure frontend is also started. Repo to frontend is [Multiplayer-Pictionary-Frontend](https://github.com/Panda4817/Multiplayer-Pictionary-Frontend).

### Run `npm test`
Runs the unit tests and functional/ integration tests found in tests directory. Requires nyc npm package to gather coverage.

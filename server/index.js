// index.js

import express from 'express'
import dotenv from 'dotenv'

import Game from './game_logic/Game.js';

// Extract necessary environment variables
dotenv.config()
const port = process.env.PORT || 3000

// Start express application
const app = express()

// Define Routes and Middleware
app.get('/', (req, res) => {
    res.send("Hello World!")
})

// When a "createRoom" event comes in from a client
const pokerGame = new Game(3);

pokerGame.addPlayer("Gavin");
pokerGame.addPlayer("Matthew");
pokerGame.addPlayer("Harrison");
pokerGame.addPlayer("Colin");
pokerGame.addPlayer("Tristan");

pokerGame.startGame(); // This will run the logic defined in your classes.

app.listen(port, () => {
    console.log('Listening on port:', port)
})





 
// index.js

import express from 'express'
import dotenv from 'dotenv'
import http from 'http';
import { Server } from 'socket.io'

import Game from './game_logic/Game.js';
import { createGame, joinGame } from './gameManager.js';

// Extract necessary environment variables
dotenv.config()
const port = process.env.PORT || 3000

// Start express application and create server
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: "*" } // Allow all connections for development
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Creation of room by a user
    socket.on('createRoom', ({ playerName }) => {
        createGame(socket, playerName, (response) => {
          socket.emit('roomCreated', response);
        });
    });

    // Joining room by a user
    socket.on('joinRoom', ({ roomId, playerName }) => {
        joinGame(socket, roomId, playerName, (response) => {
          if (response.success) {
             // Send lobby data to the new player
            socket.emit('joinSuccess', response.lobbyData);

            // Broadcast the updated lobby data to everyone already in the room
            socket.to(roomId).emit('lobbyUpdate', response.lobbyData);
          } else {
            // Send an error if it failed
            socket.emit('joinError', response.message);
          }
        });
    });

    // Starting game by host. This initiates the round structure, where rounds continue until one winner remains
    // Therefore
    socket.on('startGame', () => {

    })

    socket.on('disconnect', () => {
      console.log(`A user disconnected: ${socket.id}`);
    });
})

server.listen(port, () => {
    console.log('Listening on port:', port)
})





 
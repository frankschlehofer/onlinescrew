// index.js

import express from 'express'
import dotenv from 'dotenv'
import http from 'http';
import { Server } from 'socket.io'

import { createGame, joinGame, startGame, handlePlayerAction } from './gameManager.js';

// Extract necessary environment variables
dotenv.config()
const port = process.env.PORT || 3000

// Start express application and create server
const app = express()
const server = http.createServer(app)
export const io = new Server(server, {
    cors: { origin: "*" } // Allow all connections for development
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Creation of room by a user
    socket.on('createRoom', ({ playerName }) => {
        createGame(socket, playerName, (response) => {
          if (response.success) {
            socket.emit('lobbyUpdate', response.lobbyData);
        }
        });
    });

    // Joining room by a user
    socket.on('joinRoom', ({ roomId, playerName }) => {
        joinGame(socket, roomId, playerName, (response) => {
          if (response.success) {
             // Send lobby data to the new player
            socket.emit('joinSuccess', response.lobbyData);

            // Broadcast the updated lobby data to everyone already in the room
            io.to(roomId).emit('lobbyUpdate', response.lobbyData);
          } else {
            // Send an error if it failed
            socket.emit('joinError', response.message);
          }
        });
    });

    // Starting game by host. This initiates the round structure, where rounds continue until one winner remains
    socket.on('startGame', ({ roomId, startingLives }) => {
        console.log(`${roomId}'s game is starting`)
        startGame(roomId, startingLives, (response) => {
          if (response.success) {
            console.log(`Start game successful. Sending ${response.gameState}`);
            io.to(roomId).emit('gameStateUpdate', response.gameState);
          }
          else {
            console.log('Start game failed')
          }
        })
    })

    socket.on('playerAction', ({ roomId, actionType }) => {
      console.log(`Received action in ${roomId}: ${actionType}`);
      // Centralize the logic in the game manager
      handlePlayerAction(roomId, actionType);  
    })

    socket.on('disconnect', () => {
      console.log(`A user disconnected: ${socket.id}`);
    });
})

server.listen(port, () => {
    console.log('Listening on port:', port)
})





 
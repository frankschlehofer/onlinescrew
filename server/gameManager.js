// gameManager.js

import Game from './game_logic/Game.js'
import { io } from './index.js';

// A simple helper that lets us use 'await delay(ms)' to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// A mapping from unique game id's to game instances. Used to track all running games
const activeGames = new Map();

const generateRoomId = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export function createGame(hostSocket, playerName, callback) {
    const roomId = generateRoomId();

    // Use socket.io's built-in room feature
    hostSocket.join(roomId); 

    const room = {
        roomId: roomId,
        hostId: hostSocket.id,
        players: [{ id: hostSocket.id, name: playerName }],
        state: 'LOBBY',
        gameInstance: null
    };

    activeGames.set(roomId, room);
    console.log(`[Game Manager] New room created by ${hostSocket.id}: ${roomId}`);
    // Send the new room ID back
    callback({ success: true, lobbyData: room }); 
}

export function joinGame(socket, roomId, playerName, callback) {
    if (!activeGames.has(roomId)) {
        callback({ success: false, message: 'Room not found.' });
        return;
    }
    const room = activeGames.get(roomId);
    socket.join(roomId);
    room.players.push({ id: socket.id, name: playerName });

    console.log(`[Game Manager] ${playerName} : ${socket.id}) joined room ${roomId}`);
    callback({ success: true, lobbyData: room });
}

export function startGame(roomId, startingLives, callback) {

    // Call Game constructor to initalize game object
    const room = activeGames.get(roomId);
    room.gameInstance = new Game(startingLives)

    // Add players into game. Sets their lives to the startingLives variable
    room.gameInstance.setPlayers(room.players);

    // Begin first round. Each player receives their card and first dealer index is set
    room.gameInstance.startRound();
    room.state = 'IN_PROGRESS'; 

    const combinedState = getRoomState(room);
    
    // Send the lobbyData back, including the updated gameInstance information.
    callback({ success: true, gameState: combinedState })
}

export function handlePlayerAction(roomId, actionType) {
    const room = activeGames.get(roomId);
    if (!room || !room.gameInstance) return;
    const game = room.gameInstance;

    // Perform the requested action
    if (actionType === 'swap') {
        game.swapCard();
    } else if (actionType === 'deck') {
        game.deckCard();
    } // 'skip' does nothing to the cards, just advances turn

    // After the action, check if the round should end.
    if (game.isLastPlayer()) {
        // The round is over! Start the timed sequence instead of just advancing the turn.
        executeEndOfRoundSequence(roomId);
    } else {
        // The round is not over, just advance the turn and send a normal update.
        game.advanceTurn();
        io.to(roomId).emit('gameStateUpdate', getRoomState(room));
    }
}


async function executeEndOfRoundSequence(roomId) {
    if (!activeGames.has(roomId)) return;

    const room = activeGames.get(roomId);
    const game = room.gameInstance;

    console.log(`[Sequence] Starting end-of-round for room ${roomId}`);

    // The final action has just happened. Let's send one last update so
    // everyone sees the final card layout before the reveal.
    io.to(roomId).emit('gameStateUpdate', getRoomState(room));
    await delay(2000); // Wait 2 seconds for players to see the final cards.

    const outcome = game.determineOutcome(); // This now returns our result object
    io.to(roomId).emit('roundOutcome', outcome); // Send a NEW, specific event for the outcome
    await delay(2000); // A longer pause for the result to sink in.

    if (game.playersInCount <= 1) {
        const winner = game.determineWinner();
        io.to(roomId).emit('gameOver', winner);
        await delay(2000);
        room.state = "LOBBY";
        io.to(roomId).emit('gameStateUpdate', getRoomState(room));
    } else {
        game.startRound(); // This deals new cards and resets turns
        io.to(roomId).emit('newRoundStarted', getRoomState(room));
    }
}

function getRoomState(room) {
    const state = {
        roomId: room.roomId,
        hostId: room.hostId,
        state: room.state,
    };

    if (room.gameInstance) {
        // If the game has started, merge the game engine's state into our object.
        // The '...' spread operator copies all properties from getGameState() into our state object.
        Object.assign(state, room.gameInstance.getGameState());
    } else {
        // If the game hasn't started, just include the lobby player list.
        state.players = room.players;
    }

    return state;
}
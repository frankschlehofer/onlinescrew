// gameManager.js

import Game from './game_logic/Game.js'

// A mapping from unique game id's to game instances. Used to track all running games
const activeGames = new Map();

const generateRoomId = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export function createGame(hostSocket, playerName, callback) {
    const roomId = generateRoomId();

    // Use socket.io's built-in room feature
    hostSocket.join(roomId); 

    const room = {
        roomId,
        hostId: hostSocket.id,
        players: [{ id: hostSocket.id, name: playerName }],
        state: 'LOBBY',
        gameInstance: null
    };

    activeGames.set(roomId, room);
    console.log(`[Game Manager] New room created by ${hostSocket.id}: ${roomId}`);
    // Send the new room ID back
    callback({ roomId }); 
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

    

    const curGameState = room.gameInstance.getGameState();
    console.log('Before callback check. Game state: ', curGameState)
    // Send the lobbyData back, including the updated gameInstance information.
    callback({ success: true, gameState: curGameState })
}
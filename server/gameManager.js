// gameManager.js

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
    };

    activeGames.set(roomId, room);
    console.log(`[Game Manager] New room created by ${hostSocket.id}: ${roomId}`);
    callback({ roomId }); // Send the new room ID back
}

export function joinGame(socket, roomId, playerName, callback) {
    if (!activeGames.has(roomId)) {
        callback({ success: false, message: 'Room not found.' });
        return;
    }
    
    const room = activeGames.get(roomId);
    socket.join(roomId);
    room.players.push({ id: socket.id, name: playerName });

    console.log(`[Game Manager] <span class="math-inline">\{playerName\} \(</span>{socket.id}) joined room ${roomId}`);
    callback({ success: true, lobbyData: room });
}
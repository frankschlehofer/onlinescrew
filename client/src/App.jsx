// client/src/App.jsx

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to your game server. Make sure the port is correct.
const socket = io("http://localhost:3000");

function App() {
  // --- STATE MANAGEMENT ---
  // A single state object to hold all game-related data.
  const [gameState, setGameState] = useState(null); 
  // State for the inputs in the join/create form.
  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  
  // This effect hook runs only once to set up all socket listeners.
  useEffect(() => {
    // A single handler for any lobby update.
    const handleLobbyUpdate = (lobbyData) => {
      console.log("Lobby updated!", lobbyData);
      setGameState({ ...lobbyData, phase: 'LOBBY' }); // Set a 'phase' to control UI
      setRoomInput(lobbyData.roomId);
    };

    // A single handler for any in-game state update.
    const handleGameStateUpdate = (newGameState) => {
        console.log("--- GAME STATE UPDATE ---", newGameState);
        setGameState({ ...newGameState, phase: 'GAME' });
    };
    
    // Listening for all server events.
    socket.on('lobbyUpdate', handleLobbyUpdate);
    socket.on('joinSuccess', handleLobbyUpdate); // Both success and updates go to the lobby
    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('joinError', (message) => alert(message));

    // Cleanup listeners when the component unmounts.
    return () => {
      socket.off('lobbyUpdate', handleLobbyUpdate);
      socket.off('joinSuccess', handleLobbyUpdate);
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('joinError');
    };
  }, []); // The empty array ensures this runs only once.

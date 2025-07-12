import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to your game server
const socket = io("http://localhost:3000");

function App() {
  // State variables to hold data from the server and user input
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [lobby, setLobby] = useState(null); // Will hold the whole lobby object

  // UseEffect hook to set up socket event listeners once
  useEffect(() => {
    // This runs when the component first loads
    console.log("Setting up listeners...");

    const handleLobbyUpdate = (lobbyData) => {
      console.log("Lobby updated!", lobbyData);
      setLobby(lobbyData);
      setRoomId(lobbyData.roomId);
    };

    socket.on('lobbyUpdate', handleLobbyUpdate);
    // The user's provided file has 'joinSuccess', but this simplifies it
    socket.on('joinSuccess', handleLobbyUpdate); 
    socket.on('roomCreated', (response) => {
        console.log('Room created:', response.roomId);
        setRoomId(response.roomId);
    });
    socket.on('joinError', (message) => alert(message));

    // Cleanup function: This runs when the component unmounts
    return () => {
      console.log("Cleaning up listeners...");
      socket.off('lobbyUpdate', handleLobbyUpdate);
      socket.off('joinSuccess', handleLobbyUpdate);
      socket.off('roomCreated');
      socket.off('joinError');
    };
  }, []); // The empty array [] means this effect runs only once

  // --- Handler Functions for Buttons ---
  const handleCreateGame = () => {
    if (playerName) {
      socket.emit('createRoom', { playerName });
    } else {
      alert('Please enter a name first!');
    }
  };

  const handleJoinGame = () => {
    if (playerName && roomId) {
      socket.emit('joinRoom', { roomId, playerName });
    } else {
      alert('Please enter your name and a Room ID!');
    }
  };

  // --- Render Logic ---
  return (
    <div>
      <h1>Screw Your Neighbor</h1>
      <p>Your ID: {socket.id}</p>

      {!lobby ? (
        // If we are not in a lobby yet, show the join/create form
        <div className="join-form">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
          <hr />
          <button onClick={handleCreateGame}>Create New Game</button>
          <hr />
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="Enter Room ID to Join"
          />
          <button onClick={handleJoinGame}>Join Game</button>
        </div>
      ) : (
        // If we ARE in a lobby, show the lobby details
        <div className="lobby">
          <h2>Lobby: {lobby.roomId}</h2>
          <h3>Players:</h3>
          <ul>
            {lobby.players.map((player) => (
              <li key={player.id}>
                {player.name} {player.id === lobby.hostId ? '👑 (Host)' : ''}
              </li>
            ))}
          </ul>
          {/* Conditional Rendering: Only show the Start button if I am the host */}
          {socket.id === lobby.hostId && (
            <button>Start Game</button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
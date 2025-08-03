// client/src/App.jsx

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GameBoard from './GameBoard'; // Import the new component


// Connect to your game server. Make sure the port is correct.
// Use the address your server is running on.
const socket = io("http://localhost:3000");

function App() {
  // --- STATE MANAGEMENT ---
  // A single state object to hold all lobby and game-related data.
  const [gameState, setGameState] = useState(null); 
  
  // State for the user input fields in the join/create form.
  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');

  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [winner, setWinnerName] = useState('')
  
  // This effect hook runs only once to set up all socket listeners.
  useEffect(() => {
    // This single handler is now the source of truth for the lobby and game state.
  
    socket.on('lobbyUpdate', handleStateUpdate);
    socket.on('gameStateUpdate', handleStateUpdate);
    

    // Still handle errors separately for user feedback.
    socket.on('joinError', (message) => alert(message));

    socket.on('roundOutcome', handleRoundOutcome)
    socket.on('gameOver', handleGameOver)

    // Cleanup listeners when the component unmounts.
    return () => {
      socket.off('lobbyUpdate', handleStateUpdate);
      socket.off('gameStateUpdate', handleStateUpdate);
      socket.off('joinError');
      socket.off('roundOutcome', handleRoundOutcome)
      socket.off('gameOver', handleGameOver)
    };
  }, []); // The empty array ensures this effect runs only once.

  // Handler functions

  const handleStateUpdate = (data) => {
    console.log("State updated!", data);
    setGameState(data);
    // If we get a roomId back, update our input field for easy sharing.
    if (data.roomId) {
      setRoomInput(data.roomId);
    }
  };
  
  const handleCreateGame = () => {
    if (playerName) socket.emit('createRoom', { playerName });
    else alert('Please enter a name first!');
  };

  const handleJoinGame = () => {
    if (playerName && roomInput) socket.emit('joinRoom', { roomId: roomInput, playerName });
    else alert('Please enter your name and a Room ID!');
  };

  const handleStartGame = () => {
    if (gameState?.roomId) {
        // The number of lives can be configured here later.
        socket.emit('startGame', { roomId: gameState.roomId, startingLives: 1 });
    }
  };

  // Receives end of round information of the form: type, log, losers
  const handleRoundOutcome = (outcome) => {
    console.log("Round outcome:", outcome.log);
    setOutcomeMessage(outcome.log); // Display the outcome message
  };

  const handleGameOver = (winner) => {
    console.log("Game Over. Winner: ", winner.name);
    setOutcomeMessage(`Winner is: ${winner.name}`)
    setWinnerName(winner.name)

  }

  // A single handler for all player actions during their turn.
  const handlePlayerAction = (actionType) => {
    console.log(`Sending action: ${actionType}`);
    socket.emit('playerAction', { roomId: gameState.roomId, actionType });
  };


  // --- RENDER LOGIC ---

  const renderJoinScreen = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Join or Create a Game</h2>
      <input
        type="text"
        className="p-2 rounded bg-gray-700 border border-gray-600 mb-4"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
      />
      <div className="flex flex-col items-center gap-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={handleCreateGame}>Create New Game</button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="p-2 rounded bg-gray-700 border border-gray-600"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="Enter Room ID"
          />
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" onClick={handleJoinGame}>Join Game</button>
        </div>
      </div>
    </div>
  );

  const renderLobbyScreen = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold">Lobby: <span className="text-yellow-400">{gameState.roomId}</span></h2>
      <h3 className="text-xl mt-4 mb-2">Players:</h3>
      <ul className="list-none p-0">
        {gameState.players.map((player) => (
          <li key={player.id} className="text-lg">
            {player.name} {player.id === gameState.hostId ? '👑 (Host)' : ''}
          </li>
        ))}
      </ul>
      {socket.id === gameState.hostId && (
        <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded" onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );

  const renderGameOverScreen = () => (
    <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <h3 className="text-2xl">The winner is: <span className="text-green-400">{winner} 🏆</span></h3>
        {gameState?.hostId === socket.id && (
            <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded" onClick={handleStartGame}>Play Again</button>
        )}
    </div>
  );
  
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Screw Your Neighbor</h1>
      <p className="mb-8">Your ID: {socket.id}</p>
      
      {(() => {
        if (winner) return renderGameOverScreen();
        if (!gameState) return renderJoinScreen();
        if (gameState.state === 'LOBBY') return renderLobbyScreen();
        if (gameState.players) return (
          <GameBoard 
              gameState={gameState} 
              myId={socket.id} 
              onPlayerAction={handlePlayerAction}
              outcomeMessage={outcomeMessage}
          />
      );
        return renderJoinScreen();
      })()}
    </div>
  );
}

export default App;
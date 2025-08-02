// client/src/App.jsx

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

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
  
  // This effect hook runs only once to set up all socket listeners.
  useEffect(() => {
    // This single handler is now the source of truth for the lobby and game state.
  
    socket.on('lobbyUpdate', handleStateUpdate);
    socket.on('gameStateUpdate', handleStateUpdate);
    

    // Still handle errors separately for user feedback.
    socket.on('joinError', (message) => alert(message));

    socket.on('roundOutcome', handleRoundOutcome)
    socket.on('gameOver', handleGameOver)
    socket.on('newRoundStarted', handleNewRound)

    // Cleanup listeners when the component unmounts.
    return () => {
      socket.off('lobbyUpdate', handleStateUpdate);
      socket.off('gameStateUpdate', handleStateUpdate);
      socket.off('joinError');
      socket.off('roundOutcome', handleRoundOutcome)
      socket.off('gameOver', handleGameOver)
      socket.off('newRoundStarted', handleNewRound)
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

  }

  // Handler for updating game state when a new round is starting. Currently just updates game state, but in the future
  // will do more
  const handleNewRound = (newGameState) => {
    console.log("New round is starting!", newGameState);
    setOutcomeMessage('')
    handleStateUpdate(newGameState)
  }

  // A single handler for all player actions during their turn.
  const handlePlayerAction = (actionType) => {
    console.log(`Sending action: ${actionType}`);
    socket.emit('playerAction', { roomId: gameState.roomId, actionType });
  };


  // --- RENDER LOGIC ---

  // Helper function to render the initial join/create screen.
  const renderJoinScreen = () => (
    <div className="join-form">
      <h2>Join or Create a Game</h2>
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
        value={roomInput}
        onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
        placeholder="Enter Room ID to Join"
      />
      <button onClick={handleJoinGame}>Join Game</button>
    </div>
  );

  // Helper function to render the lobby waiting screen.
  const renderLobbyScreen = () => (
    <div className="lobby">
      <h2>Lobby: {gameState.roomId}</h2>
      <h3>Players:</h3>
      <ul>
        {gameState.players.map((player) => (
          <li key={player.id}>
            {player.name} {player.id === gameState.hostId ? '👑 (Host)' : ''}
          </li>
        ))}
      </ul>
      {socket.id === gameState.hostId && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );

  // Helper function to render the main game board.
  const renderGameBoard = () => {
    const me = gameState.players.find(p => p.id === socket.id);
    if (!me) return <p>Waiting...</p>;

    const myTurn = gameState.currentTurnIndex !== null && gameState.players[gameState.currentTurnIndex].id === socket.id;
    const isLastPlayer = gameState.currentTurnIndex === gameState.lastTurnIndex;

    return (
        <div className="game-board">
            <h2>Game In Progress</h2>
            <h3>Your Info</h3>
            <p>Card: <b>{me.card}</b></p>
            <p>Lives: <b>{me.lives}</b></p>
            <hr />
            <h3>Game Status</h3>
            {outcomeMessage && <h3 className="outcome-message">{outcomeMessage}</h3>}
            <p>Current Turn: <b>{gameState.players[gameState.currentTurnIndex].name}</b></p>
            <p>Dealer: <b>{gameState.players[gameState.dealerIndex].name}</b></p>
            <hr />
            {myTurn && <h3>Your Turn!</h3>}
            {/* Show action buttons only if it's my turn */}
            {myTurn && !outcomeMessage && !isLastPlayer && (
                <div>
                    <button onClick={() => handlePlayerAction('swap')}>Swap with Next Player</button>
                    <button onClick={() => handlePlayerAction('skip')}>Skip</button>
                </div>
            )}
            {myTurn && !outcomeMessage && isLastPlayer && (
                <div>
                    <button onClick={() => handlePlayerAction('deck')}>Take from Deck</button>
                    <button onClick={() => handlePlayerAction('skip')}>Skip</button>
                </div>
            )}
        </div>
    );
  };
  
  // The main return statement for the App component.
  return (
    <div>
      <h1>Screw Your Neighbor</h1>
      <p>Your Socket ID: {socket.id}</p>
      <hr />
      
      {/* Conditional rendering based on the game's current phase/state */}
      {!gameState && renderJoinScreen()}
      {gameState?.state === 'LOBBY' && renderLobbyScreen()}
      {gameState?.players && gameState?.state !== 'LOBBY' && renderGameBoard()}
      
    </div>
  );
}

export default App;
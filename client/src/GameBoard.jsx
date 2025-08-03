// src/GameBoard.jsx
import React from 'react';

// A simple component to render a card
const Card = ({ rank, suit }) => {
  const suitSymbols = { Hearts: '♥', Diamonds: '♦', Clubs: '♣', Spades: '♠' };
  const isRed = suit === 'Hearts' || suit === 'Diamonds';
  return (
    <div className={`w-20 h-28 bg-white rounded-lg shadow-lg flex flex-col justify-between p-2 text-gray-800 border-2 ${isRed ? 'text-red-500' : 'text-black'}`}>
      <span className="text-xl font-bold">{rank}</span>
      <span className="text-3xl self-center">{suitSymbols[suit]}</span>
      <span className="text-xl font-bold self-end transform rotate-180">{rank}</span>
    </div>
  );
};

// A component to render a single player
const Player = ({ player, isCurrentTurn, isDealer, isMe, style }) => {
  const lives = Array.from({ length: player.lives }, (_, i) => i);
  const isOut = player.isOut || player.lives <= 0;

  return (
    <div
      className={`absolute flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${isOut ? 'opacity-40' : ''} ${isCurrentTurn ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-gray-700/50'}`}
      style={style}
    >
      <div className="text-lg font-bold mb-2">{player.name} {isMe ? '(You)' : ''}</div>
      {player.card ? <Card rank={player.card.rank} suit={player.card.suit} /> : <div className="w-20 h-28 bg-gray-500 rounded-lg flex items-center justify-center text-white">?</div>}
      <div className="flex mt-2">
        {lives.map(i => <span key={i} className="text-red-500 text-2xl">♥</span>)}
      </div>
      {isDealer && <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">D</div>}
    </div>
  );
};


const GameBoard = ({ gameState, myId }) => {
  if (!gameState || !gameState.players) return null;

  // --- Player Positioning Logic ---
  // Find my index in the player list
  const myIndex = gameState.players.findIndex(p => p.id === myId);
  
  // Re-order the players array so that "I" am always at index 0.
  // This makes positioning logic much easier.
  const orderedPlayers = [...gameState.players.slice(myIndex), ...gameState.players.slice(0, myIndex)];

  const totalPlayers = orderedPlayers.length;
  const radius = 250; // The radius of the circle in pixels
  const tableWidth = 600;
  const tableHeight = 600;

  return (
    <div className="relative" style={{ width: `${tableWidth}px`, height: `${tableHeight}px` }}>
      {/* The central poker table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-700 rounded-full border-8 border-yellow-800 shadow-2xl">
         <div className="w-full h-full flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold">Screw Your Neighbor</h3>
            <p className="text-lg">Current Turn: {gameState.players[gameState.currentTurnIndex].name}</p>
         </div>
      </div>

      {/* Map over the re-ordered players to position them */}
      {orderedPlayers.map((player, index) => {
        // Calculate the angle for each player. We add Math.PI / 2 to start the first player (me) at the bottom center.
        const angle = (index / totalPlayers) * 2 * Math.PI + Math.PI / 2;
        
        // Calculate the x and y coordinates using trigonometry
        const x = (tableWidth / 2) + radius * Math.cos(angle) - 50; // -50 to center the player component
        const y = (tableHeight / 2) + radius * Math.sin(angle) - 75; // -75 to center the player component

        const playerStyle = {
          transform: `translate(${x}px, ${y}px)`,
        };

        return (
          <Player
            key={player.id}
            player={player}
            isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === player.id}
            isDealer={gameState.players[gameState.dealerIndex].id === player.id}
            isMe={player.id === myId}
            style={playerStyle}
          />
        );
      })}
    </div>
  );
};

export default GameBoard;
// client/src/GameBoard.jsx
import React from 'react';

// A component for the back of a card
const CardBack = () => (
  <div className="w-20 h-28 bg-blue-500 rounded-lg shadow-lg border-2 border-white flex items-center justify-center">
    <div className="w-16 h-24 rounded-md border-2 border-blue-300"></div>
  </div>
);

// The component for the face of a card
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

// The Player component
const Player = ({ player, isCurrentTurn, isDealer, isMe }) => {
  const lives = Array.from({ length: player.lives }, (_, i) => i);
  const isOut = player.isOut || player.lives <= 0;
  const showCardFace = player.card && player.card.suit !== 'Hidden';

  return (
    <div className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${isOut ? 'opacity-40' : ''} ${isCurrentTurn ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-gray-700/50'}`}>
      <div className="text-lg font-bold mb-2">{player.name} {isMe ? '(You)' : ''}</div>
      {showCardFace ? <Card rank={player.card.rank} suit={player.card.suit} /> : <CardBack />}
      <div className="flex mt-2">
        {lives.map(i => <span key={i} className="text-red-500 text-2xl">♥</span>)}
      </div>
      {isDealer && <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">D</div>}
    </div>
  );
};

// --- NEW: A dedicated component for the action buttons ---
const ActionPanel = ({ myTurn, isLastPlayer, onAction, outcomeMessage }) => {
    // If there's an outcome message, show it instead of the buttons
    if (outcomeMessage) {
        return (
            <div className="text-center p-4">
                <h3 className="text-2xl font-bold text-yellow-300 animate-pulse">{outcomeMessage}</h3>
            </div>
        );
    }

    // If it's not my turn, show nothing
    if (!myTurn) {
        return <div className="h-16"></div>; // Placeholder to prevent layout shift
    }

    return (
        <div className="text-center p-4">
            <h3 className="text-2xl font-bold mb-4">Your Turn!</h3>
            <div className="flex justify-center gap-4">
                {!isLastPlayer && (
                    <button onClick={() => onAction('swap')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Swap</button>
                )}
                {isLastPlayer && (
                    <button onClick={() => onAction('deck')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Take from Deck</button>
                )}
                <button onClick={() => onAction('skip')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Skip</button>
            </div>
        </div>
    );
};


const GameBoard = ({ gameState, myId, onPlayerAction, outcomeMessage }) => {
  if (!gameState || !gameState.players) return null;

  const myIndex = gameState.players.findIndex(p => p.id === myId);
  if (myIndex === -1) return <p>Reconnecting...</p>;

  const orderedPlayers = [...gameState.players.slice(myIndex), ...gameState.players.slice(0, myIndex)];
  const totalPlayers = orderedPlayers.length;
  const radius = Math.min(window.innerWidth / 2 - 100, 280);
  const tableSize = radius * 2 + 150;
  
  const myTurn = gameState.players[gameState.currentTurnIndex].id === myId;
  const isLastPlayer = gameState.currentTurnIndex === gameState.lastTurnIndex;

  return (
    // We wrap the table and the action panel in a single fragment
    <>
      <div className="relative" style={{ width: `${tableSize}px`, height: `${tableSize}px` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-700 rounded-full border-8 border-yellow-800 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
          <h3 className="text-2xl font-bold">Screw Your Neighbor</h3>
          <p className="text-lg mt-2">Current Turn: {gameState.players[gameState.currentTurnIndex].name}</p>
        </div>

        {orderedPlayers.map((player, index) => {
          const angle = (index / totalPlayers) * 2 * Math.PI - Math.PI / 2;
          const x = (tableSize / 2) + radius * Math.cos(angle);
          const y = (tableSize / 2) + radius * Math.sin(angle);

          const playerStyle = {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            transform: 'translate(-50%, -50%)',
          };

          return (
            <div style={playerStyle} key={player.id}>
              <Player
                player={player}
                isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === player.id}
                isDealer={gameState.players[gameState.dealerIndex].id === player.id}
                isMe={player.id === myId}
              />
            </div>
          );
        })}
      </div>
      
      {/* --- RENDER THE ACTION PANEL BELOW THE TABLE --- */}
      <div className="mt-8">
        <ActionPanel 
            myTurn={myTurn}
            isLastPlayer={isLastPlayer}
            onAction={onPlayerAction}
            outcomeMessage={outcomeMessage}
        />
      </div>
    </>
  );
};

export default GameBoard;
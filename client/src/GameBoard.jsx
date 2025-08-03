// client/src/GameBoard.jsx
import React from 'react';

// --- Child Components (Card, CardBack, Player) ---
// These components can remain mostly the same, but we'll make the Player component
// a bit more compact for the new layout.

const CardBack = () => (
  <div className="w-16 h-24 bg-blue-600 rounded-lg shadow-md border-2 border-white flex items-center justify-center">
    <div className="w-12 h-20 rounded border-2 border-blue-300"></div>
  </div>
);

const Card = ({ rank, suit }) => {
  const suitSymbols = { Hearts: '♥', Diamonds: '♦', Clubs: '♣', Spades: '♠' };
  const isRed = suit === 'Hearts' || suit === 'Diamonds';
  return (
    <div className={`w-16 h-24 bg-white rounded-lg shadow-md flex flex-col justify-between p-1 text-gray-800 border-2 ${isRed ? 'text-red-500' : 'text-black'}`}>
      <span className="text-lg font-bold">{rank}</span>
      <span className="text-2xl self-center">{suitSymbols[suit]}</span>
      <span className="text-lg font-bold self-end transform rotate-180">{rank}</span>
    </div>
  );
};

const Player = ({ player, isCurrentTurn, isDealer, isMe }) => {
  if (!player) {
    // Render an empty, inactive seat
    return <div className="w-24 h-36 border-2 border-dashed border-gray-600 rounded-lg"></div>;
  }

  const lives = Array.from({ length: player.lives }, (_, i) => i);
  const isOut = player.isOut || player.lives <= 0;
  const showCardFace = player.card && player.card.suit !== 'Hidden';

  return (
    <div className={`relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-28 ${isOut ? 'opacity-40' : ''} ${isCurrentTurn ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-gray-700/50'}`}>
      <div className="text-base font-bold mb-1 truncate w-full text-center">{player.name} {isMe ? '(You)' : ''}</div>
      {showCardFace ? <Card rank={player.card.rank} suit={player.card.suit} /> : <CardBack />}
      <div className="flex mt-1">
        {lives.map(i => <span key={i} className="text-red-500 text-xl">♥</span>)}
      </div>
      {isDealer && <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-white text-sm">D</div>}
    </div>
  );
};

// --- The Main GameBoard Component with Fixed Layout ---

const GameBoard = ({ gameState, myId, onPlayerAction, outcomeMessage }) => {
  if (!gameState || !gameState.players) return null;

  // --- Player to Seat Mapping Logic ---
  const MAX_SEATS = 8;
  const seats = Array(MAX_SEATS).fill(null); // Create an array of 8 empty seats

  // The server sends an ordered list of players. We map them directly to seats.
  // Player at index 0 goes to Seat 0, Player at index 1 to Seat 1, etc.
  gameState.players.forEach((player, index) => {
    if (index < MAX_SEATS) {
      seats[index] = player;
    }
  });

  const myTurn = gameState.players[gameState.currentTurnIndex].id === myId;
  const isLastPlayer = gameState.currentTurnIndex === gameState.lastTurnIndex;

  return (
    <div className="w-full flex flex-col items-center">
      {/* The Poker Table Layout using CSS Grid */}
      <div className="grid grid-cols-5 grid-rows-3 gap-4 w-[700px] h-[450px]">
        {/*
          CSS Grid Layout Explanation:
          We create a 5x3 grid. Players are placed in specific cells of this grid
          to simulate a table. 'col-start-X' and 'row-start-Y' define the cell.
          'justify-self-center' and 'items-center' help center the content.
        */}
        <div className="col-start-2 justify-self-center self-center"><Player player={seats[6]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[6]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[6]?.id} isMe={myId === seats[6]?.id} /></div>
        <div className="col-start-3 justify-self-center self-center"><Player player={seats[0]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[0]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[0]?.id} isMe={myId === seats[0]?.id} /></div>
        <div className="col-start-4 justify-self-center self-center"><Player player={seats[1]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[1]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[1]?.id} isMe={myId === seats[1]?.id} /></div>

        <div className="col-start-1 justify-self-center self-center"><Player player={seats[5]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[5]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[5]?.id} isMe={myId === seats[5]?.id} /></div>
        
        {/* The Center of the Table */}
        <div className="col-start-2 col-span-3 row-start-2 bg-green-800/80 rounded-full border-4 border-yellow-700 flex flex-col items-center justify-center p-4 text-center shadow-lg">
          <h3 className="text-xl font-bold">Screw Your Neighbor</h3>
          <p className="text-md mt-2">Current Turn: <span className="font-bold text-yellow-300">{gameState.players[gameState.currentTurnIndex].name}</span></p>
        </div>

        <div className="col-start-5 justify-self-center self-center"><Player player={seats[2]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[2]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[2]?.id} isMe={myId === seats[2]?.id} /></div>
        
        <div className="col-start-2 justify-self-center self-center"><Player player={seats[4]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[4]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[4]?.id} isMe={myId === seats[4]?.id} /></div>
        <div className="col-start-4 justify-self-center self-center"><Player player={seats[3]} isCurrentTurn={gameState.players[gameState.currentTurnIndex].id === seats[3]?.id} isDealer={gameState.players[gameState.dealerIndex].id === seats[3]?.id} isMe={myId === seats[3]?.id} /></div>
      </div>

      {/* Action Panel */}
      <div className="mt-8 h-24"> {/* Added fixed height to prevent layout shift */}
        {outcomeMessage ? (
            <div className="text-center p-4">
                <h3 className="text-2xl font-bold text-yellow-300 animate-pulse">{outcomeMessage}</h3>
            </div>
        ) : myTurn && (
            <div className="text-center p-4">
                <h3 className="text-2xl font-bold mb-4">Your Turn!</h3>
                <div className="flex justify-center gap-4">
                    {!isLastPlayer && <button onClick={() => onPlayerAction('swap')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Swap</button>}
                    {isLastPlayer && <button onClick={() => onPlayerAction('deck')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Take from Deck</button>}
                    <button onClick={() => onPlayerAction('skip')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Skip</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
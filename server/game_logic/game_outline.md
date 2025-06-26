# Game Preparation
Host creates a game room. This generates a unique room identification code that is used for joining.
Other players join the game room.
When ready, host can start game

# Start of Game
Host initiates start of game
    - Server receives this, initializes a game with the lobby data
    - Server randomly decides the first 'dealer', or person who is first to begin swapping
    - Server deals out card to each player, starting at dealer an going in order
    - Server relays this information back to each player, including the updated player data,the lives and card held, out state, 
        and the index of where the action lies

# During Round
A round consists of giving the choice for all 'in' players to swap or skip
Player with the action chooses to Swap, Skip, or Deck their card, where the choice of deck is only for the last player
    - Once an option is selected, this choice should be emitted to all other players in the lobby, aswell as back to the server
    - The server conducts the player action, and returns to the players in the lobby the updated state of the game, aswell as the index of
        the player with the action.

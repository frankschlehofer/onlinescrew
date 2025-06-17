import Deck from './Deck.js'
import Player from './Player.js'

class Game {
    constructor(starting_lives) {
        this.deck = new Deck();
        this.players = [];
        this.starting_lives = starting_lives;
    }

    addPlayer(name) {
        const player = new Player(name, this.starting_lives);
        this.players.push(player);
    }

    // This is where the core logic lives
    startGame() {
        console.log("A new game is starting!");

        // 1. Shuffle the deck
        this.deck.shuffle();
        console.log("Deck is shuffled.");

        // 2. One card to each player
        for (const player of this.players) {
            if (!player.isOut) {
                const card = this.deck.deal();
                player.receiveCard(card);
            }
        }
        
        // Log the hands to the console to check
        this.players.forEach(p => console.log(`${p.name} has: ${p.card.toString()}`));

        // 3. Start the round. 
    }

}

export default Game
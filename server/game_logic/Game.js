import Deck from './Deck.js'
import Player from './Player.js'

class Game {
    constructor(starting_lives) {
        this.deck = new Deck();
        this.deck.shuffle()
        this.players = [];
        this.playerCount = 0;
        this.playersInCount = 0;
        this.dealerIndex = null;
        this.starting_lives = starting_lives;
    }

    addPlayer(name) {
        const player = new Player(name, this.starting_lives);
        this.players.push(player);
        this.playerCount++;
        this.playersInCount++;
    }

    /*
     * This is where the core logic is
     * -- Start game
     * -- Loop game until one person remains
     *      - Shuffle deck
     *      - Loop dealing until deck dose not have suitable number of cards (one for each player plus one extra in the deck)
     *          - For each round, first player (or dealer) has first choice of swapping for staying, loop until last player
     *          - Last player can deck it or not
     *          - Some general rules
     *              - King is the highest card, Ace lowest
     *              - A swap cannot be denied, unless the person has a King
     *              - If the last person chooses to deck it, they can get blocked if they pull a king from the deck
     *          - Determine loser(s) by following game rules
     *              - Lowest card loses a life
     *              - Paired cards are safe
     *              - Trip cards, person(s) with lowest lives loses a life
     *              - Quad cards, all people lose all lives, assuming this doesnt end the game
     *              - In the event that all cards match except for a king, the king loses a life
     * 
     */
    startGame() {
        console.log("A new game is starting. All lives are reset");

        // Start game loop. Game continues until only one player remains
        while (this.playersInCount > 1) {

            console.log('\n\n --- New Round ---\n\n')
            // Check if deck contains enough cards to start round, if not, reset deck and reshuffle
            if (!this.canRoundStart()) {
                this.resetDeck();
            }

            // Advance the dealer. If first round, will choose a random index to start for now
            this.advanceDealer()

            // Deal one card to each player, starting at the current 'dealer'
            this.dealCards();

            // Log the hands to the console to check
            this.players.forEach(p => console.log(`${p.card == null ? "" : `${p.name} has ${p.card.toString()}`}`));
            
            // For now, just take lowest card and subtract a life
            this.determineOutcome();

            // Clean up for end of round. Just removes card from players hand
            this.cleanUp()
        }

        // Determine winner

        const winner = this.determineWinner();
        console.log(`Winner is ${winner.name}`);
    }

    // Helper function to determine if the deck contains enough cards to start a round
    canRoundStart() {
        // Deck needs atleast 1 card for each player plus 1 card so last player can deck
        if (this.deck.numRemainingCards() >= this.playersInCount + 1) {
            return true;
        }
        return false
    }

    // Helper for reseting and shuffling the deck
    resetDeck() {
        this.deck = new Deck();
        this.deck.shuffle()
        console.log("Deck reset and shuffled")
    }

    // Helper to deal one card to each player with lives
    dealCards() {
        for (let i = 0; i < this.playerCount; i++) {
            // Deal first to dealer, then to rest, only dealing to players still in
            const index = (this.dealerIndex + i) % this.playerCount;
            const player = this.players[index];
            if (!player.isOut) {
                const card = this.deck.deal();
                player.receiveCard(card);
            }
        }
    }

    // Either sets the initial dealer to a random index or advances the dealerIndex to the next player still in
    advanceDealer() {
        if (this.dealerIndex === null) {
            // If it's the first hand, pick a random dealer.
            this.dealerIndex = Math.floor(Math.random() * this.playerCount);
        } else {
            // Move to the next index, wrapping around if necessary.
            this.dealerIndex = (this.dealerIndex + 1) % this.playerCount;
        }
        
        // If the next player is sitting out, it moves the dealer index again.
        while (this.players[this.dealerIndex].isOut) { 
            this.dealerIndex = (this.dealerIndex + 1) % this.playerCount;
        }
    }

    // Core of the game logic. Determines who loses a life at the end of the round
    determineOutcome() {
        console.log("Evaluating round");
        let lowPlayer = this.players[this.dealerIndex];
        let lowCard = lowPlayer.getCard();
        
        // Determine loser
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            if (!player.isOut) {
                let curCard = player.getCard()
                if (lowCard.compareTo(curCard) > 0) {
                    lowCard = curCard
                    lowPlayer = player;
                }
            }
        }

        console.log(`Player: ${lowPlayer.name} loses a life`);

        // Subtract life or remove from game. 
        if (lowPlayer.lives == 1) {
            lowPlayer.lives = 0;
            lowPlayer.isOut = true;
            this.playersInCount--;
            console.log(`Player: ${lowPlayer.name} is out`);
        }
        else {
            lowPlayer.lives--;
        }
    }

    // Called when one player remains. Utilizes the advanceDealer() function to determine the last player in
    determineWinner() {
        this.advanceDealer();
        return this.players[this.dealerIndex];
    }

    cleanUp() {
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            player.removeCard();
        }
    }

}

export default Game
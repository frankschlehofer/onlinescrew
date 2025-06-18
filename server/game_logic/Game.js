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

        this.prepareGame();

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

    // Prepares for a new game. Resets lives, cards, deck
    prepareGame() {
        this.resetDeck();
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            player.removeCard();
            player.setLives(this.starting_lives)
        }
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
        
        // Define a mapping from the ranks of cards in play to the number of their appearances
        const rankCounts = new Map();
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            if (!player.isOut) {
                const rank = player.card.getRankNum();
                rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
            }
        }

        // Extract the counts and ranks from this mapping into arrays
        const counts = Array.from(rankCounts.values());
        const ranks = Array.from(rankCounts.keys());

        // Determine the precense of quad cards
        if (counts.includes(4)) {
            const quadRank = ranks.find(rank => rankCounts.get(rank) === 4);
            const quadedPlayers = this.players.filter(p => p.card.getRankNum() === quadRank);
            quadedPlayers.forEach(p => {
                this.removePlayer(p);
            });
            console.log(`QUAD ${quadRank}s`)
        }
        // Determine trips
        else if (counts.includes(3)) {
            const tripRank = ranks.find(rank => rankCounts.get(rank) === 3);
            const tripHavers = this.players.filter(p => p.card.getRankNum() === tripRank)
            const minLives = Math.min(...tripHavers.map(p => p.lives));
            const losers = tripHavers.filter(p => p.lives === minLives);
    
            losers.forEach(loser => {
                console.log(`loser: ${loser.name}`)
                this.subtractLifeOrRemovePlayer(loser)
            });
    
            const loserNames = losers.map(l => l.name).join(', ');
            console.log(`TRIP ${tripRank}s! The player(s) with the lowest lives (${loserNames}) lost a life.`)
        }
        // Default case. Lowest card loses aside from pairs
        else {
            const unsafePlayers = this.players.filter(p => !p.isOut && rankCounts.get(p.getCard().getRankNum()) === 1);
            if (unsafePlayers.length === 0) {
                // This happens if all players are paired up (e.g., two pairs in a 4-player game).
                console.log("All players were safe. The round is a draw.") 
            }
            else {
                // Find the loser among the unsafe players.
                let loser = unsafePlayers[0];
                for (let i = 1; i < unsafePlayers.length; i++) {
                    if (loser.card.compareTo(unsafePlayers[i].card) > 0) {
                        loser = unsafePlayers[i];
                    }
                }
                this.subtractLifeOrRemovePlayer(loser)
                console.log(`${loser.name} had the lowest card (${loser.card.rank}) and loses a life.`)
            }
        }
    }

    // Called when one player remains. Utilizes the advanceDealer() function to determine the last player in
    determineWinner() {
        this.advanceDealer();
        return this.players[this.dealerIndex];
    }

    // Helper for cleanup at the end of round
    cleanUp() {
        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i];
            player.removeCard();
        }
    }

    removePlayer(player) {
        player.setLives(0);
        player.isOut = true;
        this.playersInCount--;
        console.log(`Player: ${player.name} is out`);
    }
    subtractLifeOrRemovePlayer(player) {
        const lives = player.lives;
        if (lives == 1) {
            this.removePlayer(player)
        }
        else {
            player.lives--;
        }
    }

}

export default Game
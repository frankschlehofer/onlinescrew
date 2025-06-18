// Deck.js

import Card from './Card.js'

const SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

class Deck {
    constructor() {
        // Create a fresh, ordered deck of 52 cards upon creation
        this.cards = SUITS.flatMap(suit => {
          return RANKS.map(rank => {
            return new Card(suit, rank);
          });
        });
    }

    // Method to shuffle the cards array
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
        // Pick a random index before the current one
        const j = Math.floor(Math.random() * (i + 1));
        // Swap the two elements
        [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Method to deal a single card
    deal() {
        // Removes and returns the last card from the array
        return this.cards.pop();
    }

    numRemainingCards() {
      console.log(`Num remaining cards: ${this.cards.length}`)
      return this.cards.length;
    }

}

export default Deck
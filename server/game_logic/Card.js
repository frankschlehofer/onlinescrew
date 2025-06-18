// Card.js

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        return `${this.rank} of ${this.suit}`;
    }

    // Compares the rank of one card to another. Return -1 if the card calling the function is less than the card in the parameter
    compareTo(other) {
        const thisRank = this.getRankNum()
        const otherRank = other.getRankNum();

        if (thisRank < otherRank) {
            return -1;
        }
        else if (thisRank == otherRank) {
            return 0;
        }
        else {
            return 1;
        }
    }

    // Returns the numerical ranking of the given card. Useful for determing card ordering
    getRankNum() {
        switch (this.rank) {
            case 'A':
                return 1;
            case 'K':
                return 13;
            case 'Q':
                return 12;
            case 'J':
                return 11;
            default:
                return parseInt(this.rank, 10); 
        }
    }
}

export default Card
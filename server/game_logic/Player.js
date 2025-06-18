// Player.js

/* 
 * In Screw Your Neighbor, every player only ever has one card in their hand
 */
class Player {
    constructor(name, lives) {
        this.name = name
        this.card = null
        this.lives = lives
        this.isOut = false
    }

    receiveCard(card) {
        this.card = card
    }

    getCard() {
        return this.card;
    }

    removeCard() {
        this.card = null;
    }

    resetLives(lives) {
        this.lives = lives;
    }
}

export default Player
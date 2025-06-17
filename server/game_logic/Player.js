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
}

export default Player
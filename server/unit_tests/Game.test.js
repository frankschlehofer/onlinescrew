// Game.test.js

import Game from '../game_logic/Game.js';
import Player from '../game_logic/Player.js';
import Card from '../game_logic/Card.js';


// Helper function to create a real Player and deal them a real Card.
const createPlayerAndDeal = (name, rank, lives = 3) => {
    const player = new Player(name, lives);
    const card = new Card('TestSuit', rank); // The suit doesn't matter for the logic
    player.receiveCard(card);
    return player;
};


describe('Game.determineOutcome', () => {

    describe('Default Rule: Lowest Card Loses', () => {
        it('should make the player with the single lowest card lose a life', () => {
            // Arrange
            const players = [
                createPlayerAndDeal('Gavin', 'K', 3),
                createPlayerAndDeal('Matthew', 'Q', 3),
                createPlayerAndDeal('Colin', 'A', 3), // Lowest card (Ace is 1)
            ];
            const game = new Game(3);
            game.players = players;
            game.playerCount = players.length;
            game.playersInCount = players.length;

            // Act
            game.determineOutcome();
            
            // Assert
            const colin = game.players.find(p => p.name === 'Colin');
            expect(colin.getLives()).toBe(2);
        });
    });

    describe('Special Rule: Paired Cards are Safe', () => {
        it('should not penalize players with paired cards', () => {
            // Arrange
            const players = [
                createPlayerAndDeal('Tristan', 'K', 3),
                createPlayerAndDeal('Kevin', 'A', 3), // Safe pair
                createPlayerAndDeal('Aidan', 'A', 3), // Safe pair
                createPlayerAndDeal('Chris', '7', 3), // Lowest unsafe card
            ];
            const game = new Game(3);
            game.players = players;
            game.playerCount = players.length;
            game.playersInCount = players.length;

            // Act
            game.determineOutcome();

            // Assert
            const Chris = game.players.find(p => p.name === 'Chris');
            const Kevin = game.players.find(p => p.name === 'Kevin');
            const Aidan = game.players.find(p => p.name === 'Aidan');

            expect(Chris.getLives()).toBe(2); // The loser
            expect(Kevin.getLives()).toBe(3); // Stays safe
            expect(Aidan.getLives()).toBe(3); // Stays safe
        });

        it('should result in a draw if all players have paired cards', () => {
            // Arrange
            const players = [
                createPlayerAndDeal('Alice', 'K', 3),
                createPlayerAndDeal('Bob', 'K', 3),
                createPlayerAndDeal('Charlie', '7', 2),
                createPlayerAndDeal('Diana', '7', 2),
            ];
            const game = new Game(3);
            game.players = players;
            game.playerCount = players.length;
            game.playersInCount = players.length;

            // Act
            game.determineOutcome();

            // Assert: No one should lose a life
            expect(game.players.find(p => p.name === 'Alice').getLives()).toBe(3);
            expect(game.players.find(p => p.name === 'Charlie').getLives()).toBe(2);
        });
    });

    describe('Special Rule: Trip Cards', () => {
        it('should make the player with the lowest lives lose a life', () => {
            // Arrange
            const players = [
                createPlayerAndDeal('Alice', 'J', 3),
                createPlayerAndDeal('Bob', 'J', 3),
                createPlayerAndDeal('Charlie', '5', 2),
                createPlayerAndDeal('Diana', 'J', 2),
            ];
            const game = new Game(3);
            game.players = players;
            game.playerCount = players.length;
            game.playersInCount = players.length;

            // Act
            game.determineOutcome();

            // Assert
            expect(game.players.find(p => p.name === 'Diana').getLives()).toBe(1);
            expect(game.players.find(p => p.name === 'Charlie').getLives()).toBe(2);
        });
    });

    describe('Special Rule: Quad Cards', () => {
        it('should reduce all quad players lives to 0', () => {
            // Arrange
            const players = [
                createPlayerAndDeal('Alice', '8', 3),
                createPlayerAndDeal('Bob', '8', 3),
                createPlayerAndDeal('Charlie', '8', 3),
                createPlayerAndDeal('Diana', '8', 3),
                createPlayerAndDeal('Alex', '3', 3),
            ];
            const game = new Game(3);
            game.players = players;
            game.playerCount = players.length;
            game.playersInCount = players.length;

            // Act
            game.determineOutcome();

            // Assert
            
            expect(game.players.find(p => p.name === 'Alice').getLives()).toBe(0);
            expect(game.players.find(p => p.name === 'Bob').getLives()).toBe(0);
            expect(game.players.find(p => p.name === 'Charlie').getLives()).toBe(0);
            expect(game.players.find(p => p.name === 'Diana').getLives()).toBe(0);
            expect(game.players.find(p => p.name === 'Alex').getLives()).toBe(3);
        });
    });
});
# Screw Your Neighbor (Online)

Just a fun little project to build an online card game for my friends.

This started because my friends and I play online poker once in a while, and I thought I should make a similar setup for a different card game we play called "Screw Your Neighbor." The goal is to create a simple, fast, and fun way for us to connect and play a few hands from anywhere.

### Rules
* A game has a singular winner
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

The core of the game logic is built, and now the focus is shifting towards making it playable in a browser.

### The Tech Stack

Right now, the project is built with a modern JavaScript foundation:

* **Backend:** Express and Node
* **Real-time Communication:** WebSockets (to handle the live gameplay)
* **Language:** JavaScript (ES Modules)
* **Testing:** Jestfor general testing purposes

### The Road Ahead

The plan is to build this out into a full-stack web application:

* **Frontend:** An interactive user interface built with **React**.
* **Hosting:** Deploy the game so we can all access it easily. The backend will likely live on a service like **Render** or **Heroku**, with the React front end on **Vercel** or **Netlify**.

More to come soon!
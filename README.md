# Screw Your Neighbor (Online)

Just a fun little project to build an online card game for my friends.

This started because my friends and I play online poker once in a while, and I thought I should make a similar setup for a different card game we play called "Screw Your Neighbor." The goal is to create a simple, fast, and fun way for us to connect and play a few hands from anywhere.

### Rules
* A game has a singular winner
Starting at a random inital dealer, everybody gets dealt a single card in a circle.

The core of the game logic is built, and now the focus is shifting towards making it playable in a browser.

### The Tech Stack

Right now, the project is built with a modern JavaScript foundation:

* **Backend:** Express and Node
* **Real-time Communication:** WebSockets (to handle the live gameplay)
* **Language:** JavaScript (ES Modules)
* **Testing:** Jest (to make sure the game rules are solid and don't break)

### The Road Ahead

The plan is to build this out into a full-stack web application:

* **Frontend:** An interactive user interface built with **React**.
* **Hosting:** Deploy the game so we can all access it easily. The backend will likely live on a service like **Render** or **Heroku**, with the React front end on **Vercel** or **Netlify**.

More to come soon!
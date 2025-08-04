# To-Do List: Screw Your Neighbor

### DONE

- Core game logic and server work.
- Players can create & join lobbies.
- A basic React frontend is connected.

---

### Phase 1:Backend 

*Finish the core rules and make the server stable.*

- [ ] **Handle Player Disconnects:** Make sure the game doesn't break if someone closes their browser.
- [ ] **Implement All King Rules:** Add the logic for the "King Exception," "King Swap Block," and "King Deck Block."

---

### Phase 2: Frontend

*Build the essential UI so the game is easy to understand and play.*

- [ ] **Create a Visual Game Table:** Arrange players in a circle and visually highlight whose turn it is.
- [ ] **Display Cards and Lives:** Show each player's card and their remaining lives (e.g., with heart icons ❤️).
- [ ] **Show the Round Outcome:** Display a clear message on screen when a player loses a life.
- [ ] **Grey Out Eliminated Players:** When a player is out of lives, make them visually distinct.

---

### Phase 3: Make it Fun (Polish & Extras)


- [ ] **Add a Lobby Chat:** Let players talk to each other before the game starts.
- [ ] **Add a "Copy Room Code" Button:** Make it easy for the host to invite friends.
- [ ] **Add Sound Effects:** Simple sounds for key moments (swapping, losing a life, etc.).
- [ ] **Deploy Online:** Get the game on a service like Render (backend) and Vercel (frontend) so your friends can play
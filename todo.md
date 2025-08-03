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
- [ ] **Add Server-Side Validation:** Prevent players from taking actions when it's not their turn.
- [ ] **Create Timed End-of-Round Sequence:** Use `async/await` to add pauses between the round outcome and the start of the next round for better pacing.

---
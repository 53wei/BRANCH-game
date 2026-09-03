# Evidence

- **Player behaviour:** the journal records what was observed. It never announces
  that a witness lied.
- **Data:** immutable observable facts, evidence channel, narrative tags and
  conditionally unlocked interpretations.
- **Input / output:** discovery stores an evidence id; recontextualization unlocks
  another interpretation on the same id without editing its facts.
- **Failure / reset:** duplicate discovery is idempotent; unknown evidence ids are
  rejected; puzzle reset does not erase discovered facts.
- **Not included:** truth scores, trust points, replacing old clues with new ids.


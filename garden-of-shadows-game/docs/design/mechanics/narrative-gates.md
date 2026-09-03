# Narrative Gates

- **Player behaviour:** investigations remain semi-open, while major revelations
  retain their locked order.
- **Data:** `requiredAll`, grouped `requiredAny`, minimum independent evidence
  channels and the beat unlocked by the gate.
- **Input / output:** evidence/flags enter a pure evaluator; unlocked gate ids and
  beats enter the save state.
- **Failure / reset:** evaluation is idempotent and cannot consume evidence;
  checkpoint restore recomputes before applying saved unlocks.
- **Not included:** scattered compound `if` statements or a fully open revelation
  graph.


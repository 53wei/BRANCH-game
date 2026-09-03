# Borrow and Anchor

- **Player behaviour:** only a highlighted whitelist object can be borrowed. It
  becomes usable in the current world; anchoring occupies the single slot and
  makes it survive cognition switches.
- **Data:** `BorrowableConfig`, runtime instance id, source cognition, target
  anchor and `AnchorSlot`.
- **Input / output:** borrow creates registered visual and collision prefabs;
  anchor changes persistence, never clones arbitrary scene meshes.
- **Failure / reset:** invalid anchors fail without mutation; unanchor, puzzle
  reset, anchor recovery and safe checkpoint recovery are mandatory.
- **Not included:** free-form object grabbing, a second slot, serialized mesh
  JSON, physics duplication.


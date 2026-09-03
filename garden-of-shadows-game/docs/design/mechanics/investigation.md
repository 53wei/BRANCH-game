# Investigation

- **Player behaviour:** normal traversal is third person. A 200–450 ms transition
  enters first person only for precise evidence, documents and framed views.
- **Data:** camera mode, previous exploration pose, focus ray, interactable id.
- **Input / output:** camera-controls performs pose transitions; a center-screen
  Raycaster queries only the interaction layer and returns the nearest valid hit.
- **Failure / reset:** camera casts prevent wall cheating; exit restores heading
  without resetting character animation.
- **Not included:** permanent first-person traversal, whole-scene ray scans,
  always-visible key help.


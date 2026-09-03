# Camera and Character

- **Player behaviour:** shoulder exploration is stable through gates, corridors,
  slopes and interiors; investigation is a short first-person transition.
- **Data:** exploration/investigation poses, shoulder offset, safe camera distance,
  movement intent and surface tag.
- **Input / output:** camera-controls handles interpolation; Rapier KCC handles
  move-and-slide, slopes, autostep and ground snap; Rapier casts shorten the boom.
- **Failure / reset:** falling outside the safe volume restores the latest safe
  anchor; camera collision never moves the player body.
- **Not included:** custom damping/physics/animation engines or jump/combat logic.


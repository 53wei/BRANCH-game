# Borrowed View

- **Player behaviour:** a moon gate or framed opening shows the target cognition
  in real time with camera parallax.
- **Data:** frame id, target cognition, maximum activation distance, render scale,
  visibility mask and borrowable ids visible through the frame.
- **Input / output:** main camera pose produces a derived portal camera and one
  non-recursive render pass.
- **Failure / reset:** distant or fully occluded frames pause; disposal releases
  render targets; quality can lower only the portal resolution.
- **Not included:** screenshot planes, recursive portals, arbitrary paired-world
  transforms, more than two simultaneous active frames in the first version.


# Cognition State

- **Player behaviour:** switching keeps the same world position while geometry,
  collision, interaction, light and audio state change together.
- **Data:** one shared world plus `CognitionObject.states`; cognition ids are
  protagonist, wife, gardener, accountant and artist.
- **Input / output:** `setCognition(id)` applies resolved object state and emits a
  transition event after all adapters agree.
- **Failure / reset:** an unsupported id is rejected; reset returns to the saved
  cognition and reapplies every object.
- **Not included:** four copied maps, full-screen truth filters, automatic truth
  judgement, cognition-specific physics engines.


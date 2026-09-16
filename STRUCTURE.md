# IUT Ops — Structure

- `client/src/App.tsx`: mounts the full-screen game route and HUD shell.
- `client/src/components/GameCanvas.tsx`: lifecycle-safe Babylon canvas wrapper.
- `client/src/game/scene.ts`: owns Babylon scene creation, materials, campus geometry, player input, weapons, enemy loop, HUD callbacks, and cleanup.
- `client/src/index.css`: game UI, reticle, HUD, overlays, and responsive styling.
- `PLAN.md`, `MEMORY.md`, `ASSETS.md`: resumability and asset records.

Gameplay remains inside `scene.ts` as plain TypeScript and does not depend on React. React provides the canvas and HTML overlay only. The scene uses procedural Babylon meshes for campus geometry and an uploaded generated brick texture for large architectural surfaces.

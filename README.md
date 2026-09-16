# IUT Ops

A playable browser FPS prototype inspired by the supplied Islamic University of Technology campus references in Gazipur, Bangladesh. The level is a compact stylized interpretation centered on the campus signature: warm red brick, pointed arches, water courts, palm-lined brick roads, lawns, and residence blocks.

## Play

Run the project with `pnpm install` followed by `pnpm dev`. Open the local Vite URL, click the canvas to deploy, then use `W A S D` to move, the mouse to look and fire, `Shift` to sprint, and `R` to reload. Clear each hostile wave to advance. If the operator is down, choose **Redeploy** to restart.

The deterministic visual verification route is available at `/?demo`.

## Build

`pnpm check` runs TypeScript validation and `pnpm build` creates the production bundle.

## Implementation

Gameplay lives in `client/src/game/scene.ts` as plain TypeScript. Babylon.js renders the first-person environment and procedural campus geometry, while React owns the full-screen canvas wrapper and HTML HUD. The brick material is served from Manus storage at `/manus-storage/iut-brick-texture_ec5cddf1.png`; this keeps the repository lightweight and follows the runtime asset workflow.

This is an inspired game environment, not a survey-grade reconstruction of the real campus. The supplied reference analysis is in `CAMPUS_ANALYSIS.md`.

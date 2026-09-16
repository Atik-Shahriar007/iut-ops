# IUT Ops — Build Plan

## Scope
A self-contained browser FPS prototype inspired by the supplied Islamic University of Technology campus images. The playable slice focuses on a compact central campus arena with red-brick architecture, an arch gateway, water courts, palms, lawns, and a residence-block flank.

## Risk slices
1. First-person camera, pointer lock, WASD movement, sprint, shooting, reload, and collision boundaries.
2. Enemy-wave loop with simple chase/attack behavior, raycast hits, health, ammo, score, and restart state.
3. Procedural campus landmarks: water courts, gateway, bridges, palm avenue, brick buildings, and dormitory block.
4. Responsive HUD and deterministic `?demo` camera route for visual verification.

## Verification criteria
- `pnpm check` passes.
- `pnpm build` passes.
- Browser renders the campus without runtime errors.
- WASD movement, mouse aim, click-to-shoot, R reload, and Shift sprint are wired.
- HUD shows health, ammo, score, wave, and objective text.
- Defeating all enemies advances the wave; player death presents a restart overlay.
- `?demo` renders a deterministic moving view that exposes the central gateway, water, avenue, and buildings.

# IUT Ops — Project Context and Handoff

## 1. Project identity

**IUT Ops** is a playable browser-based first-person shooter prototype inspired by the Islamic University of Technology (IUT) campus in Gazipur, Bangladesh. The repository is owned by the user and lives at:

- GitHub: `https://github.com/Atik-Shahriar007/iut-ops`
- Main branch: `main`
- Current latest repository commit at the time of this handoff: `5c8cafc`
- GitHub owner/account: `Atik-Shahriar007`
- Git author identity for future commits: `Atik Shahriar <atikshahriar16@iut-dhaka.edu>`

The game is an **inspired, stylized interpretation**, not a survey-grade or exact reconstruction of the real IUT campus. The supplied reference archive contained five mixed-angle campus images rather than a complete top-down map. The design therefore uses the campus's recognizable visual language—warm red brick, pointed gateways, water courts, palm-lined brick roads, lawns, and residence blocks—without claiming geographical accuracy.

## 2. Current product phase

The project is in the **playable visual prototype / vertical-slice phase**. The core loop works: enter the campus scene, move in first person, aim, shoot hostile waves, reload, monitor health/ammo/score, and restart after defeat.

The current prototype already contains:

- Procedural Babylon.js campus geometry.
- First-person WASD movement and mouse look.
- Pointer-lock deployment flow.
- Hostile enemy waves with basic pursuit and damage.
- Shooting with ray-based hit detection.
- Muzzle flash and impact spark effects.
- Procedural Web Audio shot and hit feedback.
- A visible low-poly first-person sidearm.
- Weapon recoil and idle sway.
- Slide and magazine reload animation.
- Procedural reload sound sequence.
- Manual reload using `R`.
- Automatic reload after the final round.
- Unlimited reserve ammunition; the player only needs to reload the 30-round magazine.
- Live tactical radar/minimap showing player heading and hostile positions.
- Warm gateway lighting and cyan water-court accent lighting.
- Health, ammo, score, wave, objective, and hostile-count HUD.
- Restart/redeploy flow after game over.
- `?demo` route for visual verification; it starts stationary and uses the same player controls as the live game.

## 3. How to run and verify

From the repository root:

```bash
pnpm install
pnpm dev
```

Open the Vite URL printed by the dev server. The game is hosted in the React client and does not require a backend API or database.

Validation commands:

```bash
pnpm check
pnpm build
```

The visual verification route is:

```text
/?demo
```

The WebDev project used for preview/checkpoints is named `iut-ops-game`. The latest verified WebDev checkpoint before this handoff was:

```text
manus-webdev://c7a562d6
```

The preview route commonly used by WebDev is:

```text
/?from_webdev=1
```

## 4. Controls

| Input | Action |
|---|---|
| Click canvas | Deploy / request pointer lock |
| Mouse | Look and aim |
| Left mouse button | Fire |
| `W A S D` | Move |
| `Shift` | Sprint |
| `R` | Reload the magazine |
| Redeploy button | Restart after game over |

The magazine capacity is 30 rounds. Reserve ammo is intentionally unlimited and is shown as `∞` in the HUD. Do not reintroduce a finite reserve unless the user explicitly requests a different design.

## 5. Important source files

### `client/src/game/scene.ts`

This is the main gameplay and Babylon.js scene implementation. It owns:

- Babylon scene creation and camera setup.
- Procedural campus landmarks and materials.
- Collision setup.
- First-person camera movement.
- Enemy spawning, pursuit, attacks, and wave progression.
- Ray-based shooting and damage.
- Muzzle flashes and impact sparks.
- AudioContext tones for shooting, hits, and reloads.
- First-person sidearm meshes, recoil, sway, slide movement, and magazine movement.
- Reload state and unlimited reserve behavior.
- HUD snapshot data, including radar coordinates.

### `client/src/components/GameCanvas.tsx`

React-to-Babylon canvas lifecycle wrapper. It creates the engine/scene, forwards HUD updates, handles restart keys, resizes the engine, and disposes the scene safely.

### `client/src/App.tsx`

React HUD shell and game-over UI. It renders:

- IUT Ops branding.
- Mission/objective card.
- Sector and hostile count.
- Tactical radar.
- Crosshair.
- Health bar.
- Controls hint.
- Ammo and unlimited reserve indicator.
- Score.
- Deployment prompt.
- Redeploy overlay.

### `client/src/index.css`

Full-screen tactical HUD styling, typography, scanlines, radar visuals, responsive layout, reload status pulse, and color palette. The visual language is dark tactical UI with orange/red brick accents, muted cream text, green radar indicators, and cyan water lighting.

### `README.md`

Short user-facing run/play/build documentation.

### `CAMPUS_ANALYSIS.md`

Analysis of the five supplied campus reference images.

### `PLAN.md`, `STRUCTURE.md`, `ASSETS.md`, `MEMORY.md`

Supporting implementation notes, architecture, asset decisions, and reconstruction constraints.

### `server/`

Template compatibility server only. The project is intended to remain frontend-focused. Do not alter backend/API/database behavior unless the user specifically expands the scope.

## 6. Visual and gameplay decisions

The environment is deliberately low-poly and procedural so it remains lightweight and easy to iterate. Main landmarks include:

- Central ceremonial brick plaza/avenue.
- Large pointed gateway/arch structures.
- Water courts and planting beds.
- Palm-lined roads.
- Brick residence/building blocks with windows.
- Lawns and bridge-like campus transitions.
- Strong warm gateway pools and cooler water-court lighting.

The current sidearm is a procedural low-poly mesh, not an imported realistic firearm asset. It is attached to the active camera and placed in the lower-right first-person view. It includes a frame, slide, barrel, grip, sight, and magazine. The weapon was intentionally scaled down after preview testing so it does not cover the center of the campus view.

Reload behavior:

1. Press `R` while the magazine is not full, or fire the final round.
2. Reload state lasts about 1.35 seconds.
3. The slide shifts during the early/late phases.
4. The magazine lowers during the middle phase and returns near completion.
5. Magazine refills to 30 without consuming reserve ammunition.
6. Reload tones are scheduled procedurally with Web Audio.

## 7. Babylon.js error fixes already applied

Do not remove these imports unless the Babylon setup is intentionally redesigned:

```ts
import "@babylonjs/core/Collisions/collisionCoordinator";
import "@babylonjs/core/Shaders/default.vertex";
import "@babylonjs/core/Shaders/default.fragment";
```

They fix two previously observed runtime failures:

- `DefaultCollisionCoordinator needs to be imported before...`
- `VERTEX SHADER ERROR ... Offending line ... <!doctype html>`

The shader error occurred because Babylon attempted to compile HTML fallback content as shader source when the default shader modules were not explicitly registered.

## 8. Runtime asset decision

The generated brick texture is not committed to Git because WebDev asset rules discourage large local media files in the project. The runtime material references:

```text
/manus-storage/iut-brick-texture_ec5cddf1.png
```

Keep this path working. If replacing the texture, upload the new asset through the supported WebDev storage workflow and update the constant in `scene.ts`; do not casually place large images under `client/public`.

## 9. Repository and attribution history

The repository originally contained commits authored as `Manus <dev-agent@manus.ai>`, which caused GitHub contribution credit to appear under Manus. The `main` history was rewritten and force-pushed so all existing commits now use:

```text
Atik Shahriar <atikshahriar16@iut-dhaka.edu>
```

GitHub API verification showed the commits are recognized as authored by `Atik-Shahriar007`. The local repository is configured with the same identity for future work.

Because the history was rewritten, avoid rebasing or force-pushing again unless there is a clear reason and the user understands the impact. Normal future work should use ordinary commits and pushes.

## 10. Current known limitations

- Campus geometry is stylized and compact, not geographically exact.
- Weapon geometry is low-poly and procedural.
- Audio is synthesized with simple Web Audio tones rather than recorded weapon Foley.
- Enemy AI is basic pursuit/damage logic; there is no cover system, ranged enemy behavior, or advanced pathfinding.
- Radar is a coordinate projection of the current arena, not a detailed building map.
- There are no imported character animations, weapon hand models, or skeletal rigs.
- There is no persistent score, multiplayer, backend, inventory, or save system.
- The production bundle is large because Babylon shader/runtime modules are bundled; Vite may warn about chunks over 500 kB. This is currently a warning, not a build failure.

## 11. Recommended next phases

A future AI should preserve the existing playable loop and improve in small verified increments. Recommended order:

1. **Weapon polish:** add a second weapon, weapon switching, improved hand/arm silhouette, shell ejection, muzzle smoke, and better spatial audio.
2. **Combat depth:** add enemy ranged attacks, hit reactions, armor/weak points, cover objects, and stronger wave pacing.
3. **Campus navigation:** add named zones, radar objective markers, a more accurate campus route, and additional landmarks such as a main gate, mosque, dormitory cluster, sports field, and academic buildings.
4. **Lighting/material quality:** add shadow tuning, emissive lamp meshes, water shimmer, fog, and a day/night or dusk progression.
5. **Mission layer:** add multiple objectives, wave completion messaging, difficulty selection, and a lightweight mission-select screen.
6. **Performance:** profile Babylon draw calls, reduce unnecessary meshes, and split or lazy-load heavy shader/runtime chunks if startup time becomes a concern.

## 12. Handoff instructions for another AI

Start by reading this file, `README.md`, `MEMORY.md`, `CAMPUS_ANALYSIS.md`, and `STRUCTURE.md`. Then inspect the current `main` branch rather than assuming an older checkpoint is authoritative. Run `pnpm check` before editing. Keep frontend scope unless the user explicitly asks for backend features. Preserve the Babylon side-effect imports and the Manus storage texture path. After any meaningful change, run `pnpm check`, `pnpm build`, and verify `/?demo` visually before committing.

Use the GitHub repository as the source of truth for code. The WebDev checkpoint is useful for previewing the managed project, but repository commits are the durable handoff artifact. Future commits should use:

```bash
git config user.name "Atik Shahriar"
git config user.email "atikshahriar16@iut-dhaka.edu"
```

Do not claim that this is an exact IUT map. Describe it as an IUT-inspired stylized campus arena unless the user later provides a proper survey/map dataset.

## 13. Handoff status

At handoff, the project is a working playable prototype with the requested combat feedback, radar, campus lighting, first-person sidearm, reload animation, reload audio, unlimited reserve ammo, error fixes, and GitHub attribution correction completed. The next AI should continue from this phase rather than rebuilding the project from scratch.

_Last updated: 2026-09-16._

# Arbor

Real-time tree growth simulation rendered with three.js. Vite + TypeScript + lil-gui.

```
npm install
npm run dev            # http://localhost:5173  (?t=60 fast-forwards, ?gravity=0.2 etc. override params)
npm run shots          # headless chromium proof shots -> shots/ (growth stages + morning/noon/golden/bluehour/night)
node scripts/screenshot.mjs 30,90 "gravity=0.12&gravitropism=0.05" alien
```

## Watching

- **Presets** (top of the panel, regrows): Oak meadow, Windswept cypress, Weeping willow, Low-gravity alien, Crimson world, Bioluminescent night, Heavy world, Journey: Earth → alien. URL: `?preset=Crimson%20world`.
- **Automation** folder: *Journey* keyframes (`Add keyframe (now)` snapshots every numeric param at the current tree age; values smoothstep between keyframes as the tree grows; presets can ship a journey). *Drift*: pick a param, toggle drift, set rate (Hz of sim time) and range (± relative); smooth low-frequency noise around the base value. The sim reads params live, so new growth records the history (bends, colour bands). If gravity/crown changes move the crown envelope, attractors are re-sampled during growth.
- **Cinema** camera (default on): slow orbit with breathing height and rare slow push-ins, always framing the tree. Any drag pauses it; it resumes after 10 s idle.
- Keys: **H** hide/show all UI (watch mode, also `?hideui=1`), **C** toggle cinema. A small overlay (preset · age · clock) fades out after 4 s without mouse movement.
- Alien params: `growth.weeping` (twig downward tropism ∝ gravity), `growth.torsion` (spiral twist per segment), `crown.bole` (clear trunk height), `leaves.shape` (fan ↔ narrow), `leaves.lightness`, `leaves.glow`/`glowHue` (bioluminescence, strongest at night), `sky.skyHue`/`skyTint` (sky+fog tint), `sky.sunHue`/`sunTint`, `sky.sun2`/`sun2Hue`/`sun2Yaw` (companion star: fill light + disc), `sky.sunSize`, `sky.groundHue`/`groundTint`.

## Layout

| Path | Role |
|---|---|
| `src/params.ts` | Single typed `ArborParams` object, defaults, `?key=value` overrides. Read live every frame (automation target). |
| `src/sim/tree.ts` | `TreeSim`: nodes/chains/buds/leaves, `step(dt)`, pipe-model radii, gravity sag, world positions. |
| `src/sim/envelope.ts` | Crown envelope profile (ellipsoid→cone→vase) and attractor sampling. |
| `src/sim/grid.ts` | Hash grid for attractor radius queries. |
| `src/sim/rng.ts` | mulberry32 seedable RNG. |
| `src/render/branchMesh.ts` | Generalized-cylinder tubes per chain, parallel-transport frames, reusable growing buffers. |
| `src/render/leaves.ts` | InstancedMesh leaves, unfold/drop scaling, wind sway via `onBeforeCompile`. |
| `src/render/textures.ts` | Procedural bark (color/normal/roughness), leaf alpha, grass textures. |
| `src/render/stage.ts` | Renderer, light rig, meadow ground (multi-scale, no tiling, trunk contact darkening), hill ring, fog, shadow frustum, camera framing, Low/High render path. |
| `src/render/atmosphere.ts` | Day/night: sun arc from `sky.timeOfDay` + latitude, Preetham sky (three `Sky`) blended into fog colour at the horizon, stars + milky-way band, moon, key-light colour/intensity, PMREM env regenerated on sun change. |
| `src/render/post.ts` | EffectComposer (High): GTAO, screen-space god rays, bloom, OutputPass (ACES), grade (split-tone, vignette, grain). |
| `src/ui.ts` | lil-gui panel (presets, automation, all params). |
| `src/automation.ts` | `Automation`: journey keyframes + per-param drift, applied before every sim step (`main.ts advance`). |
| `src/presets.ts` | Preset overrides + optional journeys. |
| `scripts/screenshot.mjs` | Playwright-core + system chromium (SwiftShader) shots; uses `window.__arbor.fastForward(s)`. |

## Model

- Space colonization: attractors sampled in the crown envelope; nodes consume attractors within the kill radius.
- Bud-based growth: each chain has one apical tip that elongates continuously (`len` grows toward `targetLen`), so nothing pops in. On segment completion the next direction is a blend of straightness, attractor pull, phototropism (sun direction), gravitropism × gravity and random wander.
- Each finished node gets one lateral bud: branch angle off the axis, rotated by the phyllotaxis angle (default 137.5°). Bud break is stochastic and suppressed within `apicalDominance × 10` nodes of a live tip on the same chain; buds with no free space in their cone stay dormant.
- Tips starve and die without attractors in the perception cone. Vigor decays per branch order.
- Direction: each new segment is clamped to `maxTurn` degrees from the previous one (slerp), and wander is a per-chain bias vector that drifts slowly, so branches bend smoothly and never curl back.
- Trunk buds break at `scaffoldBranching` × the normal rate, which gives a few large scaffold limbs instead of a broom.
- Light: every 0.5 s leafy nodes are binned into a voxel grid (4 × segment length). Each node's `light` is the mean transmittance up (weight 2) and along ±X/±Z. Side chains of order ≥ 2 whose best light stays below `selfPrune` for 4 evaluations are pruned. Pruned chains and their descendants are not drawn and add nothing to the pipe model. Leaf colour uses `light` as ambient occlusion.
- Radii: pipe model `r^n = Σ child r^n` (default n = 1.9), eased toward the target and never shrinking (secondary growth keeps the girth of pruned wood). The renderer adds a root flare with buttress lobes (`rootFlare`).
- Leaves: clusters of 4 per node, spiralled at golden-angle steps near the node end, with a petiole gap. Deep green, darker inside the crown, lighter and yellower when young. A translucency term in the fragment shader makes backlit leaves glow in the sun colour.
- Sag: per-node bend toward −Y ∝ gravity × sag × subtree length × segment length × horizontality / r², accumulated down the hierarchy. Growth decisions use the unsagged rest geometry.
- Low gravity stretches the crown envelope upward and weakens gravitropism and sag.

## Known weaknesses

- Sky radiance is clamped at 1.8 (HDR); the sun disc(s) are added in the sky shader after the clamp (sprites drew as solid quads in the GTAO pass).
- God rays are screen-space and only appear with the sun on screen. They are not tuned yet (default strength is low).
- Stars are point sprites; the moon is an unlit sphere with no phases.
- Ground/hills colours and the noon sky are still somewhat desaturated and flat.

- The branch mesh and leaf matrices are rebuilt on the CPU at about 8 Hz while growing (4 Hz when paused), not every frame. Leaf sway runs in the shader. Headless SwiftShader at t=90 (about 5k nodes, 10k drawn leaves) runs at 26 fps; it ran at 12–17 fps before the throttle. Incremental (dirty-subtree) rebuilds are not done yet.
- Pruned twigs disappear at once instead of withering. The light grid ignores the actual sun direction.
- The bark texture is unchanged: no deep fissures, no moss. Branches do not sway.
- Low-gravity alien preset grows a wide low bush on a thin spiralling stalk rather than the intended very tall tree (leader wander/turn too high); needs a retune.
- Noon foliage is green now (leaf envMapIntensity 0.3, more saturation) but still reads dark from below.
- Journey/drift changes to crown params only take effect via attractor re-sampling; cinema camera is not tested headless (shots disable it). Journey end shot (m3-journey-day-16.8-end) crops the crown top: framing lags the late upward growth after attractor re-sampling. Heavy world reads squat and buttressed but the crown is a dense flat mat.
- Branches have no wind sway, only leaves do. Sag does not resolve collisions.

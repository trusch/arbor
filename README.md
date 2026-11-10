# Arbor

Real-time tree growth simulation rendered with three.js. Vite + TypeScript + lil-gui.

```
npm install
npm run dev            # http://localhost:5173  (?t=60 fast-forwards, ?gravity=0.2 etc. override params)
npm run shots          # headless chromium proof shots -> shots/ (growth stages + morning/noon/golden/bluehour/night)
node scripts/screenshot.mjs 30,90 "gravity=0.12&gravitropism=0.05" alien
```

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
| `src/ui.ts` | lil-gui panel. |
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

- Sky radiance is clamped at 1.8 (HDR) so bloom does not flood the frame at low sun; the sun disc is therefore not visible. A dedicated sun sprite would bring it back.
- God rays are screen-space and only appear with the sun on screen. They are not tuned yet (default strength is low).
- Stars are point sprites; the moon is an unlit sphere with no phases.
- Ground/hills colours and the noon sky are still somewhat desaturated and flat.

- The branch mesh and leaf matrices are rebuilt on the CPU at about 8 Hz while growing (4 Hz when paused), not every frame. Leaf sway runs in the shader. Headless SwiftShader at t=90 (about 5k nodes, 10k drawn leaves) runs at 26 fps; it ran at 12–17 fps before the throttle. Incremental (dirty-subtree) rebuilds are not done yet.
- Pruned twigs disappear at once instead of withering. The light grid ignores the actual sun direction.
- The bark texture is unchanged: no deep fissures, no moss. Branches do not sway. The sun disc is still hidden (no sun sprite yet).
- Low gravity alone gives a taller, stiffer tree rather than a strongly alien one. Alien looks need presets that combine gravity, wander, gravitropism and crown shape.
- Branches have no wind sway, only leaves do. Sag does not resolve collisions.

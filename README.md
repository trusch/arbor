# Arbor

Real-time tree growth simulation rendered with three.js. Vite + TypeScript + lil-gui.

```
npm install
npm run dev            # http://localhost:5173  (?t=60 fast-forwards, ?gravity=0.2 etc. override params)
npm run shots          # headless chromium proof shots -> shots/
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
| `src/render/stage.ts` | Renderer (ACES, sRGB, PCF shadows), sky, ground, sun shadow frustum + camera auto-framing. |
| `src/ui.ts` | lil-gui panel. |
| `scripts/screenshot.mjs` | Playwright-core + system chromium (SwiftShader) shots; uses `window.__arbor.fastForward(s)`. |

## Model

- Space colonization: attractors sampled in the crown envelope; nodes consume attractors within the kill radius.
- Bud-based growth: each chain has one apical tip that elongates continuously (`len` grows toward `targetLen`), so nothing pops in. On segment completion the next direction is a blend of straightness, attractor pull, phototropism (sun direction), gravitropism × gravity and random wander.
- Each finished node gets one lateral bud: branch angle off the axis, rotated by the phyllotaxis angle (default 137.5°). Bud break is stochastic and suppressed within `apicalDominance × 10` nodes of a live tip on the same chain; buds with no free space in their cone stay dormant.
- Tips starve and die without attractors in the perception cone. Vigor decays per branch order.
- Radii: pipe model `r^n = Σ child r^n`, eased toward the target over time (thickening).
- Sag: per-node bend toward −Y ∝ gravity × sag × subtree length × segment length × horizontality / r², accumulated down the hierarchy. Growth decisions use the unsagged rest geometry.
- Low gravity stretches the crown envelope upward and weakens gravitropism and sag.

## Known weaknesses

- Branch mesh and leaf matrices are rebuilt every frame on the CPU. Headless SwiftShader runs at ~12 fps with 7k nodes and 14k leaves; GPU frame rate is not measured yet.
- No self-pruning or light-exposure model yet. Interior shading only comes from bud dormancy and leaf drop on thick wood.
- Low gravity alone gives a taller, stiffer tree rather than a strongly alien one. Alien looks need presets that combine gravity, wander, gravitropism and crown shape.
- Branches have no wind sway, only leaves do. Sag does not resolve collisions.

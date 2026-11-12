# Arbor

Real-time tree growth simulation rendered with three.js. Vite + TypeScript, own DOM controls panel.

```
npm install
npm run dev            # http://localhost:5173  (?t=60 fast-forwards, ?gravity=0.2 etc. override params)
npm run deploy         # build + restart the `arbor` systemd user unit -> http://10.77.0.2:8050/ (VPN)
npm run smoke          # headless chromium interaction smoke test (presets, drift, journey, hand-set values, H/C, cinema)
PORT=5300 node scripts/panelshots.mjs   # controls-panel screenshots (phone 411x777 + desktop) -> shots/panel-*.png
npm run shots          # headless chromium proof shots -> shots/ (growth stages + morning/noon/golden/bluehour/night)
node scripts/screenshot.mjs 30,90 "gravity=0.12&gravitropism=0.05" alien
```

## Leaf forms

The leaf is a choice, not only the oak: oak, willow, birch, maple, ginkgo, a round leaf, a conifer scale spray, and three invented ones (a forked frond, a ring, a spiral tendril). Every tree in the Grow tab starts with the form that suits it (willow: willow, cypress: conifer spray, Low-gravity alien: forked frond, Crimson world: ring, Bioluminescent night: spiral, Heavy world: round, the others: oak). The "Leaves" tab shows all forms as small pictures; tapping one changes the leaves of the tree you are watching at once, without regrowing. `?form=willow` sets it from the URL (`params.leaves.form`).

How it is built: each form is painted into the same square leaf map and carries its own proportions (a willow leaf is long and narrow, a ginkgo fan is wide), which stretch the leaf card together with the existing blade-shape value. A change of form writes new pixels into the texture the leaf material already uses and new card proportions into the instance matrices; the material, its shader program and the geometry stay the same, on the phone path and on desktop (`npm run smoke` switches through all forms on both and checks the program count: phone 9, desktop High unchanged). Falling leaves, litter and broken limbs use the same material, so they change with the crown; leaves already on the ground keep their old proportions. `PORT=5440 node scripts/formshots.mjs` renders every form on the real GPU (contact sheet, framed view, close-up, picker).

## Seasons

The tree lives through a year. One year takes 5 minutes at normal growth speed (the growth-speed control scales it; the
day and night cycle is separate), and a new tree starts in spring.

- Spring: the crown flushes over a few weeks, leaves unfolding small and pale yellow-green, then darkening.
- Summer: full green.
- Autumn: leaves turn one by one, the top and the sunlit outside of the crown first, the interior last, each to its own
  shade (oak russet, gold and brown; maple red and orange; birch and ginkgo yellow; willow pale yellow). Then they fall
  through the falling-leaf system, thinning the crown until it is bare, and collect as litter that fades over winter.
- Winter: a bare crown. Wood that grew meanwhile flushes next spring.

The "Seasons" tab has: seasons on/off, a "Time of year" slider that scrubs the year (the season is named), "Hold this
season", and the length of a year. The current season and year show in the corner readout and the panel header.
Every seasonal look is computed from the date alone, so scrubbing to a date shows the same tree as waiting for it.

Which trees have seasons is decided by the leaf form: oak, willow, birch, maple, ginkgo and the round leaf are
deciduous; the cypress spray is evergreen; the alien frond turns violet and sheds; the Crimson world ring turns gold
for the cold months and keeps its leaves; the bioluminescent spiral has no seasons.

URL: `?season.on=false`, `?season.date=0.62&season.hold=true` (0 = start of spring, 0.25 summer, 0.5 autumn, 0.78
winter). Scripts: `node scripts/seasonshots.mjs` (eight stations round the year), `node scripts/seasoncost.mjs`
(frame cost summer vs autumn). Not built yet: blossom, growth tied to the year, the meadow's seasons, snow, seasonal
weather, sun height by season.

## Controls panel

`src/ui.ts` + `src/ui.css` (own DOM, no lil-gui). Desktop: side panel on the right, open by default. Phone (≤ 700 px wide): a "Controls" button opens a bottom sheet (47% of the height) that the chevron collapses again. `?panel=open|closed`, `?tab=grow|shape|colours|sky|more`, `?nogui=1`.

| Tab | Contents |
|---|---|
| header (always) | state (Growing / Paused / Fully grown, twig count, age), pause/play, collapse. When fully grown a bar offers "Plant a new tree". |
| Grow | Growth speed (0.25x–20x, logarithmic), Plant a new tree (new seed), Regrow this one, preset chips |
| Shape | Gravity, Reach for light, Branchiness, Branch angle, Twist, Droop, Wildness, Crown width/height/shape, Leaf size, Leaf amount. Each has a one-line explanation, a "new growth" or "instant" tag and a Drift toggle. |
| Leaves | Leaf shape (ten forms shown as small pictures: oak, willow, birch, maple, ginkgo, round, conifer, and the alien forked, ring and spiral; changes at once on the living tree), Surprise me (harmonious random palette), Natural colours, Leaf colour, Leaf glow at night + glow colour, Sky tint, Sun colour, Ground tint (native colour picker + suggestion dots) |
| Sky | Time of day, Day and night cycle, Length of a day |
| More | Journey keyframes, drift for any value, every raw parameter by technical name, camera, quality, seed |

Rule: a value set by hand wins. Every control writes through `Automation.userSet(path, value)`, which removes that path from all journey keyframes and turns its drift off, so nothing snaps back. (Before, a journey with two or more keyframes rewrote its keyed params before every sim step, so sliders reset.)

Adding a section: controls are declared as data (`TREE`, `SKY`, `ADVANCED` lists of `SliderDef` / raw rows; `slider()`, `toggle()`, `colour()` builders) and a tab is one `tab(id, label, ...rows)` call in `buildPanel`.

## Watching

- **Presets** (chips on the Grow tab, regrows): Oak meadow, Windswept cypress, Weeping willow, Low-gravity alien, Crimson world, Bioluminescent night, Heavy world, Journey: Earth → alien. URL: `?preset=Crimson%20world`.
- **Automation** (More tab): *Journey* keyframes (`Add keyframe (now)` snapshots every numeric param at the current tree age; values smoothstep between keyframes as the tree grows; presets can ship a journey). *Drift*: pick a param, toggle drift, set rate (Hz of sim time) and range (± relative); smooth low-frequency noise around the base value. The sim reads params live, so new growth records the history (bends, colour bands). If gravity/crown changes move the crown envelope, attractors are re-sampled during growth.
- **Cinema** camera (default on): slow orbit with breathing height and rare slow push-ins, always framing the tree. Any drag pauses it; it resumes after 10 s idle.
- Keys: **H** hide/show all UI (watch mode, also `?hideui=1`), **C** toggle cinema. A small overlay (preset · age · clock) fades out after 4 s without mouse movement.
- Alien params: `growth.weeping` (twig downward tropism ∝ gravity), `growth.torsion` (spiral twist per segment), `crown.bole` (clear trunk height), `leaves.shape` (fan ↔ narrow), `leaves.lightness`, `leaves.glow`/`glowHue` (bioluminescence, strongest at night), `sky.skyHue`/`skyTint` (sky+fog tint), `sky.sunHue`/`sunTint`, `sky.sun2`/`sun2Hue`/`sun2Yaw` (companion star: fill light + disc), `sky.sunSize`, `sky.groundHue`/`groundTint`.

## Telemetry and diagnostics

The `arbor` unit runs `server/serve.mjs` (Node, no deps; unit copy in `deploy/arbor.service`). It serves `dist/` and accepts `POST /log`: JSON records are appended to `logs/client.jsonl` (gitignored) with `srv_ts`, `ua` and `ip`.

`public/telemetry.js` is a classic script loaded synchronously from `<head>`, so it runs even when the bundle fails. Per page load (`sid`) it sends:

| type | content |
|---|---|
| `start` | device (UA, deviceMemory, cores, screen, inner size, DPR), GL probe (unmasked renderer, limits, highp, float/half/uint extensions), query |
| `info` | from the bundle: real renderer GL info, quality, lowEnd, maxNodes, pixel ratio, shadow map size, diag switches |
| `hb` | every 1 s for 30 s, then every 5 s: frames, fps, sim time, nodes, leaves, leaf capacity, rebuilds, PMREM bakes, `renderer.info` memory/calls/triangles/programs, JS heap, current phase, `gap` since the previous beat |
| `error`, `unhandledrejection`, `console_error`, `console_warn`, `resource_error` | message + stack + last phase transitions |
| `webglcontextlost/restored/creationerror`, `visibility`, `pagehide`, `freeze`, `longtask` (>= 200 ms) | lifecycle |
| `branch_realloc`, `leaves_realloc` | GPU buffer growth |
| `prev_unclean` / `prev_clean` | the previous load in this tab/origin: last phase, trail of phase transitions; `prev_unclean` means no `pagehide` was seen (tab crash, OOM kill, GPU-process kill) |

Phases (`tel.phase` in `src/tel.ts`): `init stage/sim/textures/regrow/fast-forward/first frame`, `sim step`, `light grid`, `stage frame`, `pmrem bake`, `geometry rebuild`, `leaves rebuild`, `render`, `idle`. Non-frame phases are written to session+localStorage on entry; frame phases at most every 200 ms. `?tel=0` disables telemetry.

Reading the log: `jq -c 'select(.sid=="…")' logs/client.jsonl`, or `grep prev_unclean logs/client.jsonl`. `node scripts/telcheck.mjs [url] [seconds]` runs a phone-emulated headless load and prints that session's records.

Bisect switches (also as tap-through links on `/diag.html`, which shows device/GPU info and the previous run's verdict):

| query | effect |
|---|---|
| `?safe=1` | all of the below off, quality Low |
| `?shadows=0` | no shadow map |
| `?leaves=0` | no instanced leaves |
| `?sky=basic` | no Preetham sky, no PMREM bakes |
| `?grow=0` | sim paused (combine with `?t=40` for a static grown tree) |
| `?antialias=0` | no MSAA |
| `?maxNodes=N` | growth cap |
| `?rebuildHz=N` | branch-mesh rebuild rate (default ~8 Hz while growing) |

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
| `src/render/canopyShadow.ts` | CPU-baked dappled crown shadow decal for the safe leaf path (no shadow-map leaves). |
| `src/render/textures.ts` | Procedural bark (color/normal/roughness), painted 512 px leaf maps for ten leaf forms (`LEAF_FORMS`: outline, base-to-tip gradient, veins, blotches, sheen; procedural, no external assets), grass textures. |
| `src/render/stage.ts` | Renderer, light rig, meadow ground (multi-scale, no tiling, trunk contact darkening), hill ring, fog, shadow frustum, camera framing, Low/High render path. |
| `src/render/atmosphere.ts` | Day/night: sun arc from `sky.timeOfDay` + latitude, Preetham sky (three `Sky`) blended into fog colour at the horizon, stars + milky-way band, moon, key-light colour/intensity, PMREM env regenerated on sun change. |
| `src/render/post.ts` | EffectComposer (High): GTAO, screen-space god rays, bloom, OutputPass (ACES), grade (split-tone, vignette, grain). |
| `src/ui.ts`, `src/ui.css` | Controls panel (tabs Grow / Shape / Leaves / Sky / More), declarative control lists. |
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
- Sag: per-node bend toward −Y ∝ gravity × sag × subtree length × segment length × horizontality / r². A segment inherits its parent's sag fading over 3 m of wood (new wood rights itself), so droop stays local to the loaded stretch; a weeping habit (`growth.weeping` ≥ 1) has no righting and the sag sums down the whole path. Growth decisions use the unsagged rest geometry.
- Shoots do not plunge: without a weeping habit the direction a shoot aims for is never steeper than about 17° below the horizontal (unit dy ≥ −0.3).
- Low gravity stretches the crown envelope upward and weakens gravitropism and sag.

## Known weaknesses

- Sky radiance is clamped at 1.8 (HDR); the sun disc(s) are added in the sky shader after the clamp (sprites drew as solid quads in the GTAO pass).
- God rays are screen-space and only appear with the sun on screen. They are not tuned yet (default strength is low).
- Stars are point sprites; the moon is an unlit sphere with no phases.
- Ground/hills colours and the noon sky are still somewhat desaturated and flat.

- The branch mesh and leaf matrices are rebuilt on the CPU at about 8 Hz while growing (4 Hz when paused), not every frame. Leaf sway runs in the shader. Headless SwiftShader at t=90 (about 5k nodes, 10k drawn leaves) runs at 26 fps; it ran at 12–17 fps before the throttle. Incremental (dirty-subtree) rebuilds are not done yet.
- Pruned twigs disappear at once instead of withering. The light grid ignores the actual sun direction.
- The bark texture is unchanged: no deep fissures, no moss.
- Low-gravity alien preset grows a wide low bush on a thin spiralling stalk rather than the intended very tall tree (leader wander/turn too high); needs a retune.
- Noon foliage is green now (leaf envMapIntensity 0.3, more saturation) but still reads dark from below.
- Journey/drift changes to crown params only take effect via attractor re-sampling; cinema camera is not tested headless (shots disable it). Journey end shot (m3-journey-day-16.8-end) crops the crown top: framing lags the late upward growth after attractor re-sampling. Heavy world reads squat and buttressed but the crown is a dense flat mat.
- Sag does not resolve collisions.
- Low-gravity alien is tall (~24 m, 2.7× the oak) with sparse huge leaves, but its trunk still reads hair-thin at full-frame distance and the spiral arcs are only faintly visible; the crown is more columnar than arched.
- Cinema push-ins may crop crown edges briefly; the resting orbit and auto-frame fit the full bounding sphere.

## Limbs in the wind

Limbs, twigs and their leaves move with the wind. In a breeze the outer twigs stir and limbs sway a little, each following the gust that crosses the meadow; in a storm limbs lean downwind and whip back between gusts, thin wood far more than thick wood, neighbouring limbs out of phase. When the wind drops the tree is back in exactly its rest pose. Controls: Sky tab "Branch sway" (`sway.amount`, 0 = still), `?sway=0` (also on `diag.html`).

How it is built: `src/render/sway.ts` computes an offset for every node from the rest pose, the wind and the wind clock each time (nothing accumulates, the simulation never sees it). The branch mesh adds the offset of each ring's node to its rest positions and every leaf adds the offset of its twig to its rest position: one position upload and one instance-matrix upload, every frame on High and every second frame on Low, no new shader program (`npm run smoke` checks the phone program count with and without it, in calm and storm, and that the rest pose returns exactly). `node scripts/swayshots.mjs` measures the cost and takes frame bursts.

Limits: leaves are translated with their twig, they do not rotate with it (on High the leaf shader adds flutter, on the phone path leaves do not flutter on their own); bark shading uses the rest normals; the ground shadow of the crown does not move; a limb that breaks jumps from its swayed pose to its rest pose in that frame.

## Meadow and wind

The ground around the tree is a meadow of grass tufts and wildflowers (daisy, buttercup, poppy, clover) that lean and ripple as gusts travel across it. It is thinner and shorter under the crown and fades out with distance. Controls: Sky tab, "Wind" slider and "Meadow" switch (`sky.wind`, `sky.meadow`); `?meadow=0` removes it (also linked on `diag.html`). All wind comes from `src/wind.ts`. On the phone path the meadow reuses the leaf shader program (no new program is compiled; `npm run smoke` checks this). `node scripts/meadowshots.mjs [hour]` takes a trunk-base shot and measures the motion between two frames 0.5 s apart.

## Weather

A storm arrives and leaves as a sequence: the wind picks up and the meadow thrashes, heavy grey cloud closes the sky (sun disc and stars disappear), the light turns dim and cool and the haze thickens, rain falls slanted by the wind, lightning lights the whole scene for a few frames with a bolt in the distance, then it clears and the calm look returns exactly. Storms come on their own every 4 to 11 minutes (the first one no earlier than 4 minutes after load).

Controls: Sky tab, "Weather" selector (`weather.event`: changes on its own / always calm / storm that stays), "Storm now" button, "Lightning" switch (`weather.lightning`; off means no flash and no bolt at all). `?weather=storm` starts in the full storm, `?weather=calm` never storms (use it for comparison screenshots), `?lightning=0`, `?rain=0` (diag: no rain planes and no bolt plane; linked on `diag.html`).

How it is built: `src/weather.ts` is a three-free state machine (calm, breeze, front, rain, clearing) whose outputs are scalars `wind`, `cloud`, `rain`, `flash` (all exactly 0 in settled calm). `Stage.applyWeather` turns `cloud` into uniform and intensity changes on top of the values computed for the calm frame; `src/wind.ts` takes `weather.wind`; `src/render/rain.ts` draws three camera-facing streak sheets and the bolt plane with clones of the canopy-shadow decal material, so no shader program is added on any quality (`npm run smoke` checks the phone program count with and without the storm, at noon and at night, and that lightning off gives no flash). There is no thunder yet (no audio module), no splash rings or wet ground, and no separate instanced-streak rain on desktop High: both qualities use the sheets.

`node scripts/weathershots.mjs [phone|desk] [hour]` takes calm, storm (two frames 0.5 s apart), forced-flash and after-the-storm shots on the real GPU and compares the light values and the frame before and after. `node scripts/wxprograms.mjs 'weather=storm'` lists the compiled programs in phone emulation. Dev hooks: `__arbor.weather` (`trigger()`, `snapStorm()`, `strike()`, `holdFlash`), `__arbor.rain`.

## Falling leaves

- Calm and breeze: now and then a single crown leaf lets go (about one every 8 s on the grown oak, more in gusts and around dusk and dawn, none from a sapling), falls at about 1 m/s with a tumble and a drift that follows the gust at its position, and settles in the grass.
- Storm: leaves are torn off continuously, mostly from the windward and outer crown, at a rate that follows the gusts (High up to about 110 per second in a peak, Low 40). They fly downwind at up to 80 % of the local wind speed, some are lifted first, and land 2 to 14 m downwind of the trunk. Measured over 120 s of held storm: High 3199 torn off, 231 in the air at peak, 1541 on the ground; Low (pixel ratio stepped down under 4x CPU throttle) 705 / 81 / 239. Calm 120 s: 15 / 3 / 14.
- Litter: landed leaves stay, brown over two minutes, are lifted into short hops by strong gusts and are recycled oldest-first at the cap (High 2000, Low 600; in the air 320 / 110; both halved once the adaptive pixel ratio has stepped down).
- Twigs that break in a storm hand their leaves to the same system. The crown keeps the leaf that fell (it is one of about 30,000).
- `params.leaffall` (`enabled`, `rate`, `litter`), "Falling leaves" switch in the Sky tab, `?leaffall=0`, `__arbor.leafFall` (`force(n, storm)`, `stats`, `state`). Code: `src/render/leaffall.ts`. Same leaf geometry and material instance as the crown, so no extra shader program (smoke gate).

## Breakage

In storm-strength wind (`wind.base` above 0.6; the Wind slider near its top, or a storm) overloaded twigs and small limbs snap. A limb gives at its junction, hinges down for a moment while still attached, comes free, falls with its leaves, lands and stays on the ground; its leaves dry to brown over a minute. The tree keeps a stub. At most 3 fallen limbs are kept (older ones shrink away); twigs under 12 segments fall as loose leaves only.

- Rule (`TreeSim.windLoad`, 4 Hz): load ratio `u = M / S` at every chain base, wind moment (gust² × leaf and wood sail area × lever arm across the wind) plus a gravity moment, against `S = strength × SIGMA_REF × r³`. Damage accumulates while `u > 1` and the limb breaks when it passes 1. `params.breakage.strength` (default 1) scales the wood strength, `params.breakage.enabled` and `?breakage=0` turn the rule off.
- By hand: `__arbor.breakLimb()` (random order-1 limb), `__arbor.breakLimb('big')`, `__arbor.breakLimb(nodeId)`, `__arbor.breakTwig()`. `__arbor.debris.state` / `.stats` show what is falling or resting.
- Scripts (against the built app, e.g. `HOST=127.0.0.1 PORT=5401 node server/serve.mjs`): `node scripts/breakcheck.mjs URL` (sim assertions), `node scripts/breakshots.mjs URL` (frame times at the break, program counts, screenshots `shots/break-*`), `node scripts/breakcalib.mjs URL` (load-ratio distribution and 120 s storm/calm runs).

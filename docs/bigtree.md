# Big tree: growing 4x larger over 2 to 3 years

Basis: `main` d0036f3, probe `scripts/bigtree.mjs`, raw data `prof/bigtree-*.json`, screenshots `shots/bigtree-*` (not committed).
Every number is marked **M** (measured with the probe) or **E** (estimated). Section 7 lists what is not measured.

## 1. Recommendation

"4x" = **about 2.5x the height (23 m, 27 m wide) with roughly 4x the visible structure, grown over 3 years (900 s)**. Not 4x height.

| Number | Value | Why it decides |
|---|---|---|
| Nodes at 2.75x linear size | 79k (**M**), 14x today's 5.7k | Every per-node pass is 14x; at 4x height it is 216k and still growing (38x+) |
| Phone sim step at 4x CPU throttle | solo: 7.6 ms at 5.7k nodes, 62 ms at 38.5k; under load 312 ms at 79k, 679 ms at 216k (**M**) | First wall; the phone path runs 42.6 fps at 1x and 5.4 fps at 2x |
| Phone leaves drawn / simulated | 32k of 43k today; 32k of 609k at 2.75x (6.6 %); 32k of 1.6M at 4x (2.9 %) (**M**) | The crown stops filling: the cap degrades the picture before fps does |
| Time to full height | 45 s today, 90 s at 3x, 120 s at 4x (**M**) | Size alone does not stretch growth; the growth law has to change either way |
| Real oaks | 20 to 25 m | 36 m with a 0.69 m trunk radius (**M**) reads as "wrong", and nothing in the scene gives scale (scenery trees are drawn at 6 to 12 m) |

4x height is rejected: 64x crown volume, 38x+ nodes, and the picture gains nothing over 2.5x because the app camera frames the crown (same pixels). 4x mass (1.6x linear, 15 m) is the fallback if the phone work in section 5 slips; it is also the natural first shipped step.

## 2. Measurements

Setup: headless Chromium on the host GPU (ANGLE Vulkan), production build. Phone = Android emulation 411x777, DPR 2.625, Low quality, safe leaf path, CPU throttle 4x. Desktop = 1440x900, High. Tree = default oak with `crown.height/radius/base/bole` x K, `maxNodes` lifted to 1e6, midsummer held, calm, 13:00. Growth by `fastForward` in 15 s steps (90 s wall budget), then per-operation timings, then 8 s live growing and 4 s paused.

**Caveat on absolute times: the 12 runs ran in parallel on a 22-core host with a shared GPU.** Node, leaf, cell and memory counts are exact. CPU times in 2.3 are inflated about 2.3x at 1x and 1.3x at 2x against the solo runs below, and their fps is not usable; ratios between scales are the result. Desktop High fps is not measured.

Solo reruns, phone path at 4x CPU throttle, nothing else running (**M**; tree finished, time running at 1x = structure, light, leaf passes and sway all active):

| Run | Nodes | `sim.step` ms | `updateLight` ms | Branch rebuild ms / frame | Sway ms / frame | JS ms / frame, time running (mean / p95) | fps, time running | JS ms / frame paused | fps paused | Pixel ratio after adaptation |
|---|---|---|---|---|---|---|---|---|---|---|
| 1x | 5.7k | 7.6 | 3.7 | 3.6 | 1.0 | 21.5 / 31.4 | 42.6 | 6.8 | 60 | 1.75 |
| 2x | 38.5k | 62 | 32 | 28 | 9.2 | 181 / 244 | 5.4 | 15.9 | 54.8 | 1.25 |

### 2.1 Census (identical on both paths; **M**)

| Run | Attractors | Height m | Width m | Trunk r m | Nodes | Live chains | Pruned chains | Sim leaves | Light cells | State at end |
|---|---|---|---|---|---|---|---|---|---|---|
| 1x | 4000 | 9.07 | 8.77 | 0.166 | 5 685 | 301 | 322 | 43 308 | 2 366 | finished, t = 90 |
| 2x | 32 000 (K^3) | 17.82 | 18.48 | 0.344 | 38 504 | 1 192 | 2 272 | 293 660 | 13 824 | finished, t = 120 |
| 2.75x | 30 000 (K^2) | 23.21 | 26.65 | 0.445 | 78 975 | 2 064 | 3 697 | 609 044 | 33 660 | 6 tips left at t = 165 |
| 3x | 108 000 (K^3) | 26.57 | 28.90 | 0.535 | 124 835 | 2 882 | 8 300 | 943 948 | 44 064 | 181 tips left at t = 150 |
| 4x | 256 000 (K^3) | 33.96 | 35.24 | 0.689 | 216 135 | 5 519 | 12 878 | 1 616 988 | 77 658 | 3 444 tips, 20 % attractors left at t = 150 |
| 4x, today's caps | 4 000 | 9.59 | 2.15 | 0.039 | 193 | 24 | 7 | 1 428 | 420 | starved at t = 75 |

- Nodes grow as K^2.8 from 1x to 2x and K^2.9 to 3x: with constant attractor density structure follows crown **volume**. 2.75x with a third of the density still gives 79k nodes: bud break fills the space, attractor count is a weak lever.
- **4x with today's attractor count does not grow a tree**: 4000 points in 64x the volume are further apart than the 1.54 m perception radius (`segmentLength * 7`), tips starve. Result: a 9.6 m pole with 193 nodes. The start screen's size sliders have the same failure in milder form at their upper end (**E**).
- Phone default `maxNodes` 7000 / desktop 14000: growth stops (`full`) at the cap wherever the tree is; at 2x that is at about t = 62 with the crown a quarter built (**M** from the trajectory: 4 681 nodes at t = 60, 18 184 at t = 75).
- Light grid: 0.88 m cells, 78k at 4x, under its 400k hard limit (above it `updateLight` silently returns and light, pruning and leaf bake freeze). The limit is reached near 7x (**E**).

### 2.2 Growth over time (**M**, nodes / height by sim time)

| t s | 1x | 2x | 3x | 4x |
|---|---|---|---|---|
| 30 | 137 / 7.7 m | 135 / 7.9 | 155 / 8.0 | 177 / 8.0 |
| 60 | 4 499 / 9.1 | 4 681 / 17.3 | 2 131 / 17.8 | 731 / 17.0 |
| 90 | 5 685 / 9.1 | 32 359 / 17.8 | 32 330 / 26.7 | 19 949 / 26.7 |
| 120 | done | 38 504 / 17.8 | 102 728 / 26.6 | 97 817 / 34.4 |
| 150 | | done | 124 835 / 26.6 | 216 135 / 34.0 |

The leader climbs 0.33 m/s regardless of size; a bigger tree is a bare pole for longer (731 nodes on a 17 m stem at 4x, t = 60) and then fills in an explosion (up to 4 453 tips at once). Bigger makes today's "tall leafy pole" phase worse, and everything is over by t = 150 to 200.

### 2.3 Cost per operation (ms; **M**, parallel-load caveat)

Phone path, 4x CPU throttle:

| Run | Nodes | `sim.step` | of which `updateStructure` | `updateLight` (2 Hz) | Branch mesh rebuild / frame | Sway / frame | Leaf follow / frame | Leaf pass slice | Canopy bake | Meadow slice max | Forced full redraw | JS / frame growing | JS / frame paused | JS heap MB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1x | 5.7k | 17.8 | 15.9 | 8.5 | 8.0 | 2.5 | 1.9 | 2.2 | 42 | 4.3 | 326 | 60 | 12 | 67 |
| 2x | 38.5k | 79 | 75 | 41 | 53 | 18 | 4.2 | 1.7 | 23 | 4.2 | 506 | 364 | 31 | 147 |
| 2.75x | 79k | 312 | 189 | 94 | 89 | 28 | 9.0 | 1.7 | 51 | 5.4 | 1 284 | 568 | 45 | 293 |
| 3x | 125k | 343 | 332 | 145 | 147 | 51 | 2.3 | 1.8 | 39 | 4.0 | 2 154 | 968 | 63 | 399 |
| 4x | 216k | 679 | 638 | 219 | 192 | 63 | 2.3 | 1.6 | 49 | 4.9 | 2 072 | 1 380 | 63 | 669 |

Desktop High, no throttle:

| Run | Nodes | Leaves drawn | `sim.step` | `updateLight` | Branch rebuild / frame | Sway + leaf sway / frame | Render call / frame | JS / frame growing | JS heap MB |
|---|---|---|---|---|---|---|---|---|---|
| 1x | 5.7k | 38.5k | 3.0 | 1.2 | 3.0 | 1.8 | 3.1 | 22 | 53 |
| 2x | 38.5k | 214k | 24 | 12 | 27 | 15 | 109 | 230 | 287 |
| 2.75x | 79k | 451k | 47 | 38 | 38 | 23 | 78 | 244 | 410 |
| 3x | 125k | 594k | 78 | 32 | 67 | 40 | 60 | 347 | 523 |
| 4x | 216k | 1 031k | 203 | 60 | 118 | 68 | 57 | 563 | 820 |

Programs: phone 8, desktop 31 at every size (**M**): scaling by itself compiles nothing new.

### 2.4 What the picture does (looked at: framed, close under the crown, wide at 4 heights; both paths)

| Item | Finding | Kind |
|---|---|---|
| Crown fill, phone | 4x framed: a see-through twig haze, wood shows through everywhere (32k of 1.6M leaves). 2.75x close: a tangle of bare branches with a leaf every half metre. Clearly worse than today. | **M** |
| Crown fill, desktop | Dense and good at 2.75x and 4x (451k / 1.03M instances); the leaf mesh grows without bound on High (48k is its initial capacity, not a cap). | **M** |
| App camera | Frames every size (distance 36 / 71 / 93 / 106 / 136 m). Portrait fits the crown width, so the tree fills about a third of the phone height at 4x; far plane 9000 is no limit. | **M** |
| Scale | Nothing says "big": scenery trees (6 to 12 m maps) appear the same size as the 34 m tree behind it, tufts and flowers are sub-pixel. The 4x frame reads as today's tree seen from further away. | **M** |
| Meadow | Near tufts and flowers end at 26 m (`R_FAR`): at 4x the crown (17.6 m radius) covers most of the disc and its edge shows as a ring around the tree in the wide view. Far meadow ends at 64 m, flat ground at 66 m (`R_FLAT`): a 4x crown uses 27 % of the flat radius, the camera stands outside it (136 m) on the rolling terrain. | **M** |
| Shade field | 112² over ±27 m: covers the 2.75x crown at noon only; any lower sun throws the shade of a 23 m tree past 27 m, where it is cut off. | **E** (geometry) |
| Canopy decal | Grid ladder follows the footprint (no cap); texels grow to about 0.4 m at 4x, flecks and dapple coarsen. The dark patch at 13:00 reads about a third of the crown width on the phone at 4x. | **M** look, **E** texel size |
| Litter | Dropped beyond 42 m (`R_GONE`), caps 600 / 2000 leaves: under a 27 m crown the ground cover is 9x thinner per m². | **E** |
| Sway | Offsets clamp at `D_MAX` 1.3 m and bend at `FLEX / r^1.5`: the big tree's limbs barely move, only the outer twigs do. Plausible for an old oak; not verified in motion. | **E** |
| Birds, butterflies, blossom, falling leaves | Counts are fixed (2 birds, 6 to 9 butterflies, 3000 / 7000 blossom clusters, 110 / 320 air leaves). Size boosts stop at 23 m camera distance; at 93 m a bird is under 2 px. Not looked at in these runs (midsummer, calm). | **E** |
| Breakage | `SIGMA_REF` is calibrated on the 9 m oak; not re-run. Limbs of 0.2 m radius carry thousands of nodes: debris of that size is untested. | not measured |

## 3. Where the limits are

| Cost | Grows with | First wall |
|---|---|---|
| `sim.step` (`updateStructure` over all nodes, every step) | nodes | **Phone and desktop: the first wall.** Phone: 7.6 ms of a 21.5 ms frame at 5.7k nodes, 124 of 181 ms at 38.5k (**M** solo); desktop passes 16 ms between 20k and 30k nodes (**E** by interpolation) |
| Branch mesh full rebuild | nodes (ring vertices) | Second wall, same slope: 8 ms at 1x on the phone |
| Sway (node offsets + position upload) | nodes; leaf sway with drawn leaves | Third: paused phone frame 6.8 → 15.9 ms at 2x (solo), 45 ms at 2.75x (under load) |
| `updateLight` + pruning | nodes + cells (volume) | A 94 ms hitch twice a second on the phone at 2.75x |
| Leaf pass | sim leaves (volume), time-sliced | Never a frame-time wall (3 ms slices); the pass over 609k leaves takes about 14x as many frames, so colour and LOD lag by seconds (**E**) |
| Drawn leaves | capped (phone) / unbounded (desktop) | Phone: picture wall at about 1.3x linear (rank scale 0.78 already today at t = 120). Desktop: GPU and 64 bytes x instances; fps not measured |
| Canopy bake, meadow shade fill | fixed grids | Flat (**M**: 23 to 51 ms, slices 4 to 5 ms at every size) |
| JS heap | nodes + leaves | 293 MB phone path at 2.75x, 669 MB at 4x: a real phone tab is at risk above about 300 MB (**E**) |
| Blossom, critters, leaf fall, rain, sky | constants | Flat cost; their caps thin the picture instead |

How far today's code goes: on the phone, 30 fps (33 ms JS) is lost at about 8.5k nodes = 1.15x linear size (**E**, linear interpolation between the solo points 21.5 ms at 5.7k and 181 ms at 38.5k); the leaf cap already thins the crown at 1x (rank scale 0.78) and visibly from about 1.3x. On desktop about 1.5x linear (20k nodes, 100k+ leaves) before growing frames pass 16 ms (**E**).

## 4. Techniques

| # | Technique | What changes | Wall it removes | Build cost | PowerVR | Verdict |
|---|---|---|---|---|---|---|
| T1 | **Wood at rest is frozen**: `updateStructure` skips subtrees whose radii, sag and tips did not move (per-chain dirty flag, propagated root-ward; radii converge exponentially, so a chain goes to rest when its target delta is under 0.1 mm) | sim only | sim step: cost follows growing + thickening wood, not total wood | 2 packages | data only | **Do first.** Largest lever, invisible |
| T2 | **Structure tick at 10 Hz** instead of every step, radii and sag interpolated by the renderer's existing follow path | sim + main loop | remaining sim step cost /6 | 1 | data only | Do; simple, pairs with T1 |
| T3 | **Branch mesh by chain ranges**: each chain owns a fixed vertex range; a rebuild rewrites only dirty chains and uploads ranges (`applyOffsets` already works per ring) | branchMesh | rebuild | 2 | data only (same attributes; index buffer only grows at realloc, as today) | Do |
| T4 | **Twig culling by projected radius**: chains whose radius is under 0.35 px at the camera distance are not meshed (their leaves stay); hysteresis on distance | branchMesh | vertices /3 to /5 when framed (**E**: 80 % of nodes are order ≥ 3 twigs) | 1 | data only (draw range / zero-area rings) | Do after T3. Close-up is unchanged because the test is per camera distance |
| T5 | **Sway in two rates**: limbs (r > 3 cm) every frame, twig offsets every 3rd frame with interpolation; skip chains outside the frustum | sway.ts | sway | 1 | data only | Do |
| T6 | **Leaf cluster cards**: far from the camera one instance = a painted cluster of 6 to 10 leaves (same card geometry, larger matrix, uv into a cluster cell); near = single leaves; blended by distance per clump with the existing rank hash so the instance budget is constant | leaves.ts, textures | phone crown fill at constant 32k | 3 | **Not data-only as usually built** (second map or atlas uv = new geometry attribute or program). Data-only variant: a second `InstancedMesh` on `leafMaterial.clone()` with only `map` swapped (the recipe meadow, blossom and scenery already use on the phone, +0 programs) carrying the cluster cards; the single-leaf mesh keeps the leaves near the camera. Budget split by camera distance | **Do; the key picture fix on the phone.** Risk: cluster cards seen from below look like plates; needs the close view check at every size |
| T7 | **Leaf pass over the visible shell first**: order candidates by `nd.light` so interior leaves (light < 0.06) are never visited when the budget is thinning anyway | leaves.ts | pass latency at 600k sim leaves | 1 | data only | Do |
| T8 | **Do not create sim leaves on wood that is shaded out**; drop `sim.leaves` of nodes thicker than `maxBranchRadius` (they are faded to 0 today but stay in the array) | sim | memory, pass length | 1 | data only | Do; changes rng order → every preset becomes a new draw, recalibrate breakage |
| T9 | **Attractors in the growing shell only**: the envelope grows with age (section 5) and attractors are sampled in the new shell each year at constant density | sim | attractor count stays about 4000 to 12 000 alive at any time instead of 30k to 256k; also fixes starvation | 1 (part of G2) | data only | Do; it is the growth law itself |
| T10 | **Light grid cell scales with crown size** (cell = max(0.88, crown height / 28)) | sim | light tick, cell count constant about 15k | 0.5 | data only | Do. Coarser self-pruning at size; check the crown does not hollow differently |
| T11 | Hierarchical light grid | sim | same as T10 | 2 | data only | Reject: T10 gives the same bound for a quarter of the work |
| T12 | **World constants scale once with the planted tree's final size** `S = final height / 9 m` (not continuously): meadow `R_DISC/R_FAR`, shade field extent `SE`, litter `R_GONE` and caps, critter size boosts' distance range, leaf distance LOD, `D_MAX`. Tuft count stays, tuft size x sqrt(S) | meadow, leaffall, critters, sway | coverage, scale cues | 2 | data only (instance matrices; patch count unchanged) | Do, enlarged once per tree. Continuous scaling is rejected: the shade grid, patch sort and litter would re-layout while watched |
| T13 | Flat radius, far meadow, scenery | backdrop | none at 2.75x (crown radius 13 m, shade reach under 60 m) | 0 | n/a | Leave. `R_FLAT` 66 m holds up to 3x |
| T14 | **Scale cue**: scenery trees drawn at their real 15 to 25 m are fine; add nothing. The cue is the meadow (T12) and the trunk girth close up | none | | 0 | | Reject extra scenery objects |
| T15 | Desktop leaf cap + T6 on High (cap 160k, clusters beyond 60 m) | leaves.ts | desktop render and 64 B/instance uploads | 1 after T6 | n/a | Do |
| T16 | Web Worker for the sim | architecture | sim step off the main thread | 5+ | data only | Reject for now: T1 + T2 remove the cost instead of moving it; node arrays are objects, not transferable |
| T17 | Not simulating twigs (grow only to order 3, paint twigs into the cluster cards) | sim + leaves | nodes /5 | 4 | cluster recipe | Reject: the close view (camera 1.1 m from wood) shows the twigs today; this is "sacrificing stuff" |
| T18 | Raise the phone leaf cap | constant | crown fill | 0 | data only | Reject: 32k was set by measurement on the PowerVR; T6 is the way |

Expected result at 2.75x after T1 to T10 (**E**, to be re-measured package by package): phone sim step under 6 ms once the crown is closed (about 2000 moving nodes per year instead of 79k), branch upload under 5 ms, sway under 8 ms, light tick under 25 ms at 2 Hz, heap about 150 MB.

## 5. Growth over years

Year = 300 s. Target: 3 years to full size, lively first minute unchanged.

| Phase | Sim time | Height | Crown width | Trunk radius | What is new on screen |
|---|---|---|---|---|---|
| Seedling, sapling | 0 to 40 s | 0 to 8 m | 0 to 3 m | 0 to 4 cm | Exactly today's first 40 s (JUV rules untouched) |
| First crown | 40 to 150 s (summer, year 1) | 9 to 10 m | 8 m | 10 cm | Today's finished oak, reached at about the same moment as today |
| Autumn, winter 1 | 150 to 300 s | no extension | | thickens until leaf fall | Colour, drop, bare structure visible for the first time |
| Year 2 | 300 to 600 s | 10 → 17 m | 8 → 18 m | 10 → 28 cm | Spring flush from buds (shoots extend phase 0.02 to 0.35), first blossom, scaffold limbs visibly thicker, lower branches shaded out and shed in summer (debris + litter), bark tint darkens with radius |
| Year 3 | 600 to 900 s | 17 → 23 m | 18 → 27 m | 28 → 45 cm | Crown opens (interior prunes, light reaches limbs), leader slows and the crown rounds, first heavy limb break becomes possible in a storm, root flare shows |
| Mature | 900 s on | +2 % per year | twig turnover only | slow | Seasons, weather, occasional shed limb; cost at its floor (T1) |

Rules (pure functions of `season.phase` and `season.year`, the same rule as everything seasonal: scrub = wait):

- **G1, envelope grows by year**: `envelopeDims` is multiplied by `g(age)` = 0.38 at the end of year 1 (today's 9 m of a 23 m tree), 0.72 year 2, 1.0 year 3, smooth within the growing season. Attractors are sampled in the shell between last year's and this year's envelope at the start of the season (T9). This alone stretches growth; it is what makes year 2 "new wood on old scaffold" instead of "more of the same".
- **G2, shoot extension follows the season** (seasons plan S3): elongation rate x `ext(phase)` = 1 from bud break to midsummer (0.02 to 0.33), 0 from 0.4; first-year seedling exempt until t = 150 so the first minute is today's. Thickening rate x `thick(phase)` = 1 through summer, 0 in winter.
- **G3, vigor by age**: leader `growthRate` x (1, 0.6, 0.35) per year; lateral scaffold rate unchanged, so the crown widens faster than it rises in years 2 and 3 (oak habit).
- **G4, lower-limb shedding** by light (`selfPrune` on order-1 chains below 40 % of the crown height, one per year, through the existing `BreakEvent` path with `shed: true`), lifting the clean bole from 1.7 m to about 4 m.
- **G5, seasons off**: `g(age)` runs on sim time alone with the same year length.

Start screen: the two size controls become "final height" 8 to 28 m (`crown.height + base` 3 to 12.5 today) and "final width" 4 to 30 m, plus the existing fact line reading "grows for N years". Presets keep their proportions and get a final scale: oak 2.5x, willow 2x (15 m; weeping strands scale with `SAG_RIGHT`), cypress 2.5x height / 1.5x width (25 m), vase and umbrella 2x, alien worlds 2x (low gravity 30 m: the one tree that is allowed to be absurd). `maxNodes` becomes a safety net (200k desktop, 100k phone) instead of the thing that ends growth; the phone 7000 cap goes only after T1 to T6 are measured on the device.

## 6. Build plan

Order = dependency order. Every package is verified with `scripts/bigtree.mjs` (same tables as 2.1 / 2.3, run solo), `npm run smoke` built, and phone + desktop framed and close screenshots compared with `shots/bigtree-*-k1-*`. Packages marked **ship** leave the default tree unchanged or better and can go live alone.

| # | Package | Done when | Ship |
|---|---|---|---|
| **P1 (first)** | T1 dirty-chain `updateStructure` + probe solo baseline | 1x and 2x trees bit-equal in node positions and radii to main at t = 90 / 150; phone `sim.step` on the finished 2x tree under 5 ms (79 today) | **ship** |
| P2 | T2 structure tick 10 Hz | Same equality within 0.1 mm; growing-frame sim cost /4 on 2x | ship |
| P3 | T3 branch mesh chain ranges | Vertex buffers bit-equal to a full rebuild after 60 s of growth; rebuild under 3 ms on the finished 2x tree; phone programs 8 = 8 | ship |
| P4 | T5 two-rate sway + frustum skip | `swayshots` rest check passes; paused 2x phone frame under 16 ms JS | ship |
| P5 | T10 light cell scaling + T7 shell-first leaf pass | 1x unchanged (cell stays 0.88); light tick under 25 ms at 2.75x; pass latency reported | ship |
| P6 | T8 leaf bookkeeping | `sim.leaves` at 2.75x under 250k; `breakcalib` rerun, `SIGMA_REF` updated | ship (new random draw: needs a look at all presets) |
| P7 | T6a cluster map + second mesh, off by default (`?clusters=1`) | Phone programs equal with and without at noon, night, storm; cluster cards for all ten forms | ship dark |
| P8 | T6b distance blend + budget split, on | Phone 2x and 2.75x framed crown as closed as 1x today (coverage of the crown silhouette measured from a mask shot); close view identical to P6; leaf fall, debris, seasons, emergence still pass smoke | ship |
| P9 | T4 twig culling | Framed vertex count /3; no popping in a 20 s dolly (frame diff) | ship |
| P10 | T12 world constants from final size | 2.75x: tufts to the drip line + 12 m, shade field covers the 17:30 shadow, litter density per m² within 2x of today's | ship (no effect at S = 1) |
| P11 | G1 + T9 envelope by year, behind `?years=3`, size x1.6 (15 m) | Year-1 tree equal to today's at t = 150 within the random draw; year 2 and 3 add wood; no starvation; phone growing frame over 30 fps on the device | **ship: the first visibly bigger tree** |
| P12 | G2 + G3 seasonal extension and vigor | Height/width/girth curve matches the table in section 5 within 10 %; winter adds 0 nodes | ship |
| P13 | G4 limb shedding + breakage recalibration at size | One shed limb per year lands as debris; storm at 0.8 breaks 1 to 3 limbs in 120 s on the 3-year tree | ship |
| P14 | Scale to 2.5x by default, start screen ranges and preset scales, T15 desktop cap | All presets at year 3 looked at (`startshots ... trees`); phone 30 fps on the PowerVR device through three years; heap under 200 MB | ship |
| P15 | Device run: three years on the phone with telemetry | No context loss, `dpr_change` at most one step | gate for P14 |

## 7. Not measured

- Clean absolute frame times and fps (parallel-load caveat); desktop High fps at any size; anything on the real PowerVR phone.
- Trees past t = 165 s; 3x and 4x were still growing when the wall budget ended, so their node and leaf counts are lower bounds.
- Autumn, winter, blossom, storm, breakage, falling leaves, birds and butterflies at size (all runs: midsummer, calm, 13:00).
- Canopy decal texel size and shade-field cut-off at low sun (derived from the constants, not from a shot).
- Willow, cypress and the alien presets at any scale.
- GPU memory (only JS heap and three's object counts); real-phone tab memory limit.
- The expected gains in section 4 (all **E** until P1 to P5 are built and re-measured).

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
| **P1 (built, 6.1)** | T1 incremental `updateStructure` (per-node dirty sets) + probe baseline | **M**: 1x, 2x, willow and break + paused parameter change bit-equal to main at t = 30 / 90 / 150; phone `sim.step` on the finished 2x tree 2.4 ms (55.9 on main in the same session, 79 in 2.3) | **ship** |
| P2 (built, 6.1; target missed) | T2 forward pass (sag, positions) at 10 Hz of sim time, tips every step | **M**: bit-equal after a flush at the sample times; growing `sim.step` on 2x 33.1 → 19.7 ms (x 0.59, not /4); seedling tip burst on both paths without visible stepping | ship or switch off (`structureInterval = 0`) |
| P3 (built, 6.3; target missed) | T3 branch mesh chain ranges | Vertex buffers bit-equal to a full rebuild after 60 s of growth; rebuild under 3 ms on the finished 2x tree; phone programs 8 = 8 | ship |
| P4 (built, 6.4; frustum skip not built, target missed) | T5 two-rate sway + frustum skip | `swayshots` rest check passes; paused 2x phone frame under 16 ms JS | ship |
| P5 (T10 + per-cell light built, 6.4; T7 not built; target missed) | T10 light cell scaling + T7 shell-first leaf pass | 1x unchanged (cell stays 0.88); light tick under 25 ms at 2.75x; pass latency reported | ship |
| P6 | T8 leaf bookkeeping | `sim.leaves` at 2.75x under 250k; `breakcalib` rerun, `SIGMA_REF` updated | ship (new random draw: needs a look at all presets) |
| P7 (built, 6.5) | T6a cluster map + second mesh, off by default (`?clusters=1`) | Phone programs equal with and without at noon, night, storm; cluster cards for all ten forms | ship dark |
| P8 (built, 6.5, on for `?years=3`) | T6b distance blend + budget split, on | Phone 2x and 2.75x framed crown as closed as 1x today (coverage of the crown silhouette measured from a mask shot); close view identical to P6; leaf fall, debris, seasons, emergence still pass smoke | ship |
| P9 | T4 twig culling | Framed vertex count /3; no popping in a 20 s dolly (frame diff) | ship |
| P10 | T12 world constants from final size | 2.75x: tufts to the drip line + 12 m, shade field covers the 17:30 shadow, litter density per m² within 2x of today's | ship (no effect at S = 1) |
| P11 (built, 6.2) | G1 + T9 envelope by year, behind `?years=3`, size x1.6 (15 m) | Year-1 tree equal to today's at t = 150 within the random draw; year 2 and 3 add wood; no starvation; phone growing frame over 30 fps on the device | **ship: the first visibly bigger tree** |
| P12 (built, 6.2) | G2 + G3 seasonal extension and vigor | Height/width/girth curve matches the table in section 5 within 10 %; winter adds 0 nodes | ship |
| P13 | G4 limb shedding + breakage recalibration at size | One shed limb per year lands as debris; storm at 0.8 breaks 1 to 3 limbs in 120 s on the 3-year tree | ship |
| P14 | Scale to 2.5x by default, start screen ranges and preset scales, T15 desktop cap | All presets at year 3 looked at (`startshots ... trees`); phone 30 fps on the PowerVR device through three years; heap under 200 MB | ship |
| P15 | Device run: three years on the phone with telemetry | No context loss, `dpr_change` at most one step | gate for P14 |

### 6.1 P1 and P2 as built (branch `bigtree-p1`)

Mechanism and rules: CLAUDE.md "Structure pass is incremental". Probes: `scripts/structeq.mjs` (equality, node), `scripts/bigtree.mjs` (cost, phone emulation at 4x CPU throttle; `T_MAX=75` stops mid-growth, `EXTRA=structInterval=0` = P1 only).

Equality against main e15fa47 (**M**; seed 7, 60 steps per sim second, the break case with step lengths jittered 0.4 to 2.6 x; compared: world position, direction, radius, sag, subtree length of every node, pruned flag of every chain, leaf count, bounding box):

| Case | Nodes at t = 30 / 90 / 150 | P1 | P1 + P2 (after `flushStructure()`) |
|---|---|---|---|
| Default oak 1x | 184 / 4 903 / 4 903 | bit-equal, 0 differing values | bit-equal |
| 2x tree of the study | 119 / 33 566 / 37 629 | bit-equal | bit-equal |
| Weeping willow preset | 194 / 3 392 / 3 392 | bit-equal | bit-equal |
| Oak, limb break on the paused tree at t = 45 (283 nodes, 41 chains), parameter changes while paused at t = 60 (`thickness.exponent`, `growth.sag`) and t = 100 (`twigRadius`, `weeping`, `thickeningRate`) | 172 / 5 135 / 5 135 | bit-equal | bit-equal |

No tolerance is used anywhere. Without the flush, P2 leaves non-tip wood up to 0.1 sim seconds behind between two forward passes (not compared).

Cost, `sim.step(1/60)` mean of 20, phone emulation at 4x CPU throttle (**M**; one probe at a time, not on an idle host: a smoke run and the arbor-meadow worker were using CPU and GPU during every run except the main column of the two finished trees, which had only the other worker beside it; treat differences under 15 % as noise):

| Tree | Nodes | Growing tips | main | P1 (`structInterval=0`) | P1 + P2 |
|---|---|---|---|---|---|
| 2x finished (t = 150) | 38 504 | 0 | 55.9 | 2.37 | 2.46 |
| 1x finished (t = 120) | 5 685 | 0 | 7.49 | 0.10 | 0.07 |
| 2x growing (t = 75) | 18 184 | 1 220 | 33.1 | 35.5 | 19.7 |
| 1x growing (t = 45) | 1 187 | 156 | 2.17 | 2.35 | 1.38 |

Live frames at 1x speed, same runs (JS ms per frame mean / `sim step` phase per frame / fps): 2x finished 172 / 118 / 5.4 → 58 / 1.3 / 16.5 (P1), 62 / 1.4 / 15.4 (P2); 2x growing from t = 75: 137 / 94 / 7.1 → 138 / 96 / 7.0 (P1), 115 / 70 / 8.4 (P2); 1x growing from t = 45: 15.7 / 4.3 → 16.0 / 4.4 (P1), 14.5 / 2.8 (P2). The finished-tree step that is left is the light tick (34 ms at 2 Hz on 2x, P5) and the loops over chains and buds; `updateStructure(0)` alone is 0.67 ms on the finished 2x tree (52.7 on main).

Node, unthrottled, ms per step over the window (`structeq.mjs`, one core; the 2x P1 column ran next to a smoke run): 1x t 30 to 90 1.25 → 0.84 (P1) → 0.43 (P2), at rest 1.56 → 0.05; 2x t 30 to 90 4.1 to 4.4 → 5.2 (P1, noisy) → 3.1 (P2), t 90 to 150 13.6 → 6.8 → 2.3, at rest 14.5 → 1.1 → 0.5.

What the numbers say:

- **P1 removes the cost of the tree at rest and nothing else.** While the tree grows, the trunk thickens every step, its sag changes with it, and every node below moves (by nanometres to tenths of a millimetre): bit-equal output means recomputing nearly all of it. At t = 45 on the 1x tree 1 210 of 1 267 nodes are in the bottom-up set and all 1 267 in the forward set (**M**, `structStats`). The "about 2000 moving nodes per year" estimate in section 4 does not hold for an exact pass; it would need a rest threshold (T1 as first written: freeze below 0.1 mm), which gives up bit-equality and was not built.
- **P2 misses its target** (x 0.59 instead of /4 on the growing 2x step). Of the 33 ms about 24 are structure (**M**: `updateStructure(0)` 24.4 on main) and about 9 are growth itself (attractor queries, bud break; **E** by difference). P2 takes the forward half to a sixth; the bottom-up half (pipe sums, two `pow` per node, radii) still runs every step because the growth rules read radii every step (juvenile bud break, shedding) and positions feed the light grid: deferring it changes decisions, and a changed decision is a different tree, not a 0.1 mm difference. Reaching /4 needs the bottom-up pass at 10 Hz with the radius-reading rules moved to the tick (a new random draw for every preset) and a cheaper growth step.
- Stepping under P2 (**M**, node, largest move of a non-elongating node from one step to the next): seedling t 0 to 10 s 0.30 mm at a forward pass against 0.06 mm per step without P2, sapling t 10 to 20 s 2.5 mm against 0.5 mm. From t = 20 on both builds show single-step moves of centimetres to decimetres (0.6 m at 1x, 2 m at 2x) when a shaded-out chain drops out of a limb's load: those exist on main and are far larger than the tick. Contact sheets of the first 10 s of the seedling tip, phone and desktop path (`shots/p2-tip-{phone,desktop}-sheet.png`, pairs with `-iv0-` = forward pass every step): the stem lengthens evenly frame to frame on both, no step seen. The sheets sample every 0.25 s, so they cannot show a 10 Hz jitter by themselves; the 0.3 mm figure is the evidence for the seedling, and nothing was looked at in motion beyond t = 10 s.

### 6.2 P11 and P12 as built (branch `bigtree-years`, behind `?years=3`)

Off by default: `TreeSim.years` = 0 is the tree of one season, bit-identical to main (the new code multiplies by exactly 1 or is not reached; `scripts/yearscensus.mjs` with `YEARS=0` and the year-1 rows below are the same numbers as main). `?years=3` (`main.ts`) sets `sim.years = 3`, raises `growth.maxNodes` to at least 40 000 on both paths (unless `maxNodes` is in the query) and calls `reset()`.

Growth clock: `age = sim.time / season.yearLength + YEAR_DATE0` (0.12 = the default season date), growth year `yi = floor(age)` (0 = first), phase `frac(age)`. It is sim time only, so the growth year turns at the season's bud break for a default page (t = 264, 564, 864 at 300 s per year) and a season scrub does not move it: scrubbing the date changes leaves, colours and blossom as before, never the wood (wood cannot be ungrown; that is the one place where scrub is not wait, and it is by construction, not by drift). Seasons off (G5) runs the same clock.

Rules (all pure functions of sim time; `src/sim/envelope.ts`, `TreeSim.step` / `springFlush` in `src/sim/tree.ts`):

| Rule | Built as |
|---|---|
| G1 envelope by year | `envelopeDimsYear(p, yi, years)`: crown height x (1, 1.46, 1.85), radius x (1, 1.49, 1.9) over the same crown base (`YEAR_H` 1.85 makes the tree x1.6 tall, `YEAR_R` 1.9 wide; 54 % of the gain in year 2 as in section 5). `completeSegment` uses it for the crown zone and the leader stop |
| T9 shell attractors | At bud break of years 2 and 3 (`YEAR_WAVES[0]` = phase 0.02) `sampleShell` draws points between last year's and this year's envelope at `YEAR_DENSITY` 0.25 x the year-1 density (own rng stream per year, the sim rng is not consumed), sorted inside-out by envelope distance, and gives each an opening time spread evenly over `SHELL_OPEN` 0.28 of the year: the crown grows outward through the season instead of in a burst. `PointGrid` now inserts only alive points and `add(i)` inserts a point when it opens (the grid drops dead points for good on the first query, which is why pending points have to be inserted late) |
| New wood on the old scaffold | At phases 0.02, 0.12, 0.22 (`YEAR_WAVES`) every unpruned, non-juvenile chain whose tip is finished and sees an open point within 1.5 x perception is revived (alive, starve 0, one new segment toward the points), and its last `YEAR_BUDS` 2 nodes get a fresh lateral bud |
| G2 extension | x `smoothstep(0, 0.02, ph) * (1 - smoothstep(0.33, 0.4, ph))` on elongation, and bud break skipped while it is 0; year 1 is exempt until t = 150 (`YEAR_EXEMPT`; at t = 150 the phase is 0.62, so the gate is already 0 and the exemption ends without a step) |
| G2 thickening | `thickMul` = 1 - smoothstep(0.5, 0.6, ph) scales the `dt` of the radius approach; winter thickens nothing |
| G2 girth by age | `sim.girth` = 1 + 0.13 x growing years done (ramped through each season by smoothstep(0.02, 0.5), quantised to 1/40 of a year) multiplies the pipe model's twig radius inside `updateStructure` only. The pipe model alone gives a trunk set by the live tips (+70 % by year 3, 20 % under the table); this is the "rings" term. Each quantised step is a value change of a structure input, i.e. one full pass (the existing `sParams` path), so the incremental pass stays exact |
| G3 vigor | Leader (order 0) elongation x (1, 0.6, 0.35) by growth year (`LEADER_VIGOR`); laterals unchanged |

Growth (**M**, `node scripts/yearscensus.mjs` = headless node build of the sim, default oak, seed 7, 30 Hz; width = 2 x the 95th percentile of the leafy nodes' distance from the trunk axis, trunk = radius at 1.3 m; target = section 5 scaled to x1.6: height x1.6, width x1.9, trunk x2.16 at the end of year 3, 54 % of the gain in year 2; year-end rows compare at the end of the growing season, since G2 makes growth a staircase and the linear rows of section 5 cannot hold under it):

| t (s) | Growth year, phase | Height m (target) | Crown width m (target) | Trunk r at 1.3 m cm (target) | Nodes | Sim leaves | Live attractors |
|---|---|---|---|---|---|---|---|
| 150 | 1, 0.62 (autumn) | 9.09 (9.09) | 7.36 (7.36) | 16.8 (16.8) | 4 910 | 37.6k | 1 |
| 300 | 2, 0.12 (spring, growing) | 10.69 (10.04, +6 %) | 8.23 (8.50, -3 %) | 17.2 (20.0, -14 %) | 6 994 | 50.7k | 148 |
| 450 | 2, 0.62 (season over) | 11.92 (12.07, -1 %) | 11.25 (10.94, +3 %) | 24.0 (26.7, -10 %) | 16 291 | 126k | 12 |
| 600 | 3, 0.12 (spring, growing) | 13.26 (12.86, +3 %) | 11.56 (11.9, -3 %) | 25.6 (29.8, -14 %) | 18 538 | 139k | 561 |
| 750 | 3, 0.62 (season over) | 15.05 (14.54, +4 %) | 13.95 (13.98, 0 %) | 32.4 (36.3, -11 %) | 33 153 | 258k | 45 |
| 900 | 4, 0.12 (mature: no new shell) | 15.05 | 13.95 | 32.4 | 33 328 | 259k | 32 |

Targets at the spring rows assume the season's gain spread evenly over phase 0.02 to 0.33 (32 % done at 0.12). Height and width are inside 10 % everywhere; the trunk is 10 to 14 % thin (the one constant to change is `YEAR_GIRTH`: 0.2 instead of 0.13 should land year 3 at about 36 cm; not run). Year 1 is today's tree exactly (same node count, height, width and radius as `YEARS=0` and main). No starvation: every spring revives tips and the shell is used up by midsummer (live attractors 12 and 45 at season end); a growing season adds about 9 000 (year 2) and 15 000 (year 3) nodes, so the node count is 6.8x today's at x1.6, in line with section 2. The app (phone path, `scripts/bigtree.mjs`, its own width metric = bounding box) reaches 9.07 / 11.5 / 14.4 m and 32 025 nodes at t = 750.

Winter adds 0 nodes in every year (phase 0.62 to 0.98 counted step by step). `sim.structureCheck()` = 0 differing values at every sample time of the table (CHECK=1), through spring flushes and girth steps.

Cost (**M**, `scripts/bigtree.mjs`, phone emulation at 4x CPU throttle, ANGLE Vulkan; both runs in the same session while a smoke run and a breakage calibration loaded the host, so absolute numbers are worse than section 2.3; compare the columns, not across sections):

| Phone, 4x throttle | Today's finished tree (t = 120, 7000 cap) | `?years=3` end of year 3 (t = 750) |
|---|---|---|
| Nodes / sim leaves / drawn leaves (rank scale) | 5 685 / 43.3k / 29.9k (1.0) | 32 025 / 248k / 28.1k (0.22) |
| `sim.step` (tree at rest) | 0.07 ms | 0.75 ms |
| `updateLight` (2 Hz) | 9.3 ms | 106 ms |
| Branch rebuild per frame (`geometry rebuild`, live 1x) | 15.8 ms | 51.4 ms |
| Sway per frame | 3.9 ms | 29.2 ms |
| Leaf pass slices (`leaves rebuild`) / follow per frame | 6.9 / 7.9 ms | 4.7 / 9.6 ms |
| Live 1x: JS mean / p95, fps | 72 / 138 ms, 10.4 fps | 141 / 344 ms, 6.1 fps |
| Paused: JS mean, fps | 33 ms, 14.7 fps | 55 ms, 13.0 fps |
| JS heap, programs | 73 MB, 8 | 132 MB, 8 |

Growing frames in year 3 were not timed live (the probe fast-forwards); unthrottled node steps during the year-3 flush average 4 to 21 ms (`yearscensus.mjs` msStep; every girth step and the trunk's thickening move every node, the P1 limit of section 6.1).

Verdict: **not shippable on the phone at x1.6 yet.** The finished year-3 tree costs about twice today's frame on the same host; the walls are exactly the ones section 3 predicts: branch rebuild (P3), sway (P4) and the light tick (P5, a 106 ms hitch twice a second). The picture fails before the frame rate: 28k of 248k sim leaves are drawn (rank scale 0.22), so the phone crown is visibly thin and see-through (`shots/bigtree-yr-phone-sheet.jpg`); that needs P6 (leaf bookkeeping) and P7 / P8 (cluster cards). Order before shipping `years` on phones: P3, P4, P5, then P6 to P8. Desktop High could take `?years=3` sooner (not timed here).

Breakage on the year-3 tree (**M**, `FF=750 Q='&years=3&season.date=0.3&season.hold=true' node scripts/breakcalib.mjs URL`; `breakcalib.mjs` now takes `FF` and `Q`): u at gust 1.0 p50 0.11, p95 0.84, p98 1.37 (t = 90 oak: 1.08), max 3.09 over 835 limbs; 120 s at `wind.base` 1.0 → 1 twig + 22 limbs, 0.8 → 0 + 20, 0.6 and 0.35 → 0. Far over the 1 to 3 limbs at 0.8 of P13: the long new limbs of years 2 and 3 are thin for their load (the trunk-girth term thickens the pipe floor, not the long laterals). `SIGMA_REF` was **not** recalibrated: one constant for both trees would weaken the default tree, and `years` is off by default; P13 (shedding + calibration at size) owns it.

What the pictures say (`shots/bigtree-yr-{desktop,phone}-t{150,450}-{framed,close,wide}.png`, `shots/bigtree-yr-desktop-t750-*`, `shots/bigtree-yr-phone-y3-*`, sheets `shots/bigtree-yr-desktop-sheet.jpg` and `shots/bigtree-yr-phone-sheet.jpg`; summer held at 0.3, noon, calm): the automatic camera frames the crown, so the framed tree is the same size in every year; growth reads only through the meadow and the scenery trees (the tree stands taller against the hills) and close up (more and thicker wood). Year 2 reads as a fuller, rounder oak. Year 3 on desktop is a dense dome whose lowest limbs reach down to the meadow and hide the trunk: a big bush, not an older oak. Cause: the envelope keeps its crown base while the radius grows x1.9, so the widest shell is at the old base height, and nothing sheds the low limbs (G4). Next step: raise the crown base with the year (and G4), before any other tuning. On the phone path the year-3 crown is see-through (leaf cap, above).

Open: trunk 10 to 14 % thin (`YEAR_GIRTH`); the low-crown look above; breakage at size (P13); phone cost (P3 to P8); a season scrub never changes the wood (by design, see the growth clock); the director and camera were not tuned for 15 m; only the default oak was run (presets, `crown.bole` = 0 trees and seasons off untested with `years`); never run on the device.

### 6.3 P3 as built (branch `bigtree-years`)

`BranchMesh.update` keeps one fixed vertex range and one index range per chain (`cV`/`cVc`, `cI`/`cIc`, sized for the chain's rings x 1.5, at least 3 rings of slack). A node is dirty when any input the rings read (`wx wy wz radius wdx wdy wdz`) differs by value from the copy of the last write (Float64 per node, exact compare); a chain is rewritten when one of its nodes is dirty, its ring count, radial count or end node ids changed. Only rewritten chains go to the GPU: their ranges sorted and merged when closer than 2048 vertices (`GAP`), one `bufferSubData` per run; index ranges only when a chain's ring count changed. A chain that outgrows its range or changes its radial count moves to the end (old index range zeroed = degenerate triangles); the layout is rebuilt dense when appends would pass the buffers or the vertex end passes 2 x the live vertices + 4096, on a `flare` change, and when chains or nodes shrank (reset). Unused index slots are (0, 0, 0) and draw nothing; slack vertices are never indexed. Positions left in the wind pose by `applyOffsets` are reset from the rest copy when an update follows without offsets. Same attributes, material and usage: phone programs 8 = 8 (probe census on the year-3 tree). `stats` = chains drawn / rewritten, vertices written, layout rebuilt, upload runs; `rebuildCheck(sim, flare)` (debug) rewrites every chain in place and counts differing values per buffer; `triangleSoup()` returns the drawn triangles in chain order.

Exactness (**M**): `PROF_DIST=dir node scripts/p3check.mjs` grows the tree step by step at 60 Hz with an incremental update after every step and wind offsets applied every 5th: default oak t = 0 to 60 (17 layout rebuilds, 59 282 triangles) and the year-3 tree t = 560 to 620 (spring growth, 24 097 nodes, 197 604 triangles): position, normal, uv, index and rest buffers bit-equal to a full in-place rewrite (0 differing values each), and the drawn triangle soup bit-equal to a fresh `BranchMesh` built from the same sim. Default tree vs the build before P3 (`scripts/p3main.mjs`, order-independent hash of every drawn triangle's positions, normals and uvs read from the live geometry, every 10 s to t = 60): same triangle count and the same hash at every sample, i.e. the same triangles are drawn; only their order in the buffer differs once a chain has moved.

Cost (**M**, `scripts/bigtree.mjs`, phone emulation 4x CPU throttle, ANGLE Vulkan; before and after in the same session on a host shared with other bigbuild jobs):

| Phone, 4x throttle | Year 3 (t = 750) before | after P3 | Default tree before | after P3 |
|---|---|---|---|---|
| `geometry rebuild` per frame, live 1x | 31.7 ms | 15.2 ms | 10.3 ms | 5.2 ms |
| Sway per frame, live / paused | 15.3 / 10.4 ms | 13.7 / 10.2 ms | 3.8 / 2.9 ms | 3.4 / 4.3 ms |
| Live 1x JS mean, fps | 79.7 ms, 11.6 | 54.1 ms, 15.3 | 39.4 ms, 14.3 | 32.6 ms, 14.7 |
| Paused JS mean, fps | 29.3 ms, 25.5 | 24.0 ms, 19.1 | 19.8 ms, 23.0 | 21.4 ms, 22.6 |

(The year-3 "before" column re-measured here is lower than 6.2's 51 ms; 6.2 ran under heavier load. Paused fps is GPU / pacing bound and noisy in both builds.)

Target missed: 15 ms, not under 3. On the finished tree nothing is rewritten while the wind is calm, but with sway live every frame still runs `applyOffsets` over every vertex of the mesh (now including slack, about 1.5x the live count) inside the same phase, plus the per-node change scan. While the tree grows, the trunk thickens every step and moves nearly every node (P1 / P2 note), so the growing tree rewrites 80 to 100 % of its chains per update (`p3check`: oak 95.8 of 95.8, year 3 482 of 605). The next lever is P4: offsets per chain range only for chains whose offset changed (two rates, frustum skip), which also removes the full-mesh position upload.

P4 (T5) is not built. Open: P4; uploads per frame are still the whole position buffer while sway is live; slack costs about 50 % more vertex memory on the GPU; never run on the device.

### 6.4 P4 and P5 as built (branch `bigtree-years`)

**P4, two-rate sway** (`src/render/sway.ts`). Wood over `THICK_R` 3 cm on a thick parent is evaluated every update. Thinner wood is drawn as the current offset of its nearest thick ancestor (anchor) plus an offset relative to that anchor, interpolated between the last two keys. The next key is computed in `RATE` 3 slices by node id, one slice per update, so no update pays the whole thin cascade. The slice bounds are fixed by the node count at the start of the cycle, and the last slice takes every node added since. Junctions cannot tear, because the relative offset is 0 at the anchor. Thin wood lags its limb's own bend by one key (3 updates).

A node whose anchor changes (thickening past 3 cm, a break, growth) has its keys re-expressed from the offsets drawn in the last update. A new node copies its parent's keys. With zero wind or `amount` 0 the function still returns early with `D` all 0. `?swayrate=1` evaluates every node every update; `__arbor.swayStats().rate` reports the split. The frustum skip is not built.

Two-rate is off by default (`Sway.twoRate = false`, branch `sway-fix`): its thin wood lags the anchor by 3 to 6 updates, which at the thin-wood oscillation rate (up to 7 rad/s) and the Low update rate is 1.4 to 2.8 rad of phase; the one-curve check fails with lean lost 0.33 to 0.71 rad in a storm (reference <= 0.004). The "all 8 cases pass" reading below was vacuous: thin wood never wrote `TH`, so the probe skipped it.

**P5, light tick** (`TreeSim.updateLight`):
- **T10:** the cell is max(4 x `segmentLength`, tree height / 28). That is the old 0.88 m for every tree up to about 24.6 m, so the default oak, the year-3 tree (15 m) and oak2x (18 m) keep exactly the old grid.
- **Per-cell light:** node light was 6 `exp` per node; it is now evaluated once per occupied cell with the same expression, so the values are bit-equal.
- **T7** (shell-first leaf pass) is not built.

Exactness (**M**):
- `REF=f8375f3 node scripts/structeq.mjs oak,oak2x,willow,break`: bit-equal at t = 30 / 90 / 150 in every case. That covers positions, radii, pruned flags and leaf count; pruning reads the light.
- The light grid itself is unchanged for every tree under 24.6 m, so the canopy shadow, meadow shade and leaf bake on the default tree get the same input by construction. No pictures were compared.
- `swaycheck.mjs` in phone mode (sapling t = 20 and oak t = 90, storm and windy, growing and paused): all 8 cases pass the one-curve bend check. Lean lost with the rotation kept: 0 rad. Smallest tip / parent offset: 0.80 to 1.0.
- Smoke: the rest check (zero wind = rest pose) and the program gates pass (see the smoke count in the ticket).
- The limb-break smoke FAIL "programs 8/9/9" is the bark re-key timing. Main f7af65c and this branch both read 8 8 8 8 9 9 9 at 1 s steps after `fastForward(60)`, and the break adds 0 programs. The smoke now waits for a stable count.

Cost (**M**). Phone emulation, 4x CPU throttle, ANGLE Vulkan, before = 513d67a, after = 93ada02.

Year-3 storm burst (`/tmp` probe: the `?years=3` tree at t = 750, 34k nodes, 12 348 cells of 0.88 m, paused, held storm, 60 frames). The three pages ran in parallel on a shared host, so the absolute numbers are noisy:

| | before | after (two rates) | after, `?swayrate=1` |
|---|---|---|---|
| `updateLight`, mean of 10 calls | 89 ms | 45 ms | 58 ms |
| `sway.update` per frame | 15.0 ms | 14.8 ms | 18.9 ms |
| Nodes evaluated per update | all live | 9.2k of 16k live | 16k |
| Largest frame-to-frame second difference of `D` (p50 / max, m) | 0.93 / 1.75 | 0.56 / 0.95 | 1.06 / 1.71 |
| Phone programs | 8 | 8 | 8 |

The second-difference row is a stepping check: the interpolated thin wood moves more smoothly than the per-update reference, and nothing steps where the two rates meet.

`scripts/bigtree.mjs` before → after (the year-3 pair and the default pair each ran as two pages in parallel):

| | Year 3 before | Year 3 after | Default before | Default after |
|---|---|---|---|---|
| `ops.updateLight` (2 calls, cold JIT) | 52 ms | 50.8 ms | 28.1 ms | 4.6 ms |
| Sway phase per frame, live / paused | 19.6 / 11.4 | 22.8 / 13.4 | 2.6 / 3.2 | 2.8 / 3.1 |
| `geometry rebuild` live | 23.1 | 22.6 | 4.7 | 4.5 |
| Live JS mean / p95, fps | 83.9 / 192, 10.8 | 84.0 / 195, 11.0 | 32.0 / 76, 17.4 | 32.7 / 79, 16.0 |
| Paused JS mean, fps | 31.5, 23.1 | 36.0, 22.3 | 19.7, 22.3 | 18.3, 21.7 |

`bigtree.mjs` times `updateLight` over 2 calls on a cold JIT, so read the burst row for the light tick.

Targets missed:
- **Light tick:** about halved at year 3, but still about 45 ms at 2 Hz, not under 25.
- **Sway:** the sway phase per frame did not drop measurably at year 3 or on the default tree. Two causes:
  - The phase is dominated by `BranchMesh.applyOffsets` and its upload over every vertex (slack included), not by `sway.update`.
  - On the 15 m tree, 55 % of the live nodes are over 3 cm, so only 45 % run at the lower rate.
- **Paused frame:** not under 16 ms JS.

Next levers, in order:
1. `applyOffsets` over each chain's used vertices only (skip slack and pruned ranges), then the frustum skip per chain range.
2. `THICK_R` raised with tree size, for example 3 cm x height / 9 m.
3. The light tick sliced over several sim steps for `years` trees only: slicing changes the timing of pruning, so it cannot be bit-equal.

Estimate (**E**) for year 3 on the phone path at 4x after this: still about 11 fps live and 22 fps paused. P4 and P5 as built do not change the frame rate the user sees there.

### 6.5 P7 and P8 as built (branch `bigtree-crown`)

**One record set, two meshes.** Cluster cards are records of the leaf pass like single leaves: same placement record (`LEAF_D` 11 floats), same node, same dates. A negative base size marks a cluster card. The pass writes single leaves from the bottom of its back buffers and cluster cards from the top. At the swap the cluster block moves right behind the singles, so the drawn set is singles in `[0, nS)` and clusters in `[nS, nAll)`. `mesh.count` = `nS`. `follow`, `sway`, `takeInstances` and the seasonal scale run over `nAll` in the leaf mesh's own buffers, exactly as before. `syncClusters` then copies the tail into the cluster mesh: matrices after every write, colours at the swap.
- **Cluster mesh:** `Leaves.clusterMesh` is an `InstancedMesh` that is a child of the leaf mesh. It shares the live leaf geometry. Its material is `leafMaterial.clone()` with only `map` changed: on the safe path the map goes through `cleanLeafTexture(.., true)`; on the full path `onBeforeCompile` and the cache key are shared. It casts and receives shadows like the leaf mesh. Because it is a child, hiding the leaf mesh hides it too.
- **Cluster map:** `makeClusterTexture(form)` in `textures.ts` paints 7 leaves of the form's own leaf canvas on a twig. The back layer is darker (brightness 0.55 to 0.8) and the front layer is lit. The form's proportions are painted in and the card is square: a cluster record skips the form stretch in `place`. All ten forms work. A form change repaints the live cluster map in place (mip levels on the safe path), like `setForm`.
- **Distance blend:** a clump becomes a cluster with probability `smooth(CL_NEAR 0.35 H, CL_FAR 0.9 H, distance from the camera)`, where H is the tree height. The decision uses a per-node hash, so a clump switches as a whole. A cluster clump draws one card per K leaves; shell copies count. The card is `CL_SIZE` 2.4 x sqrt(K / 6) times the leaf size, so the area covered per sim leaf stays about the same.
- **Budget split:** clusters are active only while the single-leaf candidates exceed `maxInstances` (phone 32k; hysteresis 0.9 / 1.1), so a tree under the cap is unchanged. When they are active:
  - K = cluster leaves / (0.95 cap - single candidates), clamped to 1.5..10.
  - The singles get their own rank scale, up to 85 % of the cap. Clusters are not thinned by rank.
  - When K moves by more than 20 %, the next pass starts at once (`clusterSwitch`), so the split settles within 2 to 3 passes.
- **Switches:** `?clusters=1` turns clusters on. They are on by default with `?years=3`; `?clusters=0` turns them off. Desktop High has no cap (`maxInstances` 0), so clusters never activate there and High is unchanged by choice: it already draws 125k single leaves at year 3.
- **Default tree (years off):** no cluster mesh is created, so it is unchanged. With `?clusters=1` the default tree at t = 120 is just over the cap (rank scale 0.78) and would get clusters on its far side. I did not look at that case, so it stays off.

What clusters do with each leaf behaviour:

| Behaviour | Clusters |
|---|---|
| Lighting bake | Exact: the same bake as a single leaf, with the card's normal. The shade inside the spray is painted into the map. |
| Seasons | Autumn colour, bud break and fall date per record, as for leaves. A cluster turns and drops as one unit: it carries the dates of its seed leaf, so a far clump goes bare in a few steps instead of leaf by leaf. A cluster that crosses its fall date is not handed to the falling-leaf system (`D[k + 7] > 0` guard), because a big card with a single-leaf map would fall as one giant leaf. It just leaves the crown. Spring flush scales the whole spray. |
| Emergence | Same record clock. New growth near the camera is single leaves anyway. |
| Falling leaves | `sampleInstance` samples singles only. |
| Breakage | `takeInstances` hands cluster cards over too. The debris draws them with the leaf material: approximate, a broken far limb carries a few oversized single leaves. |
| Sway | Same translation path. |

Measured (**M**). Phone emulation, 4x CPU throttle, ANGLE Vulkan, `?years=3` t = 750, summer held, noon, framed by the app's automatic camera:

| | Before (1931dd3) | Clusters, K fixed 6 | Clusters, budget split (a939b69) | Default 9 m tree t = 120 |
|---|---|---|---|---|
| Single leaves / cluster cards drawn | 28 054 / 0 (rank 0.22) | 0 / 8 308 | 0 / 27 952 | 29 867 / 0 |
| Crown coverage (`scripts/coverage.py`) | 0.709 | 0.876 | 0.817 | 0.619 |
| Phone programs | 8 | 8 | 8 | 8 |

How coverage is measured: `bigtree.mjs` with `MASK=1` takes the framed shot twice, with and without the leaf meshes. Leaf pixels are the pixels that differ, after a 5 px median filter. Coverage is the share of the per-row silhouette span. The median filter closes gaps under about 5 device px, so the number is resolution-dependent: the default tree fills more of the frame and its gaps are larger in pixels. The K = 6 run scores higher than the budget split because its 8k cards are larger. It was rejected on the picture: big flat cards, and three quarters of the budget unused.

Cost: see the ticket and the final report. The runs in this session shared a host at load 8 to 11, and the before and after runs were not all taken at the same time. The pass slice (`leaves rebuild`) stayed at 1.5 to 2 ms per frame, max 4 to 9 ms. The cluster copy is 16 floats per card per follow or sway frame.

Pictures:
- `shots/crown-before-{phone,desktop}-sheet.jpg`: before, framed + close.
- `shots/crown-ab3-phone-sheet.jpg`: before, K 6, budget split framed, then before / after close.
- `shots/crown-ab2-phone-sheet.jpg`: also autumn (`crown-v2-phone-autumn-*`).
- `shots/cdolly-phone-sheet.jpg`: dolly from inside the crown to 2.4 H, after the merge with the new oak form.
- `shots/cprog-form-*.png`: all ten forms with clusters.

Probes:
- `scripts/clusterdolly.mjs URL prefix`: dolly burst with single and cluster counts.
- `scripts/clusterprog.mjs URL prefix`: program gate at noon, night and storm, with and without clusters, plus the form shots.

Open:
- At framing distance every clump is a cluster, and the shell is a field of identical sprays, mirrored and scaled. Seen closely on the phone it reads a little like wallpaper, with pale lit sprays on the outer shell.
- The dolly took 4 shots about 3 s apart. That shows that singles and clusters switch over by distance, not whether a single frame pops: the split re-settles at every pass, the passes are 25 % camera-distance steps, and the count swings (singles 0 → 8.8k → 0 while the camera moved outward). No frame-diff popping measurement was run.
- No cluster cross-fade: a clump swaps from leaves to one card at a pass swap.
- Cluster maps of the stroke forms (spray, spiral) were not looked at closely.
- Desktop High has no clusters.
- Never run on the PowerVR device.
### 6.6 Year-3 form and breakage at size (branch `bigtree-years`, behind `?years=3`)

Architecture census (`node scripts/archcensus.mjs 'growth.maxNodes=40000'`, headless, seed 7, t = 750 = end of the year-3 season; width = 2 x p95 of leafy-node distance from the axis; limbs = order-1 chains, girth = radius at the chain's first node):

| Year 3, t = 750 | Before (1931dd3) | After |
|---|---|---|
| Height / crown width / width : height | 13.95 / 14.14 m / 1.01 | 14.56 / 17.95 m / 1.23 |
| Trunk radius at 1.3 m (design 36 cm at x1.6) | 32.0 cm | 40.6 cm |
| Trunk taper 2 / 3 / 6 / 10 m | 30.5 / 20.8 / 9.6 / 1.4 cm | 40.6 / 20.2 / 9.9 / 2.6 cm |
| Order-1 limbs: count, over 10 cm, over 5 cm, thickest | 30, 2, 12, 13.2 cm | 32, 3, 10, 24.5 cm |
| Leafy radius by height band (ground .. top, m) | 8.9 7.8 7.7 8.4 8.2 8.5 8.1 7.5 6.5 5.4 | 6.2 8.6 10.1 10.8 10.7 10.9 10.8 10.1 8.9 6.2 |
| Lowest leaf | -2.52 m (low limbs on the ground) | 0.04 m |
| Nodes / sim leaves | 32 948 / 255k | 35 501 / 276k (+8 %) |

Rules (all only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 are untouched: t = 150 gives 4910 nodes, 9.09 m, 16.8 cm with both):

| Rule | Built as |
|---|---|
| Envelope per year | `YEAR_H` 1.7 crown height, `YEAR_R` 2.3 radius, `YEAR_B` 1.6 crown base (the crown lifts as the low limbs go): broader than tall |
| Lobed shells | `sampleShell` modulates reach x (1 +- `YEAR_LOBE` 0.22) and density (bays down to 1 - `YEAR_BAY` 0.6) by `yearLobe(seed, azimuth, h)` (3 + 5 lobes, phases per seed); `YEAR_DENSITY` 0.25 -> 0.17 holds the node count |
| Old wood thickens more | pipe exponent x (1 - `YEAR_EXP` 0.03 x `ageQ`), `ageQ` = the quantised years done that already drives `girth`: same full-pass steps, exact (`structureCheck` 0 at every sample, also in the app at t = 750 summer and winter) |
| G3 | `LEADER_VIGOR` 1 / 0.45 / 0.2 |
| G4 lower-limb shedding | `shedLowLimb` once per growth year at phase 0.3: of the order-1 limbs starting below this year's lifted crown base, minus the `YEAR_KEEP` 4 thickest (scaffold), the one whose wood hangs lowest goes through `breakAt` with `shed: true` (stub, debris path, birds flush only on non-shed) |
| P13 breakage at size | `loadRatios` strength x (1 + `YEAR_SIGMA` 0.65 x `ageQ`) (exactly 1 in year 1); `sim.yearSigma` for sweeps |

Breakage (**M**, `node scripts/breaksize.mjs` = headless `stormTest`: same `windLoad` loop, 4 Hz, 120 s, fresh tree per base; `YSIG` overrides the gain). Year 3 (t = 750), limbs / twigs at wind.base 1.0 / 0.8 / 0.6: gain 0 (as before) 24 / 24 limbs at 1.0, gain 0.5: 6 / 5 / 0, gain 0.8: 2 / 0 / 0, gain 1.2: 0 / 0 / 0; **gain 0.65 (shipped): 4 / 2 / 0 limbs, 0 twigs, u p98 0.67, max 1.49**. What breaks at size are the long thin new laterals of years 2 and 3 (0.9 to 2.3 cm, 30 to 177 nodes), not scaffold. Year 1 is unchanged by construction (gain x 0); headless t = 90: p98 0.65, 1.0 -> 1 twig, 0.8 -> 1 twig, 0.6 -> 0 (the in-app `breakcalib.mjs` numbers differ: different wind clock start; compare like with like).

What the pictures say (`node scripts/majestic.mjs URL prefix`: wide 2.6 H out, the app's framed camera, under the crown; summer 0.3 / winter 0.85 held, noon, calm, real GPU; `shots/maj-{before,after}-{desktop,phone}-{summer,winter}-{wide,framed,under}.png`): after is wider than tall, sits on a visibly heavier trunk with a cleaner bole, and the low curtain is shorter; but summer is still a dense dome with leafy curtains hanging to the meadow at the sides, and winter shows a broom of many similar wavy limbs, not a few heavy scaffold limbs that lean out and level. The lobes do not read: the dome stays closed. Not majestic yet.

Open (next levers, in order): scaffold dominance (few order-1 limbs carry most of the crown: today 32 limbs of similar size; suppress or shed weak order-1 laterals in years 2-3 and give the 4 to 6 strongest the shell's attractors); limbs that level out (an outward gravitropic set-point for order 1 in years 2-3 instead of attractor pull alone: limbs are 40 to 60 degrees and climb); the crown must open (the leaf density of the year-2/3 shell, and the interior prune, decide whether sky shows; lobes in attractor density do not make gaps when every tip still fills its neighbourhood); wavy wood (the wander term reads as tangle at 15 m); root flare is the renderer's `rootFlare` scaled by trunk radius (proportional; not changed).

### 6.7 Majestic architecture: scaffold dominance, levelling, open interior (branch `bigtree-crown`, behind `?years=3`)

Cause of the year-3 tangle: every spring `springFlush` revived every unpruned order-1 chain and budded its last 2 nodes alike (no dominance), `completeSegment` steered orders 1 and 2 by attractor pull, gravitropism up and the correlated wander only (no outward set-point: limbs climbed at 40 to 60 degrees and their path was about 2x their reach, top limb 18.8 m of wood for 8.5 m of reach), light pruning never touched order 1, and long unbranched order >= 3 shoots grew into whips that sag metres.

Rules (all only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 untouched):

| Rule | Built as |
|---|---|
| Scaffold pick | `pickScaffold` at the year-2 bud break: the `YEAR_SCAF` 6 thickest order-1 limbs, greedily at least `YEAR_SCAF_SEP` 0.75 rad apart in tip azimuth, are scaffold; every other order-1 limb and all wood on it gets `Chain.sup` = 1 (`newChain` inherits it; an order-1 limb born after the pick is `sup`). Flags only, no structure input |
| Suppressed limbs | elongation x `YEAR_SUP` 0.4, bud break x 0.4, no spring revival or flush buds, light pruning at `YEAR_SUP_PRUNE` 1.6 x `selfPrune` (order 1 included), and `shedLowLimb` sheds up to `YEAR_SHED_N` 3 of them per growth year (phases 0.3, 0.325, 0.35; score = lowest wood + 100 x base radius, wood under 0.6 m first) through `breakAt` with `shed: true` |
| Scaffold vigor | scaffold wood (order >= 1, not `sup`) elongates x `YEAR_SCAF_VIGOR` 1.25 and takes the freed shell |
| Levelling | orders 1 and 2 aim at an outward set-point: elevation `YEAR_LEVEL_E0` 0.35 rad near the trunk to `YEAR_LEVEL_E1` 0.02 at the crown radius (order 2: 0.08 lower), weight `YEAR_LEVEL` 1.4 x smoothstep(0.5, 2.5 m from the axis), gravitropism x 0.3 there |
| Calm wood | wander x `YEAR_CALM` 0.35 on every order >= 1 |
| Open interior | order >= 2 light pruning at `YEAR_PRUNE` 1.5 x `selfPrune`; order >= 3 shoots stop after `YEAR_WHIP` 18 segments (a 61-node order-4 whip had sagged to 3.5 m below the ground) |
| Balance | `YEAR_DENSITY` 0.17 -> 0.25 (node count), `YEAR_GIRTH` 0.13 -> 0.2 (trunk: fewer tips carry it now) |

Census (`node scripts/archcensus.mjs 'growth.maxNodes=40000'`, t = 750, seed 7; the script now also names the chain of the lowest leaf):

| Year 3, t = 750 | Before (cd0b486) | After (9361ea8) |
|---|---|---|
| Height / width / w:h | 14.56 / 17.95 m / 1.23 | 14.74 / 17.74 m / 1.20 |
| Trunk r at 1.3 m; at 3 m | 40.6; 20.2 cm | 37.1; 17.7 cm (design 36) |
| Order-1 limbs: count, median girth, thickest | 32, 3.5 cm, 24.5 / 13.5 / 12.1 / 8.9 / 8.8 / 7.7 cm | 5, 13.2 cm, 21.1 / 19.3 / 13.2 / 11.3 / 11.2 cm |
| 6 thickest order-1 vs median order-1 / thickest order 2 | 12.9 cm mean vs 3.5 / 10.5 | all 5 = 15.2 cm mean vs 13.2 / 10.1 |
| Order 2 / 3 count | 92 / 158 | 45 / 114 |
| Leafy radius by band | 6.2 8.6 10.1 10.8 10.7 10.9 10.8 10.1 8.9 6.2 | 0.2 4.4 8.1 9.1 10.2 10.5 10.0 9.6 8.4 6.3 |
| Lowest leaf | 0.04 m | 0.04 m |
| Nodes / sim leaves | 35 501 / 276k | 33 000 (-7 %) / 251k (-9 %) |

The limbs that already exist at the end of year 1 keep their year-1 angles (37 to 59 degrees at the base: wood is not regrown); levelling acts on the new wood of years 2 and 3. Phone cost: nodes and sim leaves -7 / -9 %, drawn leaves are capped (32k) either way, so branch rebuild, sway and the light tick move with the node count (slightly down); not timed.

Pictures (`node scripts/majestic.mjs URL prefix`, real GPU): before = `shots/maj-after-*` of 6.6 (sheet `/home/trusch/projects/arbor/shots/maj-phone-sheet.jpg`), after = `shots/majD-after-{desktop,phone}-{summer,winter}-{wide,framed,under}.png`; intermediate `majB-*` (scaffold only) and `majC-*` (harder prune, before the whip cap: curling bare whips). `structureCheck` 0 in every shot.

## 7. Not measured

- Clean absolute frame times and fps (parallel-load caveat); desktop High fps at any size; anything on the real PowerVR phone.
- Trees past t = 165 s; 3x and 4x were still growing when the wall budget ended, so their node and leaf counts are lower bounds.
- Autumn, winter, blossom, storm, breakage, falling leaves, birds and butterflies at size (all runs: midsummer, calm, 13:00).
- Canopy decal texel size and shade-field cut-off at low sun (derived from the constants, not from a shot).
- Willow, cypress and the alien presets at any scale.
- GPU memory (only JS heap and three's object counts); real-phone tab memory limit.
- The expected gains in section 4 (all **E** until P1 to P5 are built and re-measured).
- P1 / P2: the cost columns in 6.1 were not taken on an idle host; desktop High cost; 2.75x and larger; the real phone. P2's picture in motion after t = 10 s (crown filling) and at growth speeds other than 1x; whether the camera, canopy decal or leaf follow show the 10 Hz forward pass on a large growing crown.

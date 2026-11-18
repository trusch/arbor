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
| P13 breakage at size | `loadRatios` strength x max(0.25, 1 + `YEAR_SIGMA` x `ageQ`) (exactly 1 in year 1); `YEAR_SIGMA` 0.65 on the 6.6 tree, -0.25 on the 6.7 tree; `sim.yearSigma` for sweeps |

Breakage (**M**, `node scripts/breaksize.mjs` = headless `stormTest`: same `windLoad` loop, 4 Hz, 120 s, fresh tree per base; `YSIG` overrides the gain). Year 3 (t = 750), limbs / twigs at wind.base 1.0 / 0.8 / 0.6: gain 0 (as before) 24 / 24 limbs at 1.0, gain 0.5: 6 / 5 / 0, gain 0.8: 2 / 0 / 0, gain 1.2: 0 / 0 / 0; **gain 0.65 (6.6 tree): 4 / 2 / 0 limbs, 0 twigs, u p98 0.67, max 1.49** (recalibrated on the 6.7 tree, see there). What breaks at size are the long thin new laterals of years 2 and 3 (0.9 to 2.3 cm, 30 to 177 nodes), not scaffold. Year 1 is unchanged by construction (gain x 0); headless t = 90: p98 0.65, 1.0 -> 1 twig, 0.8 -> 1 twig, 0.6 -> 0 (the in-app `breakcalib.mjs` numbers differ: different wind clock start; compare like with like).

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

Breakage at size on this tree (**M**, `YSIG=g BASES=1,0.8,0.6,0.35 node scripts/breaksize.mjs`, t = 750, ageQ 2): the scaffold limbs are thicker, so the 6.6 gain is far too strong (0.65: u p98 0.15, 0 limbs at 1.0). u at gust 1.0 and limbs / twigs in 120 s at wind.base 1.0 / 0.8 / 0.6 / 0.35:

| `YEAR_SIGMA` | u p98 / max | 1.0 | 0.8 | 0.6, 0.35 |
|---|---|---|---|---|
| 0.15 to 0.45 | 0.26 to 0.18 / 0.62 to 0.43 | 0 | 0 | 0 |
| 0 | 0.34 / 0.81 | 0 | 0 | 0 |
| -0.1 | 0.43 / 1.01 | 0 | 0 | 0 |
| -0.15 | 0.49 / 1.16 | 0 | 0 | 0 |
| -0.2 | 0.57 / 1.35 | 1 limb + 2 twigs | 0 + 1 twig | 0 |
| **-0.25** | **0.69 / 1.62** | **2 limbs + 2 twigs** | **1 limb + 2 twigs** | **0** |

`YEAR_SIGMA` = -0.25: wood of a year-3 tree counts as 0.5 x year-1 strength per `SIGMA_REF r³` (the r³ normalisation over-rewards the thick scaffold; the limbs that break are 1.0 to 1.5 cm laterals of 25 to 43 nodes). Strength is clamped at 0.25 (from year 5 on with this gain). Year 1 is exactly 1 (ageQ 0).

### 6.8 Settling scaffold, open twig haze, domes and bays (branch `bigtree-crown`, behind `?years=3`)

Cause of the upright dome: the year-1 limbs keep their 37 to 59 degree rest angles (wood is not regrown), the sag of a 10 to 20 cm limb under the pipe-model bend term is near 0, so the silhouette is a vase; every tip on the year-2/3 shell branches at the same rate, so in winter the outer twigs form one fine haze; the shell lobes (6.6) have seeded phases unrelated to where the limbs are, so no dome sits on a limb and no bay is empty.

Rules (only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 untouched: t = 150 gives 4910 nodes, 9.09 m, 16.8 cm):

| Rule | Built as |
|---|---|
| Settling (lever 1) | in the structure pass, scaffold wood (order 1 and 2, not `sup`, not `juv`) adds a rest-pose bend per node `YEAR_SETTLE` 0.08 x `ageQ` x len x h x load x reach (order 2 x 0.5): h = horizontal share of the rest direction, load = subLen / (subLen + 15 m), reach = smoothstep(0.6, 4.5 m, rest distance from the axis). It goes into `sag` like the gravity bend (inherited, fading over `SAG_RIGHT`), so the wood the limb carries follows it. Inputs are rest data, `subLen`, chain order / `sup` and the quantised `ageQ` (each step is a full pass); `pickScaffold` sets `sFull` because `sup` is now a structure input. Same expression in `structureFull`, `structureForward` and `structureTips`: `structureCheck` 0 |
| Open twig haze (lever 2) | bud break on order >= 2 wood (new shoots of order >= 3) x `YEAR_TWIG` 0.4 |
| Domes and bays (lever 3) | `sampleShell(.., az)` with the scaffold tip azimuths (`scafAz`, stored by `pickScaffold`): lobe = max over limbs of a gaussian `SCAF_SIGMA` 0.38 rad (twist 0.25 rad over the height), reach x (1 +- `SCAF_LOBE` 0.3), bays thinned to 1 - `SCAF_BAY` 0.85; the attractor count is unchanged (redistributed) |

Census (`node scripts/archcensus.mjs 'growth.maxNodes=40000'`, t = 750, seed 7; eB / eM / eT = world (sagged) chord elevation of the first, middle and last fifth of each order-1 limb, new in the script):

| Year 3, t = 750 | Before (2680543) | After |
|---|---|---|
| Height / width / w:h | 14.74 / 17.74 m / 1.20 | 13.86 / 20.30 m / 1.46 |
| Trunk r at 1.3 m | 37.1 cm | 40.4 cm |
| Order-1 limbs: girth | 21.1 / 19.3 / 13.2 / 11.3 / 11.2 cm | 22.5 / 20.1 / 15.0 / 13.8 / 7.6 cm |
| Limb elevation eB / eM / eT (deg), thickest first | 48/39/10, 54/24/13, 36/50/-18, 52/69/33, 36/-12/9 | 54/0/-22, 47/25/1, 33/82/4, 52/65/-2, 35/-7/-27 |
| Limb tip height / reach (m) | 9.4/8.2, 9.4/7.7, 11.2/8.1, 10.7/6.7, 7.8/8.4 | 5.0/9.4, 6.9/9.2, 11.7/6.1, 8.8/8.2, 5.5/9.3 |
| Order 3 / 4 / 5 / 6 count | 114 / 174 / 176 / 91 | 184 / 231 / 163 / 68 (fewer finest twigs, but more order 3-4 chains: the denser domes start more shoots) |
| Leafy radius by band | 0.2 4.4 8.1 9.1 10.2 10.5 10.0 9.6 8.4 6.3 | 7.0 6.9 9.8 11.0 11.2 11.3 11.7 11.0 9.3 7.1 |
| Lowest leaf | 0.04 m | 0.04 m |
| Nodes / sim leaves | 33 000 / 251k | 31 526 (-4.5 %) / 243.5k (-3 %) |

Intermediate measurements (same census): lever 1 alone at `YEAR_SETTLE` 0.16 / 0.11 / 0.08 gave limb tips at -24..-32 / -18..-31 / -10..-15 degrees (0.16 too much droop); lever 2 at `YEAR_TWIG` 0.4 / 0.25: 29.8k / 27.9k nodes (0.25 outside the 10 % band), orders 5 and 6 138 / 69 against 176 / 91; lever 3 with `YEAR_SETTLE` 0.11 hung an order-6 twig 1 m below the ground (lowest leaf -0.97 m; 0.08 keeps 0.04 m). Run-to-run the limbs differ (any rule change moves the rng order), so compare the pattern, not one limb.

Pictures (`MODES=phone node scripts/majestic.mjs URL prefix`, real GPU, built app; `structureCheck` 0 in every shot, programs 8): before `shots/majE-before-phone-{summer,winter}-{wide,framed,under}.png` (2680543), after `shots/majE-after-phone-*` (23245b8, `YEAR_SIGMA` does not enter calm shots). What they say: in winter the two lowest scaffold limbs now leave the trunk at about 50 degrees, level out at mid-span and hang their ends at the crown edge, so the lower crown reads as a spreading oak; the twig haze is thinner at the rim. The upper two thirds are still a ball of wavy, similar limbs (the limbs that start higher, at 4.5 m and above, stay steep: eM 65 to 82 degrees, they carry less load and settle little), and the domes and bays do not read as separate masses in leaf: summer is a broader (w:h 1.46), lower dome, still closed. Not majestic yet.

Breakage at size on this tree (**M**, `BASES=1,0.8,0.6 node scripts/breaksize.mjs 'growth.maxNodes=40000'`, t = 750, 31 526 nodes, 703 limbs evaluated). The change moved it, so `YEAR_SIGMA` is recalibrated to 0:

| `YEAR_SIGMA` | u p50 / p95 / p98 / max | 1.0 | 0.8 | 0.6 |
|---|---|---|---|---|
| -0.25 (6.7) | 0.22 / 0.63 / 0.76 / 2.88 | 3 limbs (1.0, 3.8, 2.0 cm; 33 to 294 nodes) | 3 limbs | 0 |
| **0** | **0.11 / 0.31 / 0.38 / 1.44** | **1 limb (1.0 cm, 33 nodes)** | **1 limb** | not run (p98 0.38: 0 expected) |

Lever-1+2 tree (before the domes, `YEAR_SETTLE` 0.11) at -0.25: p98 0.70, 3 / 2 limbs at 1.0 / 0.8, 0 at 0.6. Gain 0 means year-3 wood is exactly as strong per `SIGMA_REF r³` as year-1 wood (the -0.25 that made it weaker was backwards). Why the big tree carries so little load: u = wind load / (strength x `SIGMA_REF` x r³), and the pipe model makes r^n proportional to the tips carried with n about 2.5 (x (1 - `YEAR_EXP` x ageQ), lower still on old wood), so r³ grows like (load)^(3/n) = load^1.2 or faster: every doubling of what a limb carries more than doubles its section modulus. On the 15 m tree the scaffold sits at u 0.1 to 0.3 and only thin (1 to 4 cm) laterals with long subtrees ever pass 1. At gain 0 a wind of 0.8 still reaches 1 limb in 120 s (a 33-node, 1 cm lateral), but 1.0 breaks no more than 0.8: the curve is flat because there is one weak lateral and then a gap. A real large-limb failure would need a size term (strength falling with r, e.g. r^2.5 instead of r³), not a year gain.

### 6.9 Upper limbs out, smooth scaffold, open bays (branch `bigtree-crown`, behind `?years=3`)

Cause, from the per-limb profiles (`PROF=1 node scripts/archcensus.mjs`, world / rest elevation per 3-node chord base to tip, sag): the steep middles of the upper limbs (eM 65 and 82 degrees) are in the REST direction, not missing sag; these limbs carry 345 to 433 m of wood (load 0.96), so settling was never short of load. The shell above pulled them up and `settle` scales with the horizontal share h, which is near 0 on steep wood. The waves are in the rest direction too (sag is smooth along every limb): most of them sit in the year-1 part of each limb (chords 0 to 13, out of reach of a years-2-3 rule), the rest came from the patchy shell pull and the per-segment turn. Bays: with 5 scaffold azimuths 0.85 to 1.6 rad apart and `SCAF_SIGMA` 0.38, a gaussian lobe never drops below 0.12 between neighbours, so there were no bays to keep empty, and side wood of the neighbouring domes grew into them.

Rules (only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 untouched):

| Rule | Built as |
|---|---|
| Upper limbs out (lever 1) | scaffold wood (order 1-2, not `sup`) never wants a direction steeper than `YEAR_UP_MAX` 0.7 (sine, 44 degrees; order 2: 0.6), applied in `completeSegment` next to `DOWN_MAX`; `settle` uses sqrt(h) instead of h |
| Smooth sweep (lever 2) | scaffold wood: wander x `YEAR_SCAF_CALM` 0, attractor pull x `YEAR_SCAF_ATT` 0.35, straightness x `YEAR_SCAF_STR` 2, maxTurn x `YEAR_SCAF_TURN` 0.5 |
| Open bays (lever 3) | in `updateLight`, side wood (order >= 2 or `sup`) whose tip is beyond `YEAR_BAY_R` 0.45 x the crown reach and at `scafLobe(.., YEAR_BAY_SIGMA 0.25)` < `YEAR_BAY_CUT` 0.15 counts as shaded (pruned after 4 ticks through the normal path, `sChainDirty`); shell domes narrower, `SCAF_SIGMA` 0.3, `SCAF_BAY` 0.95 |

All three are growth / prune rules; the only structure-pass change is sqrt(h) inside `settle` (same expression in all three passes). `structureCheck` 0 at t = 750 after every lever (CHECK=1) and in every shot.

Census (`node scripts/archcensus.mjs 'growth.maxNodes=40000'`, t = 750, seed 7; waves = sign changes of the chord-elevation slope (steps under 3 degrees ignored) on the year-2/3 part of the 5 thickest limbs; bay share = leafy nodes beyond half the leaf reach at sigma-0.25 lobe < 0.15):

| Year 3, t = 750 | Before (34873c5) | Lever 1 | Levers 1+2 | After (a9a5de9) |
|---|---|---|---|---|
| Height / width / w:h | 13.86 / 20.30 / 1.46 | 14.07 / 20.16 / 1.43 | 14.86 / 20.37 / 1.37 | 14.08 / 20.41 / 1.45 |
| Limb eB / eM / eT, thickest first | 54/0/-22, 47/25/1, 33/82/4, 52/65/-2, 35/-7/-27 | 54/10/-12, 47/26/-31, 36/34/-7, 52/34/-11, 35/-17/-2 | 47/29/-10, 54/15/2, 52/64/-11, 33/33/-8, 36/-13/-10 | 54/11/-13, 47/28/-18, 52/63/-8, 34/35/-9, 34/-12/0 |
| Waves on year-2/3 wood (5 limbs) | 3 2 2 2 2 = 11 | | 3 1 0 4 0 = 8 | |
| Bay share of outer leafy nodes | 5.9 % | | | 0.3 % (lobe < 0.3: 14.4 % → 4.6 %) |
| Nodes / sim leaves | 31 526 / 243.5k | 32 728 / 252.3k | 31 292 / 241.6k | 30 308 (-3.9 %) / 232.9k (-4.4 %) |
| Trunk r at 1.3 m | 40.4 cm | 38.2 | 39.5 | 38.1 cm |

The limb from 4.5 m is now 34/35/-9 (was 33/82/4). The one that stays steep (eM 63-65, from 2.7 m) is steep in its year-1 wood (rest 72 to 85 degrees over chords 5 to 10), which this pass may not touch. Run-to-run the limbs swap places (rng order), compare by base height.

Pictures (`GPU=vulkan node scripts/majestic.mjs URL majF-after`, built app, real GPU, phone and desktop; before = `shots/majE-after-*` (34873c5); in the app the tree has 28.0k nodes / 214.7k sim leaves, `structureCheck` 0, programs phone 8 / desktop 33): `shots/majF-after-{phone,desktop}-{summer,winter}-{wide,framed,under}.png`. What they say: in summer the crown is no longer one closed dome: two or three leaf masses with meadow and sky showing through the notches between them (clear on desktop, readable on the phone). In winter the crown is broader and the upper limbs lean out instead of standing up as a vase; the silhouette is a wide umbrella. Still not majestic: the under shot shows thick limbs that loop and kink (year-1 rest waves plus sag), the upper crown is still a fine twig ball in winter, and all limbs leave the trunk below 3 m at similar angles, so the scaffold reads as similar arcs.

Breakage (`BASES=1,0.8,0.6 node scripts/breaksize.mjs 'growth.maxNodes=40000'`, 30 308 nodes, 633 limbs evaluated): at `YEAR_SIGMA` 0, u p98 0.34, max 1.17; 1.0 → 1 limb (2.9 cm, 202 nodes), 0.8 → 0, 0.6 → 0. The change moved it below the target (1 to 3 limbs at 0.8). Within `YEAR_SIGMA` >= 0 it cannot be recalibrated (a positive gain only makes wood stronger): -0.1 gives p98 0.42, 1 / 1 / 0 and -0.2 gives p98 0.57, 1 / 1 / 0. `YEAR_SIGMA` is left at 0; the size term from 6.8 is still the fix.

### 6.10 Trunk and limbs of one tree: flare, reaction wood, twig hierarchy (branch `bigtree-crown`, behind `?years=3`)

Cause of the fat trunk, measured (`node scripts/forkcensus.mjs 'growth.maxNodes=40000'`, t = 750, seed 7: trunk radius by height, every fork of orders 0 to 2 with its area ratio = sum of child cross-sections / parent cross-section): the sim follows the area rule. The trunk is a cylinder of 38.1 cm from the ground to the first fork at 2.12 m, and every trunk fork and main limb fork sits between 0.91 and 1.32 (effective pipe exponent 1.786; a radius that is still ahead of its target after a shed gives the few values over 1.2). `YEAR_GIRTH`, `YEAR_EXP` and shed limbs (35 pruned children on the trunk, summed area of one 12.8 cm limb) are not the cause. The mismatch is drawn: the root flare in `BranchMesh` is `r x (1 + 0.9 x flare x exp(-y / max(0.15, 3 r)))`, so its e-fold height grows with the trunk (0.5 m at year 1, 1.14 m at year 3) and with `rootFlare` 1.4 the drawn trunk is a cone over the whole bole, still 20 % over the sim radius where the 23 cm limbs leave.

| Drawn trunk radius, cm (sim 38.1 / 38.3) | Ground | 0.2 m | 0.5 m | 1.3 m | First fork 2.12 m | Drawn area ratio at the first fork |
|---|---|---|---|---|---|---|
| Before (7f7cc4e) | 86 | 78 | 69 | 53 | 46 | 0.65 |
| After | 62 | 47 | 40 | 38 | 38 | 0.92 |

Rules (all only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 untouched):

| Rule | Built as |
|---|---|
| Old trunk flare | `BranchMesh.update` blends by `fq = min(1, sim.ageQ)` (0 through year 1, 1 from the end of year 2) to an e-fold height of `FLARE_OLD_H` 0.2 m and a ground gain of `FLARE_OLD_AMP` 0.45 x `flare` (was 0.9); buttress lobes follow the same f. `fq` is part of the layout key next to `flare` (a step re-lays the mesh) |
| Reaction wood | `TreeSim.straighten()`: scaffold chains (order 1-2, not `sup`, not juvenile) get a structure-pass direction `sx sy sz` = the grown `dx dy dz` blended by `YEAR_STRAIGHT` 0.85 x min(1, ageQ / 2) toward the chord over +-`YEAR_STRAIGHT_W` 8 nodes of the chain. Sag, world position and world direction are computed from `sx sy sz` (all three passes); growth, buds and the rest pose still read `dx dy dz` / `rx ry rz`, so year-1 growth is unchanged and the waves it grew with flatten as the limb ages |
| Twig hierarchy | buds on wood of order >= `YEAR_TWIG_HI_O` 3 break at x `YEAR_TWIG_HI` 0.2 (order 2 keeps `YEAR_TWIG` 0.4): fewer, longer outer twigs on visible branches |

Structure pass: `sx sy sz` are stored per node (= `dx dy dz` at `addNode`) and rewritten only inside `straighten`, which runs when `ageQ` steps; that step already forces a full pass (the pipe exponent is a `sParams` value), and between steps the stored values are plain inputs. `structureCheck` 0 at t = 150 and t = 750 (CHECK=1) and in every shot.

Fork table (t = 750; forks whose second child is at least 3 cm):

| | Before (7f7cc4e) | After |
|---|---|---|
| Trunk r at 0.2 / 0.5 / 1.3 / 2.0 m (sim) | 38.1 / 38.1 / 38.1 / 38.1 | 38.3 / 38.3 / 38.3 / 38.3 |
| Trunk fork 2.12 m: below → above + limb (ratio) | 38.1 → 28.4 + 23.4 (0.93) | 38.3 → 27.7 + 24.2 (0.92) |
| 2.33 m | 28.4 → 16.5 + 22.2 (0.95) | 27.7 → 18.5 + 19.6 (0.95) |
| 2.71 m | 16.5 → 12.9 + 10.0 (0.98) | 18.5 → 14.1 + 10.8 (0.93) |
| 4.48 m | 12.9 → 8.6 + 9.6 (1.00) | 14.1 → 9.1 + 10.2 (0.93) |
| 5.58 m | 8.6 → 4.9 + 8.1 (1.21) | 9.1 → 4.9 + 9.0 (1.27) |
| Order-1 forks: count, min / median / max | 30, 0.92 / 0.98 / 1.13 | 40, 0.93 / 0.99 / 1.13 |
| Order-2 forks: count, min / median / max | 19, 0.91 / 1.01 / 1.32 | 13, 0.92 / 0.99 / 1.09 |
| Nodes / sim leaves | 30 308 / 232.9k | 27 230 (-10.2 %) / 210.7k (-9.5 %) |
| Height / width | 14.08 / 20.41 | 13.94 / 20.93 |

Flare and reaction wood alone: 29 935 nodes (-1.2 %), 229.6k leaves, height 14.98; the twig rule costs the other 9 %. The one ratio over 1.25 (5.58 m, the top trunk fork) is a limb whose radius is ahead of the trunk's target after wood above it was shed (radii never shrink); its target ratio is 0.99.

Year 1 and `years` = 0: `T=150 YEARS=0` and `T=150 YEARS=3` both give 4 910 nodes, 37 642 leaves, height 9.09 m, trunk 16.8 cm at 1.3 m, `structureCheck` 0, the numbers of 6.2. In year 1 `ageQ` is 0, so `fq` is 0 (the flare expression takes the old branch), `straighten` returns before writing and `sx sy sz` are copies of `dx dy dz`.

Default tree drawn: `scripts/p3main.mjs` (drawn-triangle hash of the default oak at t = 10 to 60, real GPU) prints the same six hashes for the build of 7f7cc4e and this build (t = 60: 59 282 triangles, f0c7d638).

Pictures (`GPU=vulkan node scripts/majestic.mjs URL majG-after`, built app, real GPU; before = `shots/majF-after-*`; in the app the tree has 25.7k nodes / 198.6k sim leaves (before 28.0k / 214.7k), `structureCheck` 0, programs phone 8 / desktop 33): `shots/majG-after-{phone,desktop}-{summer,winter}-{wide,framed,under}.png`, sheets `shots/majG-{desktop,phone}-sheet.jpg`. What they say: the trunk is a column that runs into the limbs without a step; the bottle is gone, and trunk and limbs read as one tree. At the wide distance the bole now looks short and slight under a 21 m crown (38 cm on a 14 m tree is what the sim grows; the old flare hid that). The scaffold limbs are smooth arcs from the fork to the crown edge, without the S-bends of 6.9; under the crown they still read as long hoops of even curvature that arch down to head height, not as heavy horizontal limbs with elbows. Winter: the outer crown is thinner and single branches can be followed to the edge, so it is less of a ball; a clear limb / branch / twig step is still missing, because every outer branch carries about the same few tips and so has about the same radius (1 to 1.5 cm medians for orders 3 to 6).

Breakage (`BASES=1,0.8,0.6 node scripts/breaksize.mjs 'growth.maxNodes=40000'`, 27 230 nodes, 640 limbs evaluated; limbs in 120 s at `wind.base` 1.0 / 0.8 / 0.6):

| `YEAR_SIGMA` | u p50 / p98 / max | 1.0 | 0.8 | 0.6 |
|---|---|---|---|---|
| 0 (6.9) | 0.12 / 0.42 / 0.91 | 0 | 0 | 0 |
| -0.15 | 0.16 / 0.60 / 1.31 | 1 (1.0 cm) | 0 | 0 |
| -0.3 (set) | 0.29 / 1.06 / 2.29 | 7 + 2 twigs (largest 4.3 cm, 872 nodes) | 3 + 1 twig | 0 |

The straighter limbs and thinner twig load moved it further down (0 limbs at every base). `YEAR_SIGMA` is now -0.3: u p98 1.06 is the t = 90 oak's 1.08, 0.8 is inside the 1 to 3 target and 0.6 stays at 0. It makes year-3 wood 0.4 x as strong per stress, which is not physical; it stands in for the size term of 6.8 and is one constant to turn back.

Still not majestic: (1) the bole is short and thin for the crown: all five scaffold limbs leave between 2.1 and 5.6 m and the trunk above 2.7 m is under 15 cm, so there is no trunk inside the crown; an older tree needs a year-4-plus girth or a taller bole. (2) Limbs are even arcs: no elbows, no near-horizontal heavy stretches, and their ends hang to head height. (3) Outer branches have one radius; a hierarchy needs apical dominance inside each limb's subtree (one leader per branch that keeps its tips while its laterals are thinned), which is a growth rule in `updateLight` / bud break of years 2-3 and a census of tips per order-3 branch to tune it. (4) The crown interior is empty in summer: leaves sit in a shell at the limb ends.

### 6.11 Tree at rest: geometry version, light tick, sway over live nodes (branch `bigtree-perf`)

Profile first (**M**, `scripts/bigtree.mjs`, phone emulation 411 x 777 at DPR 2.625, 4x CPU throttle, ANGLE Vulkan, calm wind 0.35, `?years=3` at t = 750 = autumn of year 3, 12 s live then 6 s paused; shared host lock, three to eight other jobs running, so compare columns of one run pair and read single numbers as +-35 %). Base 7f7cc4e, ms per frame:

| Phase | Year 3 live | Year 3 paused | Default tree live | Default paused |
|---|---|---|---|---|
| sway (`Sway.update` + `applyOffsets` + upload) | 20.5 | 16.4 | 3.7 | 4.0 |
| geometry rebuild | 19.2 | 0 | 4.05 | 0 |
| render | 11.0 | 9.35 | 6.4 | 6.55 |
| light grid (59 ms per tick, 2 Hz) | 9.6 | 0 | 0.46 | 0 |
| leaves follow | 5.8 | 6.1 | 2.0 | 3.3 |
| leaves sway | 3.4 | 3.0 | 1.8 | 2.8 |
| meadow | 3.3 | 1.3 | 1.7 | 0.4 |
| canopy shadow (bake up to 153 ms) | 2.6 | 0 | 0.86 | 0 |
| leaf pass | 2.35 | 2.8 | 2.5 | 1.0 |
| sim step | 2.05 | 0.2 | 0.7 | 0 |
| JS mean / p95, fps | 82.7 / 184, 10.8 | 42.9 / 104, 18.1 | 27.5 / 71, 23.9 | 21.4 / 71, 28.4 |

What the profile showed: at t = 750 no wood moves (elongation is off outside year phase 0.02 to 0.4, thickening from 0.6), yet `redraw` keyed the branch mesh on `sim.time`, so `BranchMesh.update` compared all 32k nodes every second frame to rewrite nothing, and the light tick rebuilt an identical grid twice a second and bumped `lightVersion`, which re-baked the canopy decal and restarted leaf bakes. On a paused tree `Leaves.follow` swept 26k instances every update to place none.

Built:
- **`TreeSim.geomVersion`**: bumps when a node's position, direction, sag or radius may have changed or a chain was pruned (`updateStructure`: full pass, pending forward work or tips; `structureForward` with work; `sChainDirty`). `redraw` and the sway rest cache compare it instead of `sim.time`.
- **Light tick at rest** (`updateLight`, sim state bit-equal): grid, `nd.light` and `lightVersion` are kept while `geomVersion`, `topology`, node count and cell are unchanged; the chain loop is skipped too when the prune threshold and year state are unchanged and no chain has a running shade count. `ops.updateLight` on the year-3 tree at rest: 24.7 ms → 0.05 ms in the same run pair.
- **Sway over live nodes**: the cascade loops over a cached list of live ids (pruned and detached wood is zeroed once per cache refill); `D` is bit-equal to before. `applyOffsets` writes only the used rings of drawn chains.
- **Follow on a paused tree**: skipped once a whole sweep placed nothing under unchanged inputs.

Exactness (**M**): `REF=7f7cc4e node scripts/structeq.mjs oak,oak2x,willow,break` bit-equal at t = 30 / 90 / 150; new case `y3` (`TIMES=264,500,650,780`, `?years=3`): bit-equal at all four times, including the at-rest window after 750 (positions, radii, sag, subtree lengths, pruned flags, leaf count).

After, against `bigtree-crown` bf8c8ec (merged; its year-3 tree is 28.7k nodes), run pair in one job on the loaded host, ms per frame:

| | Year 3 live, before → after | Year 3 paused | Default live | Default paused |
|---|---|---|---|---|
| geometry rebuild | 11.6 → 0 | 0 | 3.7 → 0 | 0 |
| light grid | 4.3 → 0 | 0 | 0.37 → 0 | 0 |
| canopy shadow | 1.3 → 0 | 0 | 0.62 → 0 | 0 |
| leaves follow | 3.7 → 4.1 | 3.6 → 0.7 | 1.9 → 1.6 | 1.7 → 0.7 |
| sway | 11.4 → 12.8 | 11.6 → 15.7 | 3.0 → 1.7 | 3.9 → 2.6 |
| render | 8.4 → 21.4 (one 585 ms frame) | 7.7 → 10.9 | 6.6 → 3.8 | 4.8 → 5.0 |
| JS mean / median | 52.7 / 50.0 → 58.4 / 35.7 | 33.1 / 27.3 → 41.2 / 32.8 | 24.7 / 22.4 → 12.6 / 12.8 | 14.9 / 15.1 → 13.1 / 11.6 |

Reading: the phases removed are gone in every run (also in a first pair on 7f7cc4e: year 3 live JS mean 82.7 → 59.0 while the default-tree control of the same job ran 1.4x slower). The default tree at rest halves its live frame. The year-3 "after" column of this pair is not a clean number: the live window had a 585 ms render frame and interval p95 350 ms, and its paused sway and render read 35 to 40 % above the "before" run although the sway does strictly less work; that is host load (a headless sim job ran beside it), unless the rerun (`prof/bigtree-perf-rerun-*`) shows otherwise. The live JS median (50.0 → 35.7 ms) is the better reading.

Against the bar (default tree: 27.5 ms live, 21.4 paused on the first baseline): **not met.** Year 3 at rest is about 36 to 59 ms live and 33 to 41 paused. What is left is the sway (11 to 16 ms per frame, live and paused), render (8 to 11), follow while time runs (4), leaf sway (3), leaf pass (3).

Not done:
- **Sway cost itself.** The per-update cost is unchanged apart from skipping pruned ids. The next step is one whole-tree key pose computed for a fixed lead time in id slices (all slices at the same wind time, so the key is one consistent curve), every node drawn as the interpolation between the last two keys: no anchor split, so no phase offset between thin wood and its limb, which is what failed the one-curve check in 6.4. Not built, not measured.
- **`applyOffsets` upload** is still the whole position range; a wind-pose rebuild still restores and uploads every position (`swayed && keepRest`).
- **Growing in year 3** (year phase 0.02 to 0.6): every node moves every step, so the geometry and light costs of the first table apply unchanged; the light tick is still one 25 to 59 ms frame twice a second there. Not profiled separately.
- **Twig culling (T4 / P9)**, leaf follow and pass budgets: untouched.
- Exclusive timing runs: the exclusive host lock did not come free in the session.

### 6.12 Tall dome on a raised crown: envelope, ascending leaders, crown raising, shade shoots (branch `bigtree-crown`, behind `?years=3`)

Cause of the low hollow umbrella, measured on 41f267c (`node scripts/archcensus.mjs 'growth.maxNodes=40000'`, t = 750, seed 7; the script prints a `SHAPE` line: height, width = 2 x p95 leaf distance from the axis, p95 leaf radius in 12 height bands of the crown and the height of the widest band, inner leaf share = leaves at ellipsoidal distance < 0.5 from the crown centre (a uniformly filled crown has 12.5 %), clear bole = lowest base of an order-1 limb over 3 cm, lowest scaffold tip, lowest wood):

1. The year envelope is an umbrella by construction: `YEAR_R` 2.3 x 3.6 m = 8.3 m radius, x 1.3 in the lobes = 10.8 m, against a top at 14.9 m: height : width 0.69 before any growth rule acts (measured 0.67).
2. Nothing ascends: every scaffold limb is capped at 44 degrees (`YEAR_UP_MAX`) and steered to a level set-point that ends at 1 degree at the rim, then settled. All 5 limbs reach 8.4 to 9.8 m out and end at 5.6 to 10.3 m with end elevations of -15 to +2 degrees: even hoops.
3. No leader: `LEADER_VIGOR` 0.45 / 0.2 stops the trunk (14 cm at 3 m, 4.9 cm at 6 m, 2.4 cm at 8 m).
4. The bole height is the year-1 scaffold: the three thickest limbs (24, 20, 11 cm) leave at 2.1, 2.3 and 2.7 m and `pickScaffold` keeps them.
5. The interior is empty because nothing calls growth there: the year shells lie outside last year's envelope only. The light rule is not the cause: `YEAR_PRUNE` 1.5 / 1.0 / 0.7 gives an inner share of 9.2 / 9.6 / 9.7 %.
6. Gravity sag is not the cause: the bend term of a 10 to 24 cm limb is near 0 (6.8); the hoop shape is rule 2.

Rules (only when `years` > 0 and from growth year 2 on; year 1 and `years` = 0 untouched):

| Rule | Built as |
|---|---|
| Tall envelope | `YEAR_H` 2.2 (was 1.7), `YEAR_R` 1.95 (was 2.3); the ellipsoid profile is widest at mid-height |
| Leaders | `LEADER_VIGOR` 1 / 0.8 / 0.6; at `pickScaffold` the `YEAR_ASC` 2 scaffold limbs with the highest bases get `Chain.asc` (inherited by the wood they carry, `newChain`): no levelling set-point (an upward term `YEAR_ASC_UP` 0.5, order 2 x 0.4), wanted direction up to `YEAR_ASC_MAX` 0.94 (sine, 70 degrees), no `settle` (`asc` is a structure input like `sup`: set once before `sFull`, constant afterwards) |
| Limb ends lift | spreading scaffold wood: the set-point elevation falls from `YEAR_LEVEL_E0` to `YEAR_LEVEL_E1` over the inner `YEAR_LIFT_F` 0.6 of the reach and rises by `YEAR_LIFT` 0.4 rad over the rest |
| Crown raising | `pickScaffold` picks among the order-1 limbs that leave the trunk at `YEAR_BOLE` 3 m or higher (when at least `YEAR_BOLE_MIN` 4 exist); the limbs below are `sup` and `shedLowLimb` takes them first, thickest first; `YEAR_SHED_N` 4 per growth year (was 3). The trunk keeps its radius (radii never shrink) and the upper limbs take over the pipe |
| Shade shoots | `sampleShell` keeps a share `YEAR_INNER` 0.5 of the samples that fall inside last year's envelope, above `YEAR_INNER_H` 0.3 of last year's crown height (without that floor twigs hung to 0.01 m); the attractor count is unchanged (redistributed inward) |
| Interior prune | `YEAR_PRUNE` 1 (was 1.5): no effect on the inner share, but more wood survives and the bole is stouter (37.8 to 43.1 cm) |

Census (t = 750; `CHECK=1`: `structureCheck` 0 on both seeds):

| | Before (41f267c), seed 7 | After, seed 7 | Before, seed 11 | After, seed 11 |
|---|---|---|---|---|
| Height / width (h : w) | 13.94 / 20.93 m (0.67) | 17.61 / 18.08 m (0.97) | 14.45 / 20.92 (0.69) | 18.35 / 18.03 (1.02) |
| Widest band: height (share of crown height) | 7.4 m (0.38) | 9.7 m (0.46) | 7.5 m (0.38) | 8.5 m (0.38) |
| Clear bole; trunk r at 1.3 m / 3 m / 4 m | 2.12 m; 38.3 / 14.1 / 14.1 cm | 3.19 m; 43.1 / 43.1 / 23.0 cm | 2.14 m; 35.4 | 3.02 m; 42.0 / 42.0 / 33.0 cm |
| Inner leaf share (ellipsoidal 0.5); horizontal inner half | 7.8 %; 27.7 % | 12.8 %; 35.9 % | 14.5 %; 37.8 % | 16.1 %; 40.8 % |
| Lowest scaffold tip; lowest wood | 3.84 m; 1.69 m | 6.28 m; 1.06 m (an order-6 twig of 20 nodes) | 3.71; 1.36 | 5.35; 1.18 |
| Nodes / sim leaves | 27 230 / 210.7k | 28 543 (+4.8 %) / 222.3k (+5.5 %) | 23 969 / 184.0k | 25 718 / 200.6k |

Step by step, seed 7: envelope + leaders + lift: 17.6 / 19.0 m (0.93), bole 2.12 m, inner 7.8 %, 25 287 nodes; + crown raising: 17.7 / 18.9, bole 3.19 m, trunk 37.8 cm up to 3 m, inner 9.2 %, 24 915 nodes; + shade shoots and `YEAR_PRUNE` 1: the "After" column. Scaffold after crown raising (seed 7, before the last step): limbs of 17.6 / 17.3 / 15.7 / 13.4 / 11.9 cm leaving at 3.2 to 4.5 m; the ascending one ends at 16.4 m (end elevation 66 degrees), the spreading ones at 8 to 10 m with ends at 0 to +24 degrees. The trunk above the last scaffold fork is still thin (4.9 cm at 6 m): the dome is carried by the ascending limbs, not by a central stem.

Forks (`node scripts/forkcensus.mjs 'growth.maxNodes=40000'`): trunk 5 forks 0.92 to 1.15 (median 0.94), order 1: 35 forks 0.92 to 1.14 (0.96), order 2: 23 forks 0.92 to 1.13 (0.93); all inside 0.85 to 1.25. Trunk forks from 3.19 m: 43.1 → 36.4 + 20.8, 36.4 → 31.6 + 15.6, 31.6 → 23.0 + 19.9, 23.0 → 16.3 + 15.1.

Year 1 and `years` = 0: `T=150 YEARS=0` and `T=150 YEARS=3` (`CHECK=1`) both give 4 910 nodes, 37 642 leaves, 9.09 m, 16.8 cm at 1.3 m, `structureCheck` 0 (the numbers of 6.2). Default tree drawn: `PROF_DIST=dist scripts/p3main.mjs` prints the six hashes of 6.10 (t = 60: 59 282 triangles, f0c7d638).

Breakage (`YSIG=g BASES=1,0.8 node scripts/breaksize.mjs 'growth.maxNodes=40000'`, 28 543 nodes, 784 limbs evaluated; limbs in 120 s):

| `YEAR_SIGMA` | u p50 / p98 / max | 1.0 | 0.8 |
|---|---|---|---|
| -0.3 (6.10) | 0.37 / 1.10 / 2.31 | 8 limbs + 1 twig (largest 5.9 cm, 538 nodes) | 6 + 1 twig |
| **-0.2 (set)** | **0.24 / 0.73 / 1.54** | **1 limb (1.0 cm, 29 nodes) + 1 twig** | **1 limb (1.0 cm, 30 nodes)** |
| -0.1 | 0.18 / 0.55 / 1.16 | 0 | 0 |

`YEAR_SIGMA` is -0.2 (year-3 wood 0.6 x as strong per stress). The curve is steep between -0.2 and -0.3 (1 → 8 limbs); 0.6 was not rerun (p98 0.73: 0 expected). Still a stand-in for the size term of 6.8.

Pictures (`GPU=vulkan node scripts/majestic.mjs http://localhost:5860/ majH-after`, built app, real GPU; before = `shots/majG-after-*`; in the app 26.9k nodes / 209.1k sim leaves, 18.15 m, `structureCheck` 0, programs desktop 33): `shots/majH-after-{desktop,phone}-{summer,winter}-{wide,framed,under}.png`, sheets `shots/majH-{desktop,phone}-sheet.jpg` (rows: before summer, after summer, before winter, after winter). What they say: the umbrella is gone. In the wide and framed shots the tree is a tall rounded crown about as high as wide on a visibly clear bole, widest near mid-height; in winter the trunk runs up to 3 m and divides into a few limbs, some spreading with lifted ends, some ascending into the top, and the crown has branches through its volume instead of one outer shell. Not majestic yet; a viewer would first name: (1) the wood is thin for the size: a 43 cm bole and 12 to 21 cm limbs under an 18 m crown read as a young tree enlarged, not an old one (three growth years of pipe-model girth; a field oak of this crown has a bole 2 to 3 times as thick); (2) in summer a vertical cleft divides the crown into two lobes (the bay rule of 6.9 with only 5 scaffold azimuths cuts from rim to top; bays should stop below the dome); (3) limbs are still long smooth arcs without elbows or level heavy stretches; (4) the outer twigs are wiry and of one radius, and single twigs hang to 1 m.

### 6.13 One dome, heavier wood (branch `bigtree-crown`, behind `?years=3`)

Cause of the cleft (`MAP=1 node scripts/cleft.mjs 'growth.maxNodes=40000'`, t = 750, seed 7 on e2652e6: p95 reach and count of leafy nodes per 15 degree sector seen from above, whole crown and upper half; side outline from 8 directions): the 6.9 bay rule. Between the five scaffold azimuths (-108, -32, 48, 97, 179 degrees) four sectors (-150, -75, 0, 135 degrees) reach 3.6 to 4.4 m where the domes reach 8.5 to 10 m, with 63 to 117 leafy nodes against 800 to 1 140: bays 5.5 m (0.6 crown radii) deep. The upper half of the crown shows the same numbers, so every bay runs to the top. Two parts of the rule do it: `SCAF_BAY` 0.95 leaves 5 % of the shell attractors in a bay at every height and `SCAF_LOBE` 0.3 pulls the envelope in by 30 % there; `YEAR_BAY_R` 0.45 prunes side wood in a bay over the outer 55 % of the reach. The gap between the two ascending leaders and the shed limbs are not the cause (the bays sit between scaffold azimuths, the leaders are at 48 and 97 degrees with a filled sector between them). The side outline (p97 leaf height per column) does not show the cleft (notch 0.12 R): from the side the far domes fill the column; the eye sees the bay as a dark slot of sky and shade, so the top-down map is the instrument.

Rules (years 2-3 only; year 1 and `years` = 0 untouched):

| Rule | Built as |
|---|---|
| Shallow bays | `SCAF_BAY` 0.45 (was 0.95), `SCAF_LOBE` 0.1 (was 0.3); reach factor of the scaffold shells = `SCAF_REACH` 1.3 - 2 x `SCAF_LOBE` x (1 - lobe): domes at 1.3, bays at 1.1 |
| No bay to the top | the lobe value rises to 1 between `SCAF_TOP0` 0.4 and `SCAF_TOP1` 0.75 of the crown height (smoothstep) |
| Bay cut at the rim only | `YEAR_BAY_R` 0.85 (was 0.45) |
| Girth | `YEAR_GIRTH` 0.4 (was 0.2: twig radius of the pipe model x 1.8 in year 3, 1.35 cm), `YEAR_EXP` 0.05 (was 0.03: pipe exponent 1.71 in year 3). Both are sim inputs of the structure pass; nothing is drawn fatter than the sim |

Census (t = 750, `CHECK=1`: `structureCheck` 0 on seeds 3, 7, 11):

| | Before (e2652e6), seed 7 | After, seed 7 | After, seed 11 | After, seed 3 |
|---|---|---|---|---|
| Height; p95 leaf radius | 17.61 m; 9.04 m | 18.71 m; 9.01 m | 18.87; 9.10 | 18.48; 8.84 |
| Sector reach min / max (top-down, 24 sectors) | 3.6 / 10.0 m (bay 0.60 R) | 7.5 / 9.9 m (bay 0.14 R below the median 8.8) | not mapped on the final constants (6.6 to 8.6 m with `SCAF_REACH` 1.15) | not mapped |
| Deepest notch of the side outline, 8 directions | 0.12 R | 0.10 R | 0.13 R | 0.10 R |
| Trunk r at 1.3 m / 4 m | 43.1 / 23.0 cm | 70.1 / 46.9 cm | | |
| Scaffold limbs at the base | 12 to 21 cm | 21.4 to 31.9 cm | | |
| Lowest wood | 1.06 m | 3.02 m | 2.86 m | 2.64 m |
| Nodes / sim leaves | 28 543 / 222.3k | 31 777 (+11.3 %) / 248.6k (+11.8 %) | 31 364 / 245.2k | 30 746 / 240.2k |

Counts: the closed bays carry wood now (+8.8 % with `SCAF_REACH` 1.15, +11.3 % at 1.3); this is just over the 10 % budget. Orders (seed 7, girth step with `SCAF_REACH` 1.15): order 1 limbs 22.8 to 31.4 cm, order 2 max 14.9 cm (median 5.3), order 3 max 9.1 (median 2.0), orders 4 to 6 median 1.35 cm (the twig radius). The trunk above the last scaffold fork is unchanged (4.9 cm at 6 m): the dome is carried by the ascending limbs (30 cm at their base).

Forks (`node scripts/forkcensus.mjs 'growth.maxNodes=40000'`): trunk 5 forks 0.89 to 1.04 (median 0.93): 70.1 → 64.6 + 21.4, 64.6 → 57.5 + 23.7, 57.5 → 46.9 + 28.1, 46.9 → 31.9 + 30.6; order 1: 53 forks 0.89 to 1.34 (median 0.94, 52 inside 0.85 to 1.25); order 2: 51 forks 0.84 to 1.26 (median 0.91, 49 inside). The lower exponent moves an even fork from 0.92 to 0.89 (2^(1 - 2/n)); `YEAR_EXP` above 0.06 would leave the band.

Year 1 and `years` = 0: `T=150 YEARS=0` and `T=150 YEARS=3` (`CHECK=1`) both 4 910 nodes, 37 642 leaves, 9.09 m, 16.8 cm, `structureCheck` 0.

Sag: scaffold limb ends (seed 7, girth step) at 8.3 to 11 m with end elevations 0 to +21 degrees (6.12: 8 to 10 m, 0 to +24): no visible rise or drop.

Breakage (`YSIG=g BASES=1,0.8 node scripts/breaksize.mjs 'growth.maxNodes=40000'`, 31 777 nodes, 885 limbs evaluated; limbs in 120 s):

| `YEAR_SIGMA` | u p50 / p98 / max | 1.0 | 0.8 |
|---|---|---|---|
| **-0.2 (kept)** | **0.13 / 0.35 / 1.36** | **1 limb (1.4 cm, 62 nodes)** | **1 limb (1.4 cm, 62 nodes)** |
| -0.1 | 0.10 / 0.27 / 1.02 | 0 | 0 |
| 0 | 0.08 / 0.21 / 0.82 | 0 | 0 |

Thicker wood halves the stress (p98 0.73 → 0.35); one outlier limb still breaks at -0.2, so the target (1 to 3 at 1.0, 0 to 2 at 0.8) holds without a change, but the storm now takes one small limb only; -0.3 and below were not rerun.

Twigs: no twig rule was added. The lowest wood rose from 1.06 m to 2.6 to 3.0 m on the three seeds as a side effect of the bay change (the hanging twigs were side wood of the bays' edges). The outer wood is still of one thickness (orders 4 to 6 all at the twig radius, now 1.35 cm instead of 1.05 cm): a visible step from branch to fine spray needs outer shoots that are shorter and more ramified (`YEAR_TWIG_HI` up with `YEAR_WHIP` down, at constant node count) and a twig radius that does not grow with `YEAR_GIRTH` for wood younger than a year.

Pictures (`GPU=vulkan node scripts/majestic.mjs http://127.0.0.1:5861/ majI-after`, built app, real GPU; before = `shots/majH-after-*`; in the app 31.0k nodes / 241.6k sim leaves, 18.09 m, `structureCheck` 0, programs desktop 33 / phone 8): `shots/majI-after-{desktop,phone}-{summer,winter}-{wide,framed,under}.png`, sheets `shots/majI-{desktop,phone}-sheet.jpg` (rows: before summer, after summer, before winter, after winter). What they say: the heart shape is gone on both layouts; the summer crown is one closed dome with a slightly uneven outline, and the bole reads as a trunk (visibly stout against the crown, limbs thick at the fork). Not majestic yet; a viewer would name: (1) the crown is a near-perfect ball on a stick (the bays are now so shallow that the outline has little character; wider than tall would read older); (2) in winter the crown is a tangle of long, evenly thin, curved whips: limb, branch and spray do not separate, and the thicker twig radius makes it heavier; (3) the trunk forks into its limbs within 1.3 m, with no central stem above. Not run: `scripts/p3main.mjs` (drawn-triangle hash of the default tree; no code on the `years` = 0 path changed), the full smoke, seeds 11 and 3 in the app (headless census only).

### 6.15 Every tree at year 3, camera and overlay for the big tree (branch `bigtree-perf`, behind `?years=3`)

Survey: `node scripts/y3survey.mjs URL` (built app, phone emulation 411 x 777, real GPU) grows every panel preset and the four start-screen kinds that have no preset (at the middle of their roll ranges; willow, cypress and the four worlds roll around the presets of the same name) with `years=3` to t = 750 and takes wide / framed / close shots in summer and the wide shot in winter. Sheets `shots/y3-<key>-sheet.jpg`, all wide summer shots `shots/y3-overview.jpg` (each at its own distance, 3.4 x the larger of height and width: sizes are not comparable between tiles), numbers `shots/y3-survey.json`. Height and width are over unpruned nodes; trunk radius is the trunk node nearest 1.3 m; nodes = all ids (live = on unpruned chains); `structureCheck` is 0 for all twelve in summer and winter. Script ms = rAF callback time per frame with the tree at rest and the clock running, 4x CPU throttle, median (p90) of one 5 s window per tree, taken while three other pages of the same browser were growing on a loaded host: upper bounds, good for "which trees are heavier", not as absolute values.

| Tree | Height m | Width m | Trunk r m | Nodes (live) | Sim leaves | Script ms | Verdict |
|---|---|---|---|---|---|---|---|
| Oak meadow | 18.1 | 20.2 | 0.67 | 31.0k (14.3k) | 242k | 17.5 (32) | good as is |
| Windswept cypress | 23.1 | 6.7 | 0.29 | 7.3k (3.2k) | 55k | 13 (18) | acceptable: the spire holds; the top is loose with two competing leaders and the trunk is thin for the height (height / radius 81, oak 27) |
| Weeping willow | 15.7 | 17.2 | 0.65 | 28.0k (11.7k) | 213k | 15 (32) | broken: thick limbs sag into coils and loops that reach the ground, the curtains are bare ropes with few leaves in summer |
| Low-gravity alien | 51.9 | 18.5 | 0.30 | 11.9k (7.9k) | 95k | 15.5 (22) | broken: 52 m on a 30 cm trunk (height / radius 171), a dense egg; the sparse spiral of year 1 is gone |
| Crimson world | 19.6 | 26.2 | 0.40 | 31.3k (15.8k) | 246k | 35 (90) | acceptable: the umbrella holds; thin, crooked trunk under a 26 m crown |
| Bioluminescent night | 25.1 | 20.6 | 0.73 | 32.1k (18.0k) | 254k | 47 (101) | acceptable: a solid egg dome; the weeping habit is gone |
| Heavy world | 9.35 | 24.8 | 2.38 | 39.1k (17.2k) | 301k | 20 (116) | broken: trunk radius 2.4 m, crown lopsided and lying on the meadow, node count at the 40k cap |
| Journey: Earth to alien | 30.1 | 19.6 | 0.67 | 35.4k (16.2k) | 279k | 43 (91) | acceptable: a 30 m egg with a clean silhouette |
| kind Broad (maple) | 18.1 | 19.8 | 0.71 | 31.2k (16.2k) | 245k | 26 (64) | good as is |
| kind Slender (birch) | 23.2 | 14.7 | 0.62 | 24.5k (12.1k) | 192k | 23 (65) | good (an oval; less slender than in year 1) |
| kind Spreading (linden) | 15.5 | 19.0 | 0.65 | 28.7k (14.0k) | 226k | 21 (35) | good as is |
| kind Young (ginkgo) | 20.4 | 13.9 | 0.52 | 20.9k (8.1k) | 163k | 20 (37) | good: the cone holds |

Causes of the broken ones (read from the pictures and the rules; none was changed or tested):

- Low-gravity alien: the year envelope multiplies the preset's crown height (`YEAR_H` 1.7 on `crown.height` 12 above `crown.base` 3.5) and the tree fills it at `growthRate` 2.6 with `gravity` 0.2, while its `thickness.twigRadius` 0.008 and `branchingProbability` 0.09 give the pipe model few tips to thicken the trunk with. The height factor of the year envelope is the one constant that would have to be per preset here (about 1.2 for a crown that is already 12 m).
- Heavy world: `thickness.exponent` 1.6 with `YEAR_EXP` and `YEAR_GIRTH` on 17k live nodes gives the 2.4 m trunk radius; per-preset girth constants would be needed, and the scaffold settling (`YEAR_SETTLE`) at `gravity` 3 puts the crown on the ground. Two constants, not one.
- Weeping willow: `growth.weeping` >= 1 switches off the sag fade (`SAG_RIGHT`) by design, and years 2 and 3 add girth, scaffold settling and reaction wood on wood that hangs: not one constant; the willow needs its own pass over the year rules.

The oak rules carry the oak-like habits (broad, spreading, slender, young cone) unchanged; presets whose `growth` or `thickness` group is far from the default do not.

Camera. The framed distance (`Stage.frame`) and the director's box are functions of the live bounding box each frame, so they followed the big tree already; `node scripts/y3frame.mjs URL phone|desk` projects the live crown box every 0.5 s while year 2 grows at 8x (t = 285 on). Read on the year-3 oak (`KINDS=... CASES=y3:13 node scripts/dirshots.mjs sheet phone,desk prefix`, before `shots/y3dir-before-{phone,desk}-y3-noon-sheet.jpg`, after `shots/y3dir-after-*`; tiles = the shots in order, then the plain framed view):

| Shot | Year-3 oak before | Change |
|---|---|---|
| wide, orbit, framed | tree whole, backdrop trees beside it | none |
| hero | whole on desktop; on the phone the 20 m crown is cut a little at one side | none |
| rise | desktop: starts 0.6 m up inside the grass cards, which cover the frame | starts at 1.5 m for the big tree |
| canopy | beside the bole looking up the limbs: the one shot that showed the size | weight x 1.6 for the big tree |
| branch | a twig mass 4 m from the lens, no size | none |
| ascend (new) | | elevator from 0.8 m to 0.75 H at max(1.6 R + 2, 0.6 H) from the axis, looking up into the crown from the grass and level at the top; 26 s |
| far (new) | | max(1.25 fit, 3.3 H) out, eye 1.5 m + 0.2 H above the terrain there, trunk base on a third: meadow in front, the lone trees and hedgerows of the backdrop beside the tree |

`ascend` and `far` are drawn only while `sim.years` > 0 and the smoothed height is over `BIG_H` 11 m (`Director.big`); otherwise their weight is 0, and they sit at the end of `SHOT_KINDS`, so the draw of the other six is the same sequence as before. Default tree unchanged, checked with `node scripts/dirpose.mjs URL '' 90` on the build before and after: smoothed box, 18 poses (six shots x three shot times, fixed azimuth) and 300 `choose` draws identical on desktop and phone; the plain framed view has the same distance, height and target (its azimuth is whatever the running shot left). A hand-set view: nothing new writes the camera (`Stage.frame` is unchanged apart from the overlay fix below).

Read after (year-3 oak, noon): wide, hero, orbit, far and the framed view hold the whole tree on both layouts; the camera is never under the ground or inside the trunk. Size is felt in three shots: canopy (unchanged pose), the start of ascend (`shots/y3dir-after-phone-y3-noon-at0.05-sheet.jpg`: the bole from the grass with the limbs fanning out overhead and the backdrop trees small behind it) and far (the backdrop trees are about a quarter of the oak's height in frame). Not good: the middle of ascend is a wall of twigs and leaves at eye level on the phone (18 m from the axis, 8 m from the leaves), rise at 0.62 shows only the crown top against the sky (as designed for the 9 m tree), branch is a twig mass, hero on the phone still cuts the crown at one side.

Growth in frame (`y3frame.mjs`, t = 285 to about 440 at 8x, height 9.3 to 13.5 m, width 8.6 to 15 m): plain framed view largest |NDC| of the live crown box 0.95 on the phone (0.86 at the start, 0.88 at the end), 0.81 on desktop: never out of frame, the distance follows (41.9 to 70 m phone, 26.9 to 43.9 m desktop). The held-shot rows of the same run (wide, orbit, far) are no result: the director left the asked shot for a spring event shot during the run and the probe then measured a close-up. Director shots take `fit` and their box from the same live bounding box (rate 1.2 / s), so they follow by construction; that is not measured.

Overlay read (`y3hud.mjs`, `years=3` oak): t = 141 "6 mo, growing"; 201 and 263 "8 mo / 11 mo, resting for winter"; 401 "1 year 4 months, 14.0 m, growing", girth 2.1 m, crown 15.2 m; 471 and 561 "1 year 6 months / 1 year 10 months, resting for winter"; 641 "2 years 1 month, 18.5 m, growing"; 751 "2 years 6 months, 18.8 m, fully grown", girth 4.4 m (radius 0.70 m), crown 20.1 m. Height, width and girth agree with a scan over unpruned wood within 0.15 m (the girth at the base equals the girth at 1.3 m). Default tree (`years` = 0): "6 mo ... fully grown" as before. Months of the first year are capped at 11 ("12 mo" showed for the last two weeks before "1 year"); that cap was built after this run and is not in its output.

Found on the way: a dip to black that was cut off in its fade-in half (cinema switched off, or a drag) left the `#arbor-cut` overlay part-opaque over the picture (the phone "framed" tile of the before sheet is black). `Director.rest` now drops a dip in either half, and the plain auto-frame branch calls `rest(0)`.

Overlay (`src/hud.ts`): from the first birthday the age reads "1 year 3 months", "2 years" (months of the first year as before); with `sim.years` > 0 the tree is "fully grown" only after the last growing season (growth phase 0.6 of the last year), and between growing seasons (growth phase 0.6 to 0.02, from t = 150) the state is "resting for winter" and the card says "in full leaf" / "leaves turning" without "putting on wood" (`HudState.resting`, set in `updateHud`). Before, the tree line said "fully grown" every time no tip was alive, i.e. each autumn. `node scripts/y3hud.mjs URL` prints the texts at a list of times next to height / width / girth measured over unpruned wood.

### 6.16 Lifetime per tree and per device (branch `bigtree-perf`)

How many years a tree grows is a param of the tree, `growth.years` (`params.ts`; the sim keeps reading `TreeSim.years`, which `applyYears` in `main.ts` feeds). Values of 2 and more grow the tree on (clamped to 3); below 2 is the tree of one season, `TreeSim.years` = 0, the code path of 6.2 "off". "1 year" in the interface is `years` = 0 in the sim: `TreeSim.years` = 1 does not exist as a setting (it would switch the seasonal gates on for a single year), and `?years=1` gives 0 as before.

Defaults (`defaultParams` 3; the three presets 6.15 calls broken carry `years: 1`, and the start-screen kinds built on them inherit it through `flat(preset)`), read from the running app (`node scripts/lifetime.mjs URL table`: every preset loaded through the panel's preset path, every kind rolled on the start screen until all ten were seen; value = `sim.years`, 0 shown as 1; `maxNodes` in brackets):

| Tree | Desktop | Phone path (`lowEndDevice`) | Phone after "3 years" was chosen once | `?years=3` desktop / phone | `?years=0` |
|---|---|---|---|---|---|
| Oak meadow | 3 (40 000) | 1 (7 000) | 3 (14 000) | 3 (40 000) / 3 (14 000) | 1 |
| Windswept cypress | 3 | 1 | 3 | 3 / 3 | 1 |
| Weeping willow | 1 (14 000) | 1 (7 000) | 1 (7 000) | 3 / 3 | 1 |
| Low-gravity alien | 1 | 1 | 1 | 3 / 3 | 1 |
| Crimson world | 3 | 1 | 3 | 3 / 3 | 1 |
| Bioluminescent night | 3 | 1 | 3 | 3 / 3 | 1 |
| Heavy world | 1 | 1 | 1 | 3 / 3 | 1 |
| Journey: Earth to alien | 3 | 1 | 3 | 3 / 3 | 1 |
| kinds Broad, Slender, Spreading, Young, Columnar cypress, Crimson world, Bioluminescent night | 3 | 1 | 3 | 3 / 3 | 1 |
| kinds Weeping willow, Low-gravity alien, Heavy world | 1 | 1 | 1 | 3 / 3 | 1 |

KINDS_PHONE_NOTE

Device rule (`capYears` in `main.ts`, after every preset load and every proposal): `yearsAllowed` = the stored choice of the Lifetime control (`localStorage['arbor.years']`: '3' yes, '1' no), else true on desktop and false on a low-end device. Not allowed = `growth.years` is written to 1 for the tree just loaded. A `years` key in the query is written instead and wins for every tree on every device. With `sim.years` 0 nothing else runs: no reset, `growth.maxNodes` untouched, clusters off, so `?years=0` and the phone default are the app as it was.

Control: Grow tab, "Lifetime" with the buttons "1 year" / "3 years" (`#arbor-lifetime`, `.ap-life[data-years]`) and a sentence under it that says what the current tree does. It writes `growth.years` through `Automation.userSet` like every control and stores the choice for the device. Stored '3' means "trees get their own lifetime from now on" (a willow planted afterwards is still one year, and its control shows "1 year"); '1' means one year for every tree, on desktop too. The start screen's facts line reads "... 9 m tall, 8 m wide after a year · grows for 3 years · ..." when the proposal will grow for three years on this device, and the old line otherwise.

Change on a living tree (`TreeSim.setYears`, no reset, called by `applyYears` before the next sim step):

| Change | What happens |
|---|---|
| 1 to 3 years while the tree is in its first year | `sim.years` = 3 and the node budget is raised; the tree is the same tree until t = 150 (year 1 is identical with either setting) and goes on at the bud break of year 2 (t = 264) |
| 1 to 3 years on a tree that has stopped | The growth clock (`sim.growthAge()`) is set back by whole years (`sim.yearShift`) so that the tree is in its first year again; year 2 starts at the next bud break. Read: desktop oak, one year, at t = 700 (5 685 nodes, 9.07 m): after the click `yearShift` 2, nothing until t = 864, then 6 269 nodes / 10.83 m at 900, 14 726 / 13.84 m at 1 000 (rest from 1 014 to 1 164), 30 374 nodes / 18.44 m at 1 350. The wait is up to one year (300 s at 1x) and nothing on screen says when it ends except the sentence under the control |
| 3 to 1 year in the first year | `sim.years` = 0: the tree of one season |
| 3 to 1 year in year 2 or 3 | `sim.years` = the year it is in: the running season finishes (wood cannot be ungrown) and the tree is then fully grown. Not run in the app |

Phone path with `?years=3` before this change (`node scripts/y3phone.mjs URL`, phone emulation 411 x 777, Android UA, real GPU, default oak, summer held; heap = `usedJSHeapSize` after a forced GC, GPU buffers = byte length of every attribute, index and instance array reachable from the scene, each once (no textures, no render targets); script ms = rAF callback time at rest, clock running, 4x CPU throttle, median (p90) of 5 s, on a host running several other jobs, so upper bounds). The 7 000 cap did not hold: `?years=3` raised `growth.maxNodes` to 40 000 on the phone path too (`Math.max`), so the phone grew the whole tree:

| Case (phone emulation) | t | Nodes (live) | Sim leaves | Height m | Width m | Trunk r m | JS heap MB | GPU buffers MB (tree) | Script ms | Programs |
|---|---|---|---|---|---|---|---|---|---|---|
| one year (cap 7 000) | 750 | 5 685 (4 353) | 43.3k | 9.07 | 8.77 | 0.166 | 56.8 | 14.2 (6.7) | 19.0 (84) | 8 |
| | 1 350 | 5 685 | 43.3k | 9.07 | 8.77 | 0.166 | 57.2 | 14.2 (6.7) | 17.5 (77) | 8 |
| `years=3` as it was (cap 40 000) | 750 | 30 965 (14 328) | 242k | 18.09 | 20.16 | 0.672 | 122.3 | 24.3 (16.8) | 90 (175) | 8 |
| | 1 350 | 31 372 (14 303) | 245k | 18.09 | 20.16 | 0.673 | 120.9 | 24.3 (16.8) | 78 (128) | 8 |
| `years=3`, cap 14 000 | 750 | 14 005 (7 448) | 108k | 14.18 | 14.30 | 0.512 | 81.4 | 19.7 (12.2) | 26.5 (95) | 8 |
| | 1 350 | 14 005 | 108k | 14.18 | 14.30 | 0.512 | 81.7 | 19.7 (12.2) | 22.5 (95) | 8 |
| `years=3`, cap 20 000 | 750 | 20 007 (9 087) | 154k | 17.53 | 14.92 | 0.536 | 96.9 | 23.2 (15.7) | 31 (89) | 8 |
| `years=2` (cap 40 000) | 1 350 | 26 551 (15 397) | 207k | 17.48 | 19.63 | 0.455 | 117.5 | 27.7 (20.2) | 71 (112) | 8 |

Without bound: nothing. Between t = 750 and 1 350 (two more years of clock on a finished tree) the uncapped tree adds 407 nodes (the last revived tips of year 3 finishing; 0 tips alive at 1 350), heap and buffers do not move, geometries 10 to 11 and textures 28 to 29 in every case incl. the one-year tree. Drawn leaves are capped at 32k cards on Low at every size (cluster cards, 6.5), so the leaf buffers do not grow with the tree; what grows is the branch mesh (tree buffers 6.7 to 16.8 MB) and the JS heap (node objects, typed arrays: x2.1). The programs stay at 8: the years tree compiles nothing new, which is the thing that crashed the phone GPU before. The script time of the full tree is 4 to 5 times the one-year tree's in this run (the survey of 6.15 read 17.5 ms on a quieter host: the absolute value is not trustworthy, the ratio at equal load is the reading). `years=2` is no smaller tree: its envelope is the full one and it ends at 26.5k nodes.

Built for the phone: a node budget for the years tree on a low-end device, `YEARS_NODES_LOW` 14 000 (`applyYears`; desktop keeps `YEARS_NODES` 40 000 as a safety net; `?maxNodes=` wins). The budget is what ends growth there: the tree runs into it during the second growing season (year 2 alone would reach about 16k), every tip stops, the trunk keeps thickening to the end of that summer. Result against the desktop tree, same camera (`shots/life-phone-optin-t750.jpg`, `shots/life-desk-default-t750.jpg`; before the change `shots/y3phone-phone-{y1,y3cap14,y3}-t750.jpg`): 14.2 m tall, 14.3 m wide, trunk radius 0.51 m (one year: 9.1 m, 8.8 m, 0.17 m; desktop three years: 18.1 m, 20.2 m, 0.67 m): clearly the bigger, thicker tree, with the crooked heavy limbs of the old tree, a thinner and more open crown than the desktop one and a crown that is not quite symmetric (the shell fills inside-out and the budget cuts it off where it was). Cost against the one-year phone tree: heap +25 MB (x1.4), GPU buffers +5.5 MB, script ms x1.3 to 1.4 at equal load. 4 001 to 6 177 buds stay in the list of a tree stopped by its budget (they cannot break; the list does not grow).

OPTIN_NOTE

Consequence for scripts: `?years=3` in phone emulation is now the 14 000-node tree; a script that wants the full tree there passes `maxNodes=40000` (`y3survey.mjs` does; the 6.15 numbers were taken with the old cap of 40 000).

Gates. Year 1: `TIMES=150 YEARS=0 CHECK=1` and `YEARS=3` of `yearscensus.mjs` both 4 910 nodes, 37 642 leaves, 9.09 m, 16.8 cm, `structureCheck` 0. `REF=c37d616 node scripts/structeq.mjs oak,willow,break`: bit-equal, exit 0 (the sim changes are `yearShift`, which is 0 unless `setYears` moved it, and `ageQ = max(previous, new)`, which is the same value on a clock that only runs forward). GATES_NOTE

Not done: nothing here ran on the real phone. `setYears` back to one year in year 2 or 3 was not run in the app; `yearShift` assumes `season.yearLength` does not change during a tree's life (the growth clock of 6.2 assumes the same). The overlay of a one-year tree switched to three years in mid-summer says "growing" while it waits for the next spring. Breakage is not calibrated at size (6.6), and the three broken habits are only kept away by their default: `?years=3` or the control still grows them.

## 7. Not measured

- Clean absolute frame times and fps (parallel-load caveat); desktop High fps at any size; anything on the real PowerVR phone.
- Trees past t = 165 s; 3x and 4x were still growing when the wall budget ended, so their node and leaf counts are lower bounds.
- Autumn, winter, blossom, storm, breakage, falling leaves, birds and butterflies at size (all runs: midsummer, calm, 13:00).
- Canopy decal texel size and shade-field cut-off at low sun (derived from the constants, not from a shot).
- Willow, cypress and the alien presets at any scale.
- GPU memory (only JS heap and three's object counts); real-phone tab memory limit.
- The expected gains in section 4 (all **E** until P1 to P5 are built and re-measured).
- P1 / P2: the cost columns in 6.1 were not taken on an idle host; desktop High cost; 2.75x and larger; the real phone. P2's picture in motion after t = 10 s (crown filling) and at growth speeds other than 1x; whether the camera, canopy decal or leaf follow show the 10 Hz forward pass on a large growing crown.

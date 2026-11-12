# Arbor audit: frame pacing, visual realism, living surroundings, build plan

Scope: `src/` at the audited commit, read-only. Measurements come from `scripts/profile.mjs` (raw results in `prof/*.json`, gitignored or not, they are reproducible) and screenshots from `scripts/auditshots.mjs` (`shots/audit-*.png`).

## 0. Method and limits

| Item | Value |
|---|---|
| Build | production bundle (`vite build --outDir /tmp/arbor-prof-dist`), served by `vite preview` |
| Browser | `/usr/sbin/chromium` through playwright-core, `--headless=new --use-gl=angle --use-angle=vulkan --enable-gpu --ignore-gpu-blocklist` |
| GPU | real: `ANGLE (Intel, Vulkan 1.4.354 (Intel(R) Arc(tm) Graphics (MTL)))`. `--use-angle=gl` silently falls back to SwiftShader on this host; the NVIDIA GPU is not used |
| Desktop case | 1440x900, DPR 1, quality High, full leaves, 60 s growth at `speed=1.5` (seed to t = 91 s, 5.0k nodes, 35.2k leaf instances), then 20 s paused |
| Phone-like case | 411x777, DPR 2.625, Android UA (app picks Low + safe V0 leaves, cap 32k), CDP CPU throttle 4x, same timeline |
| Instrumentation | init script wraps `window.__tel.phase` (time between phase transitions is attributed to the phase) and `requestAnimationFrame` (interval between rAF timestamps, JS time per frame, JS heap per frame), plus a `longtask` observer |

Limits:

- The phone GPU (PowerVR D-Series) is not reproduced. Phone-like numbers are valid for the JS side only; the GPU side of that run is an Intel Arc.
- Headless rAF does not always skip a vsync when a frame's JS runs long, so "interval > 33 ms" undercounts drops on the unthrottled runs. "JS > 16.7 ms" is the reliable dropped-frame count there.
- The host is shared (load average 8 to 11 during the runs). One desktop run was visibly disturbed and is kept only as `prof/desktop-high-contended.json`.
- Triangle and draw-call counts are per frame, derived from a two-frame sample of `renderer.info` with `autoReset` off.

## 1. Performance

### 1.1 Frame pacing

| Run | Phase | fps | interval median / p95 / p99 / max (ms) | frames > 33 ms | frames > 100 ms | JS median / p95 / max (ms) | frames with JS > 16.7 ms |
|---|---|---|---|---|---|---|---|
| Desktop High, Arc | growth 60 s | 59.9 | 16.7 / 16.8 / 16.8 / 50.1 | 8 | 0 | 2.0 / 26.9 / 47 | 248 of 3453 in the repeat run (every leaf rebuild after t = 30 s) |
| Desktop High, Arc | paused 20 s | 59.9 | 16.7 / 16.7 / 16.8 / 33.3 | 3 | 0 | 2.2 / 27.1 / 36.1 | 77 of 925 in the repeat run (4 per second) |
| Phone-like, CPU 4x | growth 60 s | 33.2 (14.2 in the last third) | 16.7 / 116.7 / 133.3 / 850 | 270 | 150 | 1.9 / 116.4 / 859 | n/a (intervals already show it) |
| Phone-like, CPU 4x | paused 20 s | 39.9 | 16.7 / 100 / 116.7 / 116.8 | 75 | 39 | 6.7 / 114.8 / 124.8 | 75 |
| Phone-like, CPU 1x | growth 45 s (`speed=2`) | 57.2 | 16.7 / 16.8 / 16.8 / 216.6 | 19 | 11 | 1.6 / 27.9 / 218 | 180 of 2592 |

The desktop run was repeated under lower host load (load average 4): JS figures are identical (leaf rebuild median 21.2 ms), but 99 growth frames and 209 paused frames exceed 33 ms without a JS cause and the paused tree runs at 46 fps. The mature High scene sits at the edge of this integrated GPU's budget whenever another process uses the GPU; see section 1.3.

Long tasks (> 50 ms) in the phone-like 4x run: 196 during growth (162 over 100 ms, longest 859 ms), 75 while paused (all 100 to 126 ms). None on desktop.

Reading: the median frame is fine everywhere (16.7 ms). The app is not slow, it stutters. Every stutter is a CPU rebuild on the main thread; the pattern is periodic (8 Hz while growing, 4 Hz when paused), which reads as judder.

### 1.2 Time per phase

Per run of the phase (ms), and share of wall time. Mature = last third of the growth run.

| Phase | Desktop: median / p95 / max | Desktop share (mature) | Phone-like 4x: median / p95 / max | Phone-like share (mature) |
|---|---|---|---|---|
| leaves rebuild (matrix compose + CPU light bake, all leaves) | 21.5 / 24.3 / 34.2 (23.3 mature) | 17.6% | 54.8 / 103.5 / 121.6 (101 mature) | 52.5% |
| canopy shadow bake (safe path only) | not active on High | 0 | about 700 per bake, max 730 (169 at 1x) | 26.1% |
| sim step (growth, structure, sag) | 1.6 / 2.1 / 3.8 per frame | 6 to 10% | 2.3 / 19.8 / 22.7 per frame | 10% |
| geometry rebuild (branch tubes) | 1.3 / 1.7 / 2.8 | 1.1% | 4.2 / 6.8 / 12.5 | 3.0% |
| light grid | 0.9 / 1.3 / 1.4 | 0.2% | 2.7 / 4.2 / 6.7 | 0.5% |
| render (three scene traversal + GL calls, CPU side) | 0.5 / 1.0 / 32 | 3.5% | 0.9 / 3.4 / 58 | 3.7% |
| pmrem bake | 0 bakes (default `sky.cycle = false`) | 0 | 0 bakes | 0 |

Slow-frame attribution (frames whose interval exceeds 33 ms, phone-like 4x growth): leaves rebuild 247, canopy shadow 22, sim step 1.

### 1.3 Scene load at maturity

| | Desktop High | Phone Low |
|---|---|---|
| Nodes / leaf instances | 5.0k / 35.2k | 4.9k / 30.0k |
| Triangles per frame | about 2.5 M (leaves 16 tris x 35k x 3 passes: colour, shadow, GTAO g-buffer) | about 1.0 M (leaves 32 tris x 30k, doubled card) |
| Draw calls per frame | 36 | 6 |
| Programs / textures / geometries | 30 / 29 / 9 | 9 / 11 / 8 |
| Light grid | 2.4k cells | 2.2k cells |
| JS heap | 8 to 46 MB, 22 MB/s allocated in growth, 52 MB/s paused | 8 to 50 MB, 13 to 18 MB/s |

GPU cost of the High post chain (uncapped vsync, mature paused tree, 2160x1350 = 1440x900 at DPR 1.5, Arc): High about 66 fps (15 ms per frame), Low about 214 fps (4.7 ms per frame). High costs about 3x Low and has almost no headroom on an integrated GPU at DPR 1.5; any added grass or creatures on High needs budget freed first (section 1.4, item 9). These two figures come from 8 s windows that include shader-compile stalls, so treat them as plus or minus 20%.

### 1.4 Suspects: verdicts and fixes

1. **Leaf instance rebuild + CPU light bake for every leaf: CONFIRMED, the dominant cost.**
   - Cost: 0.61 µs per leaf instance on this CPU (21.5 ms for 35k), 3.3 µs at 4x throttle (100 ms for 30k), 8 times per second while growing and 4 times per second when paused.
   - Why: `redraw` in `main.ts` sets `leavesDirty = true` after every branch rebuild, so each branch rebuild forces a full `Leaves.update`. `Leaves.update` recomputes the matrix (basis, quaternion, compose) and the full lighting bake for every leaf, although a mature tree changes by millimetres between passes. Per leaf it allocates a `THREE.Quaternion` and two closures (`hr`, `ch`), which is the source of the 22 to 52 MB/s heap churn.
   - Fix A (static fast path): rebuild only when something changed. Dirty sources: `sim.time` advanced, `sim.topology` changed, `sim.lightVersion` changed, the sun direction key changed, camera distance LOD (exists), a params edit. A paused tree then does zero rebuilds.
   - Fix B (time-slicing): run the leaf loop as a resumable pass over a back buffer with a per-frame millisecond budget (3 ms), then swap and upload once per completed pass. At 3 ms per frame the pass completes in about 8 frames on desktop and about 35 frames (0.6 s) at 4x throttle; no frame exceeds its budget.
   - Fix C (allocation removal): hoist the quaternion and both closures out of the loop; inline the hash.
   - Fix D (cadence): once `sim.topology` is unchanged for 5 s, start a leaf pass at most once per second.
   - Not recommended now: a Web Worker for the bake. It needs the node arrays transferred or shared (`TreeNode` is an object graph, not a typed array), which is a sim refactor. Time-slicing reaches the same frame pacing with a 60-line change.

2. **Canopy-shadow canvas bake: CONFIRMED, the worst single frame on the phone path.**
   - Cost: about 700 ms per bake at 4x throttle, 169 ms unthrottled, every 2 s while growing (`minGap = 2`), 26% of wall time on the mature phone tree. It is the 850 ms worst frame.
   - Why: one gaussian splat per leafy node (about 4k) with a footprint radius of `2.5 * sp * el` pixels; the penumbra term grows with caster height and `el` reaches 2.5 at low sun, so a splat covers up to about 100x100 texels with one `Math.exp` each: tens of millions of `exp` calls per bake.
   - Fix: replace per-node gaussian splats by deposit-then-blur. Work in a sun-aligned texture frame (u = sun azimuth on the ground, w = perpendicular; rotate the decal plane by the azimuth). Bin leafy nodes into 4 height bands; for each band add `v` to the nearest texel of that band's 256² float layer (4k additions). Blur each layer with a separable 3-pass box blur whose radius is the band's mean penumbra (`sp`), multiplied by `el` along u only; sum the layers into `tau`. Cost is about 4 layers x 3 passes x 2 axes x 65k texels = 1.6 M additions, an estimated 100x less. Trunk streaks, the contact ring, flecks and the final opacity mapping stay as they are.
   - Also: run it as a time-sliced job with the same budget mechanism as the leaves, so even the reduced cost never lands in one frame.

3. **Rebuilds on a tree that is not changing: CONFIRMED.** A paused tree rebuilds branches and leaves at 4 Hz (`period = growing ? 0.12 : 0.25` in `redraw`) and runs `sim.updateStructure(0)` every frame (1.7 ms desktop, 5.7 ms at 4x: 23% of the paused phone frame time). Fix: the static fast path of item 1 plus skipping `updateStructure` when neither time nor params changed (a `paramsVersion` counter bumped by the GUI `onChange` and by `Automation.apply` when it writes a different value).

4. **Full branch-mesh rebuild at 8 Hz: RULED OUT as a cost; it is a smoothness problem instead.** 1.3 ms desktop, 4 to 6 ms at 4x throttle for 36k vertices. Tips elongate continuously in the sim (`tip.len += ... * dt`), but the mesh shows it in 8 Hz steps. Fix: rebuild the branch mesh every frame on High (1.3 ms) and every second frame on Low, decoupled from the leaf pass. Growth then looks continuous at display rate with no interpolation code. Leaves trail the twigs by at most one leaf pass, which is invisible at growth speeds.

5. **Adaptive pixel ratio reacts to CPU stalls: CONFIRMED (new finding).** In the phone-like run `Stage.adaptDpr` steps 2 → 1.75 → 1.5 → 1.25 → 1 between t = 29 s and t = 38 s (reported fps 36, 26, 14.9, 12.6). The median frame interval stays 16.7 ms throughout: the GPU is not the limit, the leaf and canopy rebuilds are. The image is rendered at a quarter of the pixels for no gain. Fix: decide on the median rAF interval of the 3 s window (step down when the median exceeds 25 ms), not on the mean fps. After fixes 1 and 2 the trigger mostly disappears, but the median rule is the correct signal either way.

6. **Light grid allocating six Float32Arrays: RULED OUT.** The default oak uses 2.2k to 2.7k cells (65 KB per update at 2 Hz); the phase costs 0.9 ms (2.7 ms at 4x). The 400k-cell ceiling is not approached. Typed-array reuse is a two-line cleanup, not a fluidity fix.

7. **PMREM re-bakes: RULED OUT at default settings.** `sky.cycle` is false by default, the sun does not move, and zero bakes occur in 80 s. With the day cycle on, see section 1.5.

8. **InstancedMesh re-creation on capacity growth, branch buffer reallocs: RULED OUT.** 7 leaf reallocs and 12 branch reallocs, all in the first 37 s, none coincides with a frame over 33 ms on desktop. Starting the leaf mesh at its final capacity (32k on Low) removes them anyway and avoids repeated VAO and buffer creation on the phone driver.

9. **Post-processing on High (GTAO, god rays, bloom, 4x MSAA half-float target): CONFIRMED as the GPU budget holder, not as a pacing problem.** About 3x the frame cost of Low on the Arc at DPR 1.5; 60 fps holds with little headroom. Fixes when headroom is needed: GTAO at half resolution, MSAA 4 → 2, leaf card with 4 triangles instead of 16 for the shadow and g-buffer passes (the passes that do not need the curved blade), shadow-pass leaf thinning (every second instance at 1.4x scale).

10. **Garbage collection: minor.** 3 to 4 scavenges per second (about 7 MB each), no long task attributable to GC, 3 slow frames in 60 s on desktop without a JS cause. Fix C of item 1 removes most of the allocation.

11. **Draw calls and triangles: not a problem on the measured GPU.** 6 draw calls and 1.0 M triangles on the phone path. On the PowerVR the 1.0 M alpha-tested leaf triangles are the likely GPU cost (alpha test defeats hidden-surface removal on tile-based GPUs); this cannot be measured from this host. The phone's own telemetry (`hb` records: fps, pixelRatio, `dpr_change`) after fixes 1, 2 and 5 answers it: if the median interval still exceeds 25 ms at DPR 2, the leaf cap or the card triangle count is the lever.

### 1.5 Day cycle on

Phone-like 4x, `cycle=true&dayLength=40` (a fast cycle), tree at t = 60 to 70 s, 24 s wall (`prof/phone-x4-daycycle.json`):

| Phase | Runs | median / p95 / max (ms) | Share of wall time |
|---|---|---|---|
| pmrem bake | 2 | 6.7 / 6.7 / 6.7 (+ 2.6 for the swap) | 0.06% |
| canopy shadow | 25 | 402 / 1269 / 1337 | 46.6% |
| leaves rebuild | 66 | 121.5 / 257 / 281 | 39.1% |

- PMREM is ruled out with the cycle on as well: 2 bakes of 7 ms.
- A moving sun makes the canopy bake far worse: the sun key changes continuously, so the bake runs every 0.5 s instead of every 2 s, and its cost rises to 1.3 s at low sun (larger `el` stretch and penumbra). The run averages 6.8 fps with a 1.6 s worst frame. The leaf pass also grows (the sun-transmittance march over the light grid reruns for each new sun key). WP4 and WP2 are required before the day cycle is usable on the phone.
- The program count in this run is 10 instead of 9 (one more program appears once the sky state changes). The program-count gate of section 3.1 therefore compares before and after at the same time of day.

## 2. Visual realism

Images reviewed (Intel Arc): `shots/audit-desk-t90-{golden,noon,night}-{framed,close}.png`, `shots/audit-desk-t35-golden-*.png`, `shots/audit-phone-t90-{golden,noon,night}-*.png`, `shots/audit-phone-t35-golden-*.png`. Reference: handheld or tripod footage of a solitary oak in a meadow.

Ranked by how strongly each item breaks the "video of nature" impression:

1. **Almost nothing moves.** Real footage is never still: leaves flutter, twigs sway, grass ripples in waves, insects cross the frame, light flickers. Here the full leaf path has a small vertex-shader sway; the phone path has no leaf motion at all. Branches, grass, light and shadow are frozen on both paths. Clouds drift (sky shader `time`), the camera orbits, and the tree grows in 8 Hz steps. On the phone the only motion is the camera and the stepped growth.
2. **The ground is an empty flat plane.** A single textured disc: no blades, no silhouette at the base of the trunk, no height variation, no flowers, no stones, nothing in the foreground. At golden hour it turns into a uniform dark olive-brown field that fills 45% of the portrait frame. The trunk meets it with a hard line. A straight, perfectly level fog band marks the horizon, and the hills are flat single-colour silhouettes (pink bands on the phone at golden hour).
3. **Hanging strands under the crown.** Long bare twigs hang vertically below the crown in every shot, like aerial roots or vines. An oak has none. Leaves are suppressed on steeply down-pointing segments (`wdy < -0.75`) but the segments themselves are still drawn. They need pruning or a sag limit in the sim, or hiding in `BranchMesh` when a chain of order ≥ 2 points down for most of its length.
4. **Leaves read as cards.** Close up the blades are large, flat, hard-edged and all the same shape; there is no curl variation, no petiole, no specular flicker, and the safe path shows cartoon-like light/dark green patches with no shading inside a blade. From the framed distance the phone crown is a saturated lime green at all hours, including golden hour, where the desktop crown is dark and backlit. The phone tree looks pasted onto the dark ground.
5. **Lighting and exposure.** Golden hour on desktop underexposes the tree against a washed-out near-white sky; the sun disc is a faint blob and there is no rim light or warm bounce on the trunk. The phone at golden hour has no visible crown shadow on the ground. Night is a pure black silhouette with a black crown shadow as strong as at noon, no moon in view, and no light source that explains the shadow. The vignette on High is heavy enough to be noticed as an effect.
6. **Growth animation.** Branch geometry updates in 8 Hz steps. Leaves appear in clumps of 8 at once per node and scale up over 3 s, always from the same pose. New twigs appear at full segment radius. At t = 35 s the young tree is a sparse pole with oversized leaves along each shoot (a "bottle-brush" look) rather than a sapling with a few leaf clusters.
7. **Bark and branch structure.** The bark map reads as painted parallel lines, low in detail at trunk close-up distance, with visible stretching. Branch junctions are plain tube intersections without collars. Limbs are straight sticks at shallow angles; near the trunk there is a dense fan of thin straight twigs.
8. **No depth cues beyond fog.** No foreground elements, no depth of field, no parallax objects between camera and tree, no aerial perspective on the tree itself. The fog band is the only cue and it looks like a studio backdrop.
9. **Sky.** Noon is the best case: soft drifting cloud layers. At golden hour the clouds vanish into a flat cream gradient; there is no colour separation between zenith and horizon, no lit cloud undersides. At night the stars are sharp white dots without twinkle, Milky Way or moon.
10. **Camera.** The cinematic orbit is smooth but mechanical: constant angular drift, no handheld micro-motion, no focus behaviour. In portrait the tree occupies about 28% of the frame height with empty sky above and empty ground below; with nothing on the ground this emptiness dominates the phone experience.
11. **Phone path vs desktop path.** The phone has no shadow-map shadows (a blurred decal instead, missing at low sun), no AO, no bloom, no grade, no leaf wind, no translucency in the shader, flat hills and brighter, more saturated leaves. The desktop image is moodier and more coherent; the phone image is cleaner but looks like a game asset on a backdrop. Bringing motion and ground life to the phone closes more of this gap than any shading change.

## 3. Living surroundings

### 3.1 Program rule for the phone path

Program identity in three is a cache key computed in JS from the material type, its feature flags (map, alphaTest, vertexColors, emissive presence does not count but emissiveMap does, side, transparent, fog, premultipliedAlpha), the object (instancing, instanceColor, receiveShadow with shadows enabled, skinning, morphs), geometry attributes (tangent, colour when vertexColors) and renderer/scene state (lights, fog type, tone mapping, environment). Texture pixels, uniforms, geometry vertex data, instance data, blending mode and depth flags are not part of it.

Known-good configurations on the PowerVR phone, as found in the code:

| Id | Configuration | Where |
|---|---|---|
| P-LEAF | `InstancedMesh` + `MeshLambertMaterial({ map, alphaTest: 0.5, side: FrontSide })` + `instanceColor`, no shadows cast or received, geometry with position/normal/uv only | `Leaves` safe V0 |
| P-BARK | `Mesh` + `MeshStandardMaterial({ map, normalMap, roughnessMap, roughness: 1, metalness: 0 })`, receives shadows | `BranchMesh` |
| P-GROUND | `Mesh` + `MeshStandardMaterial({ map })` with the ground `onBeforeCompile` patch (it is a patched standard material, not a `ShaderMaterial`), receives shadows | `Stage.makeGround` |
| P-DECAL | `Mesh` + `MeshBasicMaterial({ map, transparent: true, depthWrite: false })` on a plane | `CanopyShadow` |
| P-STARS | `Points` + `PointsMaterial({ sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, blending: Additive })` | `Atmosphere` |

Rules for every new phone-path object:

- Build its material with `known.clone()` from the live known-good material and change only `map` (and `normalMap`/`roughnessMap` textures, keeping them present), `color` and `opacity`. Geometry carries exactly the same attribute set as the original.
- Same object flags: P-LEAF objects are `InstancedMesh` with an `instanceColor` attribute and `castShadow = receiveShadow = false`.
- All animation is CPU-side: instance matrices, instance colours, object matrices, material colour.
- Acceptance gate, testable on this host: in phone emulation `__arbor.stage.renderer.info.programs.length` is 9 before the change and 9 after it, in day and night. The key is computed in JS, so the count is GPU-independent. `scripts/smoke.mjs` asserts it.
- New textures go through `cleanLeafTexture` (alpha exactly 0 or 1, dilated RGB, hand-built mips), as the leaf map does.

### 3.2 Wind model

One `Wind` object (`src/wind.ts`, no three import): `dir` (unit xz), `base` strength 0 to 1 (param `sky.wind`, default 0.35), and `gust(x, z, t) = base * (0.6 + 0.4 * sin(0.21 t + 0.5 * dot(dir, p)) ) * (0.75 + 0.25 * sin(1.3 t + 0.9 * dot(dir, p) + 1.7))`, a travelling wave so gusts visibly cross the meadow. The same expression exists in GLSL for the desktop shaders. Every moving element reads it: leaves, grass, flowers, motes, falling leaves, butterflies (drift), sound (gain). Wind strength drops by half at night.

### 3.3 Elements

Counts are phone / desktop. Cost is per frame on the JS side unless stated.

| Element | Rendering | Animation | Reacts to | Phone program | Cost (phone) |
|---|---|---|---|---|---|
| Grass tufts | Instanced cross-cards (3 cards, doubled winding, 12 tris) with a painted tuft map, normals pointing up so Lambert lights them like the ground; instance colour = tint variation x ground albedo. 6k / 20k tufts in a disc of radius 14 m, density falling with distance so the far field blends into the ground texture; shorter and sparser inside the crown radius | Phone: tufts are distributed by hash over 24 `InstancedMesh` patches (8 spatial phase bands x 3 hash groups); each patch has `matrixAutoUpdate = false` and its object matrix is a shear `x += kx·y, z += kz·y` driven by `wind.gust` at the patch phase. A shear about y = 0 keeps roots fixed and bends tips: zero buffer uploads. Desktop: one mesh, vertex shader bends by height² with the GLSL gust | Wind; time of day (instance colours rebaked when the sun key changes: warm at golden hour, blue-grey at night); crown shade (shorter, sparser, darker under the canopy footprint, sampled from the canopy `tau` grid every few seconds, written as instance scale and colour) | P-LEAF | 72k tris, 24 draw calls, 24 matrix writes per frame; occasional 6k-instance colour upload |
| Wildflowers (daisy, buttercup, poppy, clover heads) | Same cross-card as grass, one `InstancedMesh` per flower map, 250 / 800 each, placed in clusters outside the crown shade | Same shear patches as the grass (shared patch matrices; 2 patches per species) | Petals close at night (instance scale y x 0.8, colour x 0.6); no flowers in deep shade; bees and butterflies target them | P-LEAF | 4 species x 2 patches = 8 draw calls, about 12k tris |
| Ferns, clover ground cover | Cross-cards with frond / clover-patch maps, 80 ferns + 300 clover patches, inside the crown radius | Fern patches shear at half amplitude | Ferns scale up from 0 as the canopy shade deepens (crown `tau` above 0.8), so the understorey appears as the tree matures | P-LEAF | 2 to 4 draw calls |
| Mushrooms, stones, fallen twigs | One merged static `BufferGeometry` (40 stones x 20 tris, 25 mushrooms x 30 tris, 30 twigs), uv into a small atlas with matching normal and roughness atlases | Static. Mushrooms use a second merged mesh whose object scale grows from 0 once the tree is older than 60 s | Mushrooms only in shade near the trunk; stones anywhere; all receive the shadow map and decal | P-BARK (cloned material, three atlas textures) | 2 draw calls, 2k tris |
| Fallen leaves on the ground | A second `InstancedMesh` with the leaf geometry and the leaf material itself (same instance, same map), 300 instances lying flat with brown/yellow instance colours, accumulating under the crown as falling leaves land | Static after landing; a gust above 0.8 slides a few by rewriting their matrices | Count grows with tree age and leaf count | P-LEAF (identical material instance) | 1 draw call |
| Falling leaves | Same mesh as fallen leaves; 12 / 30 active instances | CPU: spawn at a random leafy node, fall at 0.6 m/s with a spiral and tumble (rotation about two axes, lateral drift from `wind.gust`), land, become a fallen leaf | Spawn rate rises with gusts and at dusk; none before the tree has 500 leaves | P-LEAF | 12 matrix writes + one 192-float upload per frame |
| Butterflies | One `InstancedMesh` per species (2 species), geometry = one wing card; 2 instances per butterfly, 8 / 16 butterflies | CPU: body follows a wandering path between flower clusters (target seek + sinusoidal bobbing), wings rotate about the body axis at 9 to 12 Hz, rest on a flower for 2 to 6 s with slow wing opening | Day only, most at noon; drift with wind; sheltered side of the crown in strong wind; avoid the camera within 1 m | P-LEAF | 2 draw calls, 16 instances, 256-float upload per frame |
| Bees | As butterflies with a tiny body card, 6 / 12 | Fast jitter around flower heads, straight dashes between clusters | Day, warm hours | P-LEAF | 1 draw call |
| Dust motes / pollen | One `Points` object, 80 / 300 points in the volume between camera and crown | CPU position update (slow drift + wind + sine wobble), per-vertex colour brightness = sun visibility along the view (bright in the low sun, dim in crown shade from the light grid) | Brightest at golden hour against the dark crown; off at night | P-STARS (same material config; positions and colours rewritten per frame) | 1 draw call, 480 floats per frame |
| Fireflies | Second `Points` object, 25 / 60 points, yellow-green vertex colours | CPU: slow looping paths 0.3 to 2 m above the grass near the crown edge; blink by writing the vertex colour (1.2 s on, 2 to 5 s off, staggered) | Night only (`atmo.night > 0.5`), fade in at dusk | P-STARS | 1 draw call. `size` is a uniform shared with stars only if the material instance is shared; a cloned material with `size: 3` keeps the same program |
| Birds, flying | One `InstancedMesh`, geometry = one wing card, 2 instances per bird, flock of 5 to 9 as dark silhouettes crossing the sky at 40 to 80 m | CPU: flock centre on a straight line, per-bird offsets, wing flap 4 Hz with glide pauses | Day; every 30 to 90 s; more at dawn and dusk | P-LEAF | 1 draw call |
| Birds, perching | 1 to 3 birds: a billboard card (yaw-only rotation toward the camera) with a painted songbird map | Lands on a node with order ≤ 2, radius 0.02 to 0.06 m and near-horizontal direction; hops, turns, flies off after 10 to 40 s or when the camera comes within 3 m; flight uses the flying-bird wings | Only once such branches exist (tree taller than 2 m); song in the audio layer is panned to its position | P-LEAF | 1 draw call |
| Rabbit at a distance | One billboard card, 2 pose maps in 2 `InstancedMesh`es (scale 0 hides the unused pose), at 15 to 25 m | Hop cycle: pose swap + parabolic hop, pauses, sits up | Dawn and dusk only; flees when the camera approaches | P-LEAF | 2 draw calls |
| Leaf wind on the phone | Split the crown leaves over 24 `InstancedMesh`es: 8 spatial regions (by order-1 limb of the leaf's node) x 3 hash groups. Region component: rotation of up to 1.2° about the limb's base node, following `wind.gust`. Hash-group component: an extra 0.4° flutter with its own phase, so neighbouring leaves move against each other. Each mesh may use a cloned material whose `color` oscillates ±4% for light flicker | Object matrices only | Wind; calmer at night | P-LEAF | 24 draw calls instead of 1, zero uploads. Displacement at 2 m from the anchor is about 4 cm, less than a third of a leaf, so the fixed branch mesh does not visibly detach. The time-sliced leaf pass writes into per-mesh back buffers |
| Leaf wind on desktop | Existing shader sway, driven by the shared GLSL gust instead of a fixed sine; branch mesh gains a per-vertex `sway` attribute (height above the limb base x 1 / radius) and a vertex-shader bend | GPU | Wind | n/a | none on CPU |
| Light flicker under the crown | Decal plane object matrix: translate ±3 cm and scale ±1% with the gust (the dapple pattern slides slightly) | Object matrix | Wind | P-DECAL (existing object) | zero |

Phone totals with everything on: about 75 extra draw calls, about 95k extra triangles (the leaves are 1.0 M), per-frame uploads below 2 KB, per-frame JS below 0.5 ms unthrottled.

### 3.4 Ambient sound

`src/audio.ts`, procedural Web Audio, no assets. Off by default; a speaker button in the overlay creates the `AudioContext` on the first tap (autoplay policy) and stores the choice in `localStorage`. The context suspends when the tab is hidden.

| Layer | Synthesis | Driven by |
|---|---|---|
| Wind | 2 s looped pink-noise buffer → band-pass 300 to 900 Hz; gain and centre frequency follow `wind.gust` at the camera | wind |
| Leaf rustle | The same noise → high-pass 3 kHz, gain = gust² x min(1, leaf count / 20k) | wind, tree size |
| Birdsong | Per call: a sine oscillator at 2 to 5 kHz with a scheduled frequency envelope (3 to 7 notes from a small motif table, random transposition), 40 ms attack/decay, `StereoPannerNode`; one call every 2 to 8 s | day factor, densest at dawn; panned to the perching bird when one exists |
| Crickets | 4.5 kHz sine, amplitude gated by a 30 Hz pulse train in bursts of 3 per second, two detuned voices | night factor |
| Bees | Sawtooth at 190 Hz through a low-pass, gain by distance of the nearest bee to the camera | bees |

## 4. Build plan

Ordered by user-visible gain per effort. Each package is one worker, about 20 minutes.

### WP1: Stop redundant rebuilds, continuous branch growth

- **Goal:** no rebuilds on an unchanged tree; branch growth at display rate; pixel ratio no longer drops because of CPU stalls; no per-leaf allocation.
- **Files:** `src/main.ts`, `src/render/leaves.ts`, `src/render/stage.ts`, `src/ui.ts`, `src/automation.ts`.
- **Approach:**
  1. `main.ts redraw`: split the single `meshAge` into a branch cadence and a leaf cadence. Branch: `branches.update` every frame on High, every second frame on Low, only when `sim.time !== lastBranchTime || sim.topology !== lastTopo || paramsVersion !== lastPV`. It no longer sets `leavesDirty`.
  2. Leaves: `leavesDirty` is set when 0.12 s have passed since the last leaf pass and `sim.time` changed, or when `sim.lightVersion`, the sun key (`dir.toFixed(2)` triple, as `Leaves.sunTransmittance` builds it), `paramsVersion` or the camera-distance LOD condition changed. When `sim.topology` has been stable for 5 s the 0.12 s becomes 1 s.
  3. `frame`: when paused, call `sim.updateStructure(0)` only if `paramsVersion` changed.
  4. `paramsVersion`: a module counter in `params.ts`, bumped from the lil-gui `onChange` handlers in `ui.ts` and from `Automation.apply` when a written value differs from the current one.
  5. `Leaves.update`: hoist `new THREE.Quaternion()` to a member, replace the `hr` closure by inline xorshift on a local variable, replace the `ch` closure by a small module-level function. Create the leaf mesh at capacity 32k on Low and 48k on High so it never reallocates.
  6. `Stage.adaptDpr`: collect rAF intervals per 3 s window, step down when the median exceeds 25 ms, step up when the median is below 17.5 ms for 10 s. Keep the existing ladder and telemetry.
- **Verify:** `MODE=phone THROTTLE=4 node scripts/profile.mjs` and `MODE=desktop`: paused run shows 0 runs of `leaves rebuild` and `geometry rebuild` and `sim step` below 0.3 ms; no `dpr_change` events in the phone-like growth run; heap allocation below 5 MB/s; desktop growth `geometry rebuild` runs ≈ frame count. `npm run smoke`, `npm run shots` unchanged images.
- **Phone risk:** low. Data-only; fewer buffer uploads than before; one fixed-capacity `InstancedMesh` instead of five reallocations.

### WP2: Time-sliced leaf pass

- **Goal:** no frame carries more than 3 ms of leaf work; the 8 Hz judder disappears.
- **Files:** `src/render/leaves.ts`, `src/main.ts`.
- **Approach:** turn the body of `Leaves.update` into a resumable pass: members `passLi` (next sim leaf index), `passN` (instances written), back buffers `backM: Float32Array(cap * 16)`, `backC: Float32Array(cap * 3)`, and a snapshot of the pass inputs (lighting, `rankScale`, camera position, `sim.time`). `beginPass()` snapshots and resets the cursor; `stepPass(budgetMs)` runs the loop from `passLi` and checks `performance.now()` every 256 leaves; when the loop ends it copies `backM`/`backC` into the instance attributes with `set`, sets `count`, the update ranges and `needsUpdate`, and updates `rankScale`. `main.ts` calls `stepPass(3)` every frame while a pass is open and opens the next pass per the WP1 dirty rules. `fastForward` and the first frame call `stepPass(Infinity)`. Leaves born during a pass appear in the next one; the 3 s unfold animation hides the delay.
- **Verify:** profiler: phone-like 4x growth has no `leaves rebuild` run above 5 ms, interval p99 below 34 ms outside canopy bakes, frames over 100 ms only from canopy bakes until WP4; desktop frames with JS over 16.7 ms: 0 in the mature third. Screenshots identical to before (`npm run shots`, phoneshots).
- **Phone risk:** low. Same buffers, same program, one upload per pass instead of 8 per second.

### WP3: Living meadow (grass and wildflowers with wind)

- **Goal:** the ground is alive on both paths: tufts and flowers that ripple in travelling gusts.
- **Files:** new `src/wind.ts`, new `src/render/meadow.ts`, `src/render/textures.ts` (tuft and 3 flower maps, 128 px, painted like `makeLeafTexture`), `src/render/leaves.ts` (export the safe material factory and `cleanLeafTexture` use), `src/main.ts`, `src/params.ts`, `src/ui.ts`, `scripts/smoke.mjs`.
- **Approach:** as in sections 3.2 and 3.3 rows "Grass tufts" and "Wildflowers". Use the P-LEAF path on every quality in this package (desktop shader grass is a later upgrade): material = clone of the safe leaf Lambert material configuration with the tuft map; geometry = 3 crossed doubled cards with up normals; 6k tufts on Low, 20k on High, placed by a seeded hash with density `exp(-r / 6)` plus a thin far ring, excluded within 1.5 trunk radii. Instance colour = albedo tint x a bake of hemisphere + sun for an up-facing surface divided by what Lambert adds (the same `E_wanted / E_lambert` idea as the leaves), recomputed when the sun key changes. 24 patches with shear object matrices updated each frame from `wind.gust(patchCentre, t)`. Flowers reuse the patch matrices.
- **Verify:** `SHOT_DPR=2.625 node scripts/phoneshots.mjs` and `node scripts/auditshots.mjs`: tufts visible at the trunk base and in the foreground at golden, noon and night with colours matching the ground. Two phone screenshots 0.5 s apart differ in the grass region. Smoke assertion: program count in phone emulation equals the pre-change value (9). Profiler: JS median per frame rises by less than 0.3 ms.
- **Phone risk:** medium-low. Same program as the leaves by construction and by the program-count gate; adds 24 to 32 draw calls and about 85k alpha-tested triangles near the ground (overdraw on a tile-based GPU). Mitigation: `?meadow=0` diag switch in `diagSwitches` and `diag.html`, and half counts when `pixelRatio` has stepped down.

### WP4: Canopy shadow bake in under 15 ms

- **Goal:** remove the 700 ms hitch.
- **Files:** `src/render/canopyShadow.ts`.
- **Approach:** section 1.4 item 2: sun-aligned frame, 4 height-band deposit layers, separable 3-pass box blur per layer with radius = band penumbra (x `el` along u), sum into `tau`; the rest of the pipeline unchanged. Rotate the decal mesh about y by the sun azimuth and size it to the sun-aligned footprint.
- **Verify:** profiler phone-like 4x: `canopy shadow` max below 15 ms, growth max interval below 150 ms after WP2. A/B phone screenshots at noon and 16:00: shadow shape, penumbra growth with height and flecks comparable to `shots/audit-phone-t90-noon-framed.png`.
- **Phone risk:** low. Texture pixels and a plane transform only.

### WP5: Look pass (strands, exposure, night, phone palette, framing)

- **Goal:** remove the most visible non-motion artefacts found in section 2.
- **Files:** `src/render/branchMesh.ts`, `src/render/stage.ts`, `src/render/atmosphere.ts`, `src/render/leaves.ts` (bake constants only), `src/params.ts`.
- **Approach:** (a) skip chains of order ≥ 2 in `BranchMesh.update` when more than half of their segments have `wdy < -0.75` (the hanging strands); (b) golden hour: raise the key-light warm rim and lower sky gain so the crown is not a silhouette on High, and make the phone leaf bake follow the sun colour more strongly at low sun (the `sunCol` term) so the crown is warm and darker, matching the ground; (c) night: moon disc in view through the existing second-disc uniforms, crown shadow opacity scaled by moonlight (0.15), leaf bake floor so the crown shows blue-grey form; (d) vignette 0.38 → 0.25; (e) portrait framing: lower the target so the tree base sits at 30% of the frame height and the meadow foreground is in view; (f) hills: second, farther hill ring with lighter fog tint for layered depth; soften the horizon band with a ground-colour to fog-colour gradient in the ground patch (uniform values only).
- **Verify:** `node scripts/auditshots.mjs`, compare each of the 16 images with the current set; no strands under the crown; night crown has visible form; phone golden-hour crown no longer lime green.
- **Phone risk:** low when restricted to data: uniforms, bake constants, geometry. Item (f) must not change the ground material's flags or patch text; if a gradient needs shader text, apply it to High only.

### WP6: Air life (falling leaves, motes, fireflies, butterflies)

- **Goal:** something crosses the frame at every time of day.
- **Files:** new `src/render/life.ts`, `src/render/textures.ts` (2 wing maps), `src/main.ts`, `src/params.ts`, `src/ui.ts`, `scripts/smoke.mjs`.
- **Approach:** section 3.3 rows "Falling leaves", "Fallen leaves", "Dust motes", "Fireflies", "Butterflies". One `Life` class with `update(dt, sim, wind, atmo, camera)`; each sub-system is a small fixed-size struct-of-arrays state plus one draw object. Falling and fallen leaves share the leaf material instance and geometry. Motes and fireflies clone the stars `PointsMaterial` configuration.
- **Verify:** phone and desktop screenshots at 13:00 (butterflies, motes), 18:36 (motes glowing against the crown, a falling leaf), 23:30 (fireflies). Program count unchanged in phone emulation. Profiler: JS median per frame + 0.2 ms at most.
- **Phone risk:** medium-low. P-LEAF and P-STARS reuse; small per-frame instance uploads (the leaf path already uploads far more). `?life=0` diag switch.

### WP7: Leaf wind on the phone path, shared gust on desktop

- **Goal:** the crown moves on the phone.
- **Files:** `src/render/leaves.ts`, `src/main.ts`, `src/wind.ts`.
- **Approach:** section 3.3 row "Leaf wind on the phone". Safe path only: `Leaves` owns 24 `InstancedMesh`es in a `Group` (same geometry and material instance), each with its own back buffer slice in the WP2 pass; a leaf's mesh index = region (order-1 ancestor of its node, hashed into 8) x 3 + hash group. Per frame, each mesh matrix = `T(anchor) · R(axis ⟂ wind, angle) · T(-anchor)` with `angle = 1.2° · gust(anchor) + 0.4° · sin(phase_g + 6 t)`. Instance matrices stay in world space, so the object matrix is a small perturbation. Full path: replace the fixed sines in the leaf vertex patch by the shared gust uniform set.
- **Verify:** two phone screenshots 0.3 s apart differ inside the crown; no visible gap between leaves and twigs in `phoneshots` close-ups; program count unchanged; draw calls on the phone path about 30 + meadow.
- **Phone risk:** medium. Same program and material instance, but 24 instanced draws and 24 instance buffers instead of one. `?leafwind=0` keeps the single-mesh layout as fallback.

### WP8: Birds and ambient sound

- **Goal:** birds cross the sky and perch in the tree; optional soundscape.
- **Files:** `src/render/life.ts`, new `src/audio.ts`, `index.html` (speaker button), `src/main.ts`, `src/render/textures.ts` (bird wing and songbird maps).
- **Approach:** section 3.3 rows "Birds, flying", "Birds, perching" and section 3.4. Perch selection scans `sim.nodes` once every 5 s for candidates. Audio graph is created on the first tap only.
- **Verify:** screenshots with a forced flock (`?birds=now` dev switch) and a perched bird; smoke test taps the speaker button in headless chromium and checks `AudioContext.state === 'running'` and no console errors; program count unchanged.
- **Phone risk:** low for audio (no GL), low for birds (P-LEAF, a few instances).

## 5. Not verified

- Anything on the PowerVR GPU: GPU frame cost of 1.0 M alpha-tested leaf triangles, the cost of the added grass overdraw, and whether 24 to 75 extra draw calls matter there. The program-count gate proves program reuse, not driver stability.
- The real phone's CPU speed relative to the 4x-throttled laptop core; the phone's `hb` telemetry in `logs/client.jsonl` is the ground truth after WP1 and WP2.
- GPU cost per post pass (GTAO vs bloom vs god rays separately); only High vs Low totals are measured.
- The 100x estimate for the canopy bake rewrite is derived from operation counts, not measured.

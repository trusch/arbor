# Arbor: project notes

- Stack: Vite + TS + three r187 + lil-gui. Local git only, no remote. Repo has `commit.gpgsign=false` locally.
- All tunables live in `src/params.ts` (`ArborParams`); sim/render read them live. Add new params there and in `src/ui.ts`.
- Sim is three-free (`src/sim/`); renderer reads `TreeNode.w*` (sagged world) fields.
- Children always have larger node ids than parents; `updateStructure` relies on this for its bottom-up and top-down passes.
- three r187 removed PCFSoftShadowMap; use PCFShadowMap + `shadow.radius`.
- Verify visually: `npm run shots`, then look at the PNGs in `shots/`.
- Look/lighting is driven by `params.sky` (timeOfDay, cycle, dayLength, latitude, sunYaw, exposure, fog, godRays, quality). `params.light` is only the phototropism direction for the sim.
- Preetham sky values blow up bloom at low sun: keep the sky clamp in `atmosphere.ts` (`patchSky`) unless you also retune bloom.
- `scripts/screenshot.mjs` args: stages, extraQuery, prefix, `hour:name,...` list (or `none`). SHOT_W/SHOT_H env set the resolution. Each run takes about 70s on SwiftShader.
- Chains can be `pruned` (shaded out by the light grid in `TreeSim.updateLight`). Renderers must skip pruned chains, and the pipe model ignores them. Radii never shrink.
- `BranchMesh.update` is throttled in `main.ts` (`redraw`). Call it with `meshAge = Infinity` to force a rebuild (see `fastForward`).
- Automation (`src/automation.ts`) writes into the live params object before every sim step; presets are copied into params in place (`loadPreset` in `main.ts`) so GUI controllers stay bound. Use `?preset=Name`.
- Sun discs are drawn in the patched sky shader (`disc1*/disc2*` uniforms); do not use sprites (GTAO override material renders them as solid quads). The env-map sky has `discOn = 0`.
- Screenshot script disables cinema (`cinema=false`) and accepts `PORT` env so several runs can go in parallel (more than ~4 in parallel times out).

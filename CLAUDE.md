# Arbor: project notes

- Stack: Vite + TS + three r187 + lil-gui. Local git only, no remote. Repo has `commit.gpgsign=false` locally.
- All tunables live in `src/params.ts` (`ArborParams`); sim/render read them live. Add new params there and in `src/ui.ts`.
- Sim is three-free (`src/sim/`); renderer reads `TreeNode.w*` (sagged world) fields.
- Children always have larger node ids than parents; `updateStructure` relies on this for its bottom-up and top-down passes.
- three r187 removed PCFSoftShadowMap; use PCFShadowMap + `shadow.radius`.
- Verify visually: `npm run shots`, then look at the PNGs in `shots/`.

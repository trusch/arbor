// Bend-profile probe of the wind sway (shared by scripts/swaycheck.mjs and scripts/smoke.mjs). `swayProbe` runs IN THE
// PAGE: for `ms` milliseconds it reads, every frame, the drawn pose of every unpruned chain of >= `minNodes` nodes
// (rest segment s = node - parent, drawn segment s + D[node] - D[parent]) and records
//   lean     angle between rest and drawn segment (rad),
//   drop     how far the lean falls below the largest lean nearer the chain base (informational: a shoot that arches
//            over and hangs has its bend unwound by the wind on the hanging part, smoothly),
//   flat     fall of the DRAWN ROTATION (tan(lean) / sin(angle segment-axis), axis = the accumulated rotation `sway.TH`)
//            below the largest one nearer the base, counted only where the accumulated rotation has not unwound
//            (>= 98 % of its length there): wood that keeps its rotation but is drawn straighter = the defect
//            (a tip standing upright on a bent stem),
//   kink     largest fall of the drawn rotation from one segment to the next while the accumulated one holds (a corner),
//   tipRatio |D tip| / |D parent of tip| (a tip standing still while its parent swings),
// and returns the worst chain with its base-to-tip profile at the worst frame.
export const swayProbe = (opt) => new Promise((res) => {
  const { ms = 3000, minNodes = 5, profiles = 0 } = opt ?? {};
  const A = window.__arbor, S = A.sim, sw = A.sway;
  const out = { frames: 0, chains: 0, maxDrop: 0, maxFlat: 0, maxKink: 0, dropFrames: 0, minTipRatio: 9, maxOffset: 0, maxLean: 0, worst: null, worstTip: null, t0: S.time, n0: S.nodes.length };
  const prof = (ch) => {
    const D = sw.D, TH = sw.TH, rows = [];
    for (let j = 1; j < ch.nodes.length; j++) {
      const i = ch.nodes[j], n = S.nodes[i], p = S.nodes[n.parent], o = i * 3, q = n.parent * 3;
      const sx = n.wx - p.wx, sy = n.wy - p.wy, sz = n.wz - p.wz, vx = sx + D[o] - D[q], vy = sy + D[o + 1] - D[q + 1], vz = sz + D[o + 2] - D[q + 2];
      const sl = Math.hypot(sx, sy, sz), vl = Math.hypot(vx, vy, vz);
      rows.push({ j, id: i, r: +n.radius.toFixed(4), len: +sl.toFixed(3), rest: [+n.wx.toFixed(2), +n.wy.toFixed(2), +n.wz.toFixed(2)], D: [+D[o].toFixed(3), +D[o + 1].toFixed(3), +D[o + 2].toFixed(3)],
        off: +Math.hypot(D[o], D[o + 1], D[o + 2]).toFixed(3), lean: sl > 1e-5 ? +Math.acos(Math.min(1, (sx * vx + sy * vy + sz * vz) / (sl * vl))).toFixed(3) : null, th: +Math.hypot(TH[o], TH[o + 1], TH[o + 2]).toFixed(3) });
    }
    return rows;
  };
  const t0 = performance.now();
  const tick = () => {
    if (sw.live) {
      out.frames++;
      const D = sw.D, TH = sw.TH, N = S.nodes; let chains = 0, frameBad = false;
      for (const ch of S.chains) {
        if (ch.pruned || ch.nodes.length < minNodes) continue;
        chains++;
        let top = 0, topRot = 0, topTh = 0, drop = 0, flat = 0, prev = 0, prevTh = 0;
        for (let j = 1; j < ch.nodes.length; j++) {
          const i = ch.nodes[j], n = N[i], p = N[n.parent], o = i * 3, q = n.parent * 3;
          const sx = n.wx - p.wx, sy = n.wy - p.wy, sz = n.wz - p.wz, sl = Math.hypot(sx, sy, sz);
          if (sl < 0.02) continue; // a just-created tip segment has no direction yet
          const vx = sx + D[o] - D[q], vy = sy + D[o + 1] - D[q + 1], vz = sz + D[o + 2] - D[q + 2];
          const a = Math.acos(Math.min(1, (sx * vx + sy * vy + sz * vz) / (sl * Math.hypot(vx, vy, vz))));
          if (a > top) top = a; else if (top - a > drop) drop = top - a;
          // Drawn rotation about the model's axis: tan(lean) / sin(angle between segment and axis). A segment lying
          // along the axis does not turn under any rotation, so it says nothing (skipped).
          const tx = TH[o], ty = TH[o + 1], tz = TH[o + 2], th = Math.hypot(tx, ty, tz);
          if (th < 1e-4) continue;
          const sin = Math.hypot(sy * tz - sz * ty, sz * tx - sx * tz, sx * ty - sy * tx) / (sl * th);
          if (sin < 0.3) continue;
          const rot = Math.tan(a) / sin;
          if (rot > topRot) { topRot = rot; topTh = th; } else if (th >= 0.98 * topTh && topRot - rot > flat) flat = topRot - rot;
          if (th >= 0.98 * prevTh && prev - rot > out.maxKink) out.maxKink = prev - rot;
          prev = rot; prevTh = th;
          if (a > out.maxLean) out.maxLean = a;
        }
        const tip = ch.nodes[ch.nodes.length - 1] * 3, par = N[ch.nodes[ch.nodes.length - 1]].parent * 3;
        const dt = Math.hypot(D[tip], D[tip + 1], D[tip + 2]), dp = Math.hypot(D[par], D[par + 1], D[par + 2]);
        if (dt > out.maxOffset) out.maxOffset = dt;
        if (dp > 0.05 && dt / dp < out.minTipRatio) { out.minTipRatio = dt / dp; out.worstTip = { chain: S.chains.indexOf(ch), tip: +dt.toFixed(3), parent: +dp.toFixed(3) }; }
        if (flat > 0.05) frameBad = true;
        if (flat > out.maxFlat) out.maxFlat = flat;
        if (flat > 0.05 ? flat >= out.maxFlat : (out.maxFlat <= 0.05 && drop > out.maxDrop)) { out.maxDrop = drop; out.worst = { chain: S.chains.indexOf(ch), order: ch.order, nodes: ch.nodes.length, simTime: +S.time.toFixed(2), profile: prof(ch) }; }
      }
      out.chains = chains; if (frameBad) out.dropFrames++;
    }
    if (performance.now() - t0 < ms) return requestAnimationFrame(tick);
    out.t1 = S.time; out.n1 = S.nodes.length; out.maxDrop = +Math.max(out.maxDrop, out.maxFlat).toFixed(3); out.maxFlat = +out.maxFlat.toFixed(3); out.maxKink = +out.maxKink.toFixed(3); out.minTipRatio = +out.minTipRatio.toFixed(3); out.maxOffset = +out.maxOffset.toFixed(3); out.maxLean = +out.maxLean.toFixed(3);
    if (profiles) {
      // Leader (chain 0) and the longest other chains, at the last frame.
      const cs = S.chains.filter((c, k) => k > 0 && !c.pruned && c.nodes.length >= minNodes).sort((a, b) => b.nodes.length - a.nodes.length).slice(0, profiles);
      out.leader = S.chains[0].pruned ? null : prof(S.chains[0]);
      out.long = cs.map((c) => ({ chain: S.chains.indexOf(c), order: c.order, profile: prof(c) }));
    }
    res(out);
  };
  requestAnimationFrame(tick);
});

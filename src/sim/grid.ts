/** Uniform hash grid over point ids for radius queries. */
export class PointGrid {
  private cells = new Map<number, number[]>();
  constructor(private cell: number, private pts: Float32Array, private alive: Uint8Array) {
    for (let i = 0; i < pts.length / 3; i++) this.insert(i);
  }
  private key(ix: number, iy: number, iz: number): number {
    return ((ix + 512) * 1024 + (iy + 512)) * 1024 + (iz + 512);
  }
  private insert(i: number) {
    const c = this.cell;
    const k = this.key(Math.floor(this.pts[i * 3] / c), Math.floor(this.pts[i * 3 + 1] / c), Math.floor(this.pts[i * 3 + 2] / c));
    let a = this.cells.get(k);
    if (!a) this.cells.set(k, (a = []));
    a.push(i);
  }
  /** Calls fn(id, dx, dy, dz, dist2) for alive points within r of (x,y,z). */
  query(x: number, y: number, z: number, r: number, fn: (i: number, dx: number, dy: number, dz: number, d2: number) => void) {
    const c = this.cell;
    const r2 = r * r;
    const x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c);
    const y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c);
    const z0 = Math.floor((z - r) / c), z1 = Math.floor((z + r) / c);
    for (let ix = x0; ix <= x1; ix++)
      for (let iy = y0; iy <= y1; iy++)
        for (let iz = z0; iz <= z1; iz++) {
          const a = this.cells.get(this.key(ix, iy, iz));
          if (!a) continue;
          for (let j = a.length - 1; j >= 0; j--) {
            const i = a[j];
            if (!this.alive[i]) {
              a[j] = a[a.length - 1];
              a.pop();
              continue;
            }
            const dx = this.pts[i * 3] - x, dy = this.pts[i * 3 + 1] - y, dz = this.pts[i * 3 + 2] - z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 <= r2) fn(i, dx, dy, dz, d2);
          }
        }
  }
}

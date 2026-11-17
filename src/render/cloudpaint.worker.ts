import { paintClouds } from './cloudpaint';

// One job: paint both cloud maps off the main thread and hand the buffers over (transferred, not copied).
self.onmessage = () => {
  const m = paintClouds();
  (self as unknown as Worker).postMessage(m, [m.atlas.d.buffer, m.deck.d.buffer, m.lit.d.buffer]);
};

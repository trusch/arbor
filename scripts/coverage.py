# Crown coverage from a mask pair (bigtree.mjs MASK=1): leaf pixels = pixels that change when the leaf meshes are
# hidden. Crown silhouette = per row the span between the first and last leaf pixel (rows with >= 15 leaf pixels, 2 % of the pixels trimmed at each end),
# the median filter also closes sub-5-px gaps, so coverage reads closed crown area; coverage = leaf pixels inside the silhouette / silhouette pixels. Usage: python3 scripts/coverage.py NAME [NAME...]
import sys
from PIL import Image, ImageChops, ImageFilter
for name in sys.argv[1:]:
    a = Image.open(f'shots/bigtree-{name}-framed.png').convert('RGB')
    b = Image.open(f'shots/bigtree-{name}-framed-noleaf.png').convert('RGB')
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 12 else 0).filter(ImageFilter.MedianFilter(5))  # median drops meadow-motion speckle
    W, H = d.size; px = d.load(); leaf = sil = 0
    for y in range(H):
        xs = [x for x in range(W) if px[x, y]]
        if len(xs) < 15: continue  # ground noise (litter, shade) under the crown
        lo, hi = xs[len(xs) // 50], xs[-1 - len(xs) // 50]
        sil += hi - lo + 1; leaf += sum(1 for x in xs if lo <= x <= hi)
    d.save(f'shots/bigtree-{name}-mask.png')
    print(f'{name}: coverage {leaf / max(1, sil):.3f} leaf px {leaf} silhouette px {sil}')

# Crown coverage from a mask pair (bigtree.mjs MASK=1): leaf pixels = pixels that change when the leaf meshes are
# hidden. Crown silhouette = per row the span between the first and last leaf pixel (rows with >= 3 leaf pixels),
# coverage = leaf pixels inside the silhouette / silhouette pixels. Usage: python3 scripts/coverage.py NAME [NAME...]
import sys
from PIL import Image, ImageChops
for name in sys.argv[1:]:
    a = Image.open(f'shots/bigtree-{name}-framed.png').convert('RGB')
    b = Image.open(f'shots/bigtree-{name}-framed-noleaf.png').convert('RGB')
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 12 else 0)
    W, H = d.size; px = d.load(); leaf = sil = 0
    for y in range(H):
        xs = [x for x in range(W) if px[x, y]]
        if len(xs) < 3: continue
        sil += xs[-1] - xs[0] + 1; leaf += len(xs)
    d.save(f'shots/bigtree-{name}-mask.png')
    print(f'{name}: coverage {leaf / max(1, sil):.3f} leaf px {leaf} silhouette px {sil}')

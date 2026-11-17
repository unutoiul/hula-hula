"""Optimize generated frame layers and derive code-native SVG photo masks from their alpha.

The illustration edits come from Imagegen. This reads the finished alpha channel
to calculate the enclosed picture opening; it does not repaint the frame artwork.
"""
from collections import deque
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/images/royal-pineapple/badge-frames'
OUT.mkdir(parents=True, exist_ok=True)
FRAMES = [
    ('pool-club', '12-pool-club-frame', 'badge-frames-v1'),
    ('evening-garden', '13-evening-garden-frame', 'badge-frames-v1'),
    ('grand-arrival', '14-grand-arrival-frame', 'badge-frames-v1'),
    ('riviera-postcard', '22-balanced-botanical-postcard', 'postcard-frames'),
]

def convex_hull(points):
    points = sorted(set(points))
    def cross(a, b, c):
        return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    def half(sequence):
        result = []
        for point in sequence:
            while len(result) >= 2 and cross(result[-2], result[-1], point) <= 0:
                result.pop()
            result.append(point)
        return result
    return half(points)[:-1]+half(reversed(points))[:-1]

result = {}
for key, filename, folder in FRAMES:
    source = ROOT / 'assets' / folder / f'{filename}.png'
    original = Image.open(source).convert('RGBA')
    # WebP preserves the source alpha, including the decorative foliage edges.
    size = (1200, round(1200 * original.height / original.width))
    optimized = OUT / f'{filename}.webp'
    pending = OUT / f'{filename}.pending.webp'
    if not optimized.exists() or optimized.stat().st_mtime < source.stat().st_mtime:
        original.resize(size, Image.Resampling.LANCZOS).save(pending, quality=90, method=6)
        pending.replace(optimized)
    alpha = original.getchannel('A').resize((768, round(768*original.height/original.width)), Image.Resampling.LANCZOS)
    width, height = alpha.size
    pixels = alpha.load()
    seed = (width//2, round(height*.46))
    assert pixels[seed] < 64, f'{filename}: the centre must be transparent'
    queue, seen, edges = deque([seed]), {seed}, {}
    while queue:
        x, y = queue.popleft()
        assert 0 < x < width-1 and 0 < y < height-1, f'{filename}: picture hole connects to exterior'
        if y not in edges:
            edges[y] = [x, x]
        else:
            edges[y][0] = min(edges[y][0], x)
            edges[y][1] = max(edges[y][1], x)
        for point in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if point not in seen and pixels[point] < 64:
                seen.add(point)
                queue.append(point)
    assert len(seen) > width*height*.15, f'{filename}: picture opening is too small'
    # Gaps between palm fronds can be enclosed separately from the main window.
    # Include those interior openings so the page background never shows through
    # the foliage. Exterior transparency and tiny paper-texture pinholes stay out.
    core_top, core_bottom = min(edges), max(edges)
    leaf_windows = 0
    for scan_y in range(height):
        for scan_x in range(width):
            if pixels[scan_x, scan_y] >= 64 or (scan_x, scan_y) in seen:
                continue
            queue = deque([(scan_x, scan_y)])
            seen.add((scan_x, scan_y))
            part, exterior = [], False
            while queue:
                x, y = queue.popleft()
                part.append((x, y))
                exterior = exterior or x == 0 or y == 0 or x == width-1 or y == height-1
                for point in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                    nx, ny = point
                    if 0 <= nx < width and 0 <= ny < height and point not in seen and pixels[point] < 64:
                        seen.add(point)
                        queue.append(point)
            if exterior or len(part) < 12 or min(y for x,y in part) < core_top-2 or max(y for x,y in part) > core_bottom+2:
                continue
            leaf_windows += 1
            for x, y in part:
                if y not in edges:
                    edges[y] = [x, x]
                else:
                    edges[y][0] = min(edges[y][0], x)
                    edges[y][1] = max(edges[y][1], x)
    # Fill behind opaque palms and scrolls too, so tiny gaps in leaves show the
    # photograph. The convex window stays enclosed by the original badge border.
    hull = convex_hull([(x,y) for y, span in edges.items() for x in span])
    middle_x = sum(x for x,y in hull)/len(hull)
    middle_y = sum(y for x,y in hull)/len(hull)
    hull = [(x+(1 if x>middle_x else -1),y+(1 if y>middle_y else -1)) for x,y in hull]
    polygon = ' '.join(f'{x},{y}' for x,y in hull)
    (OUT / f'{filename}-window.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}"><polygon points="{polygon}" fill="white"/></svg>\n', encoding='utf-8')
    min_x, max_x = min(x for x,y in hull), max(x for x,y in hull)
    min_y, max_y = min(y for x,y in hull), max(y for x,y in hull)
    result[key] = {
        'image': f'/images/royal-pineapple/badge-frames/{filename}.webp',
        'mask': f'/images/royal-pineapple/badge-frames/{filename}-window.svg',
        'width': original.width, 'height': original.height,
        'window': {'left': round(min_x/width*100,3), 'top': round(min_y/height*100,3), 'width': round((max_x-min_x)/width*100,3), 'height': round((max_y-min_y)/height*100,3)},
    }
    print(key, 'opening:', result[key]['window'], 'SVG vertices:', len(hull), 'leaf openings:', leaf_windows)

source = '// Generated by scripts/prepare-badge-frames.py from the finished frame alpha.\n'
source += 'export const badgeFrames = '+json.dumps(result, indent=2)+' as const;\n'
source += 'export type BadgeFrameName = keyof typeof badgeFrames;\n'
(ROOT / 'src/components/landing/badgeFrames.ts').write_text(source, encoding='utf-8')

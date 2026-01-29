import json
import re
import math

def simplify_polygon(coords, max_points=30):
    """폴리곤 좌표를 간소화 (일정 간격으로 샘플링)"""
    if len(coords) <= max_points:
        return coords

    step = len(coords) / max_points
    simplified = []
    for i in range(max_points):
        idx = int(i * step)
        simplified.append(coords[idx])

    # 닫힌 폴리곤 보장
    if simplified[0] != simplified[-1]:
        simplified.append(simplified[0])

    return simplified


with open('src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
zones = json.loads(match.group(1))

print(f"원본: {len(zones)}개 구역")

optimized = []
for z in zones:
    if z.get('geometry') == 'multipolygon':
        new_coords = []
        for poly in z['coordinates']:
            simplified = simplify_polygon(poly, 25)
            if len(simplified) >= 4:
                new_coords.append(simplified)
        if new_coords:
            z['coordinates'] = new_coords
            optimized.append(z)
    else:
        z['coordinates'] = simplify_polygon(z.get('coordinates', []), 25)
        if len(z['coordinates']) >= 4:
            optimized.append(z)

# ID 재할당
for i, zone in enumerate(optimized):
    zone['id'] = i + 1

print(f"최적화 후: {len(optimized)}개 구역")

styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1)

output = 'export const fishingZones = ' + json.dumps(optimized, ensure_ascii=False, indent=2) + ';\n'
output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

import os
size = os.path.getsize('src/data/fishingZones.js')
print(f"파일 크기: {size / 1024 / 1024:.1f}MB")

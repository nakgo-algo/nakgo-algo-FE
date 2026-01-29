import json

all_zones = []
id_counter = 1

# 1. 내수면 구역 (inland_zones.json)
with open('src/data/inland_zones.json', 'r', encoding='utf-8') as f:
    inland = json.load(f)

for z in inland:
    z['id'] = id_counter
    if 'geometry' not in z:
        z['geometry'] = 'polygon'
    all_zones.append(z)
    id_counter += 1

print(f"내수면 구역: {len(inland)}개")

# 2. 대전 하천 (daejeon_river_polygons.json)
with open('src/data/daejeon_river_polygons.json', 'r', encoding='utf-8') as f:
    daejeon = json.load(f)

for z in daejeon['rivers']:
    z['id'] = id_counter
    all_zones.append(z)
    id_counter += 1

print(f"대전 하천: {len(daejeon['rivers'])}개")

# 3. 주요 하천 (major_rivers.json)
with open('src/data/major_rivers.json', 'r', encoding='utf-8') as f:
    rivers = json.load(f)

for z in rivers['rivers']:
    z['id'] = id_counter
    all_zones.append(z)
    id_counter += 1

print(f"주요 하천: {len(rivers['rivers'])}개")

# 4. 경기도 구역 (gyeonggi_zones.json)
with open('src/data/gyeonggi_zones.json', 'r', encoding='utf-8') as f:
    gyeonggi = json.load(f)

for z in gyeonggi['zones']:
    z['id'] = id_counter
    all_zones.append(z)
    id_counter += 1

print(f"경기도 구역: {len(gyeonggi['zones'])}개")

# 5. 해양 금지구역 (marine_prohibited_zones.json)
with open('src/data/marine_prohibited_zones.json', 'r', encoding='utf-8') as f:
    marine = json.load(f)

for z in marine['zones']:
    z['id'] = id_counter
    all_zones.append(z)
    id_counter += 1

print(f"해양 금지구역: {len(marine['zones'])}개")

# 중복 제거 (이름 기준, 더 많은 좌표 유지)
seen = {}
for zone in all_zones:
    name = zone['name']
    if zone.get('geometry') == 'multipolygon':
        coords_count = sum(len(p) for p in zone.get('coordinates', []))
    else:
        coords_count = len(zone.get('coordinates', []))

    if name not in seen:
        seen[name] = zone
    else:
        existing = seen[name]
        if existing.get('geometry') == 'multipolygon':
            existing_count = sum(len(p) for p in existing.get('coordinates', []))
        else:
            existing_count = len(existing.get('coordinates', []))

        if coords_count > existing_count:
            seen[name] = zone

unique_zones = list(seen.values())

# ID 재정렬
for i, zone in enumerate(unique_zones):
    zone['id'] = i + 1

print(f"\n중복 제거 후: {len(unique_zones)}개")

# fishingZones.js 작성
output = 'export const fishingZones = ' + json.dumps(unique_zones, ensure_ascii=False, indent=2) + ';\n'

output += '''
export const zoneStyles = {
  prohibited: {
    fillColor: '#CC3333',
    fillOpacity: 0.3,
    strokeColor: '#CC0000',
    strokeWeight: 2,
    strokeOpacity: 0.8
  },
  restricted: {
    fillColor: '#E67E22',
    fillOpacity: 0.25,
    strokeColor: '#CC6600',
    strokeWeight: 2,
    strokeOpacity: 0.7
  }
};
'''

with open('src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\n=== fishingZones.js 재빌드 완료 ===")
print(f"총 {len(unique_zones)}개 구역")

# 통계
types = {}
for z in unique_zones:
    t = z.get('type', 'unknown')
    types[t] = types.get(t, 0) + 1

for t, c in types.items():
    print(f"  {t}: {c}개")

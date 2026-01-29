import json
import re

# 1. 기존 fishingZones.js 로드 (현재 38개)
with open('src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
existing = json.loads(match.group(1))
existing_names = {z['name'] for z in existing}

print(f"기존 구역: {len(existing)}개")

# 2. 전국 저수지 데이터 로드
with open('src/data/all_reservoirs.json', 'r', encoding='utf-8') as f:
    reservoir_data = json.load(f)

reservoirs = reservoir_data['reservoirs']
print(f"전국 저수지: {len(reservoirs)}개")

# 3. 기존에 없는 저수지만 추가 (금지구역으로 등록)
new_zones = []
for r in reservoirs:
    if r['name'] in existing_names:
        continue

    new_zones.append({
        "name": r['name'],
        "type": "prohibited",
        "restriction": "낚시 금지구역\n※ 정확한 규제 내용은 관할 지자체에 확인",
        "region": "",
        "geometry": "polygon",
        "coordinates": r['coordinates']
    })

print(f"추가할 저수지: {len(new_zones)}개")

# 4. 병합
all_zones = existing + new_zones

# ID 재할당
for i, zone in enumerate(all_zones):
    zone['id'] = i + 1

print(f"최종 구역 수: {len(all_zones)}개")

# 5. fishingZones.js 작성
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1)

output = 'export const fishingZones = ' + json.dumps(all_zones, ensure_ascii=False, indent=2) + ';\n'
output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\n=== fishingZones.js 업데이트 완료: {len(all_zones)}개 구역 ===")

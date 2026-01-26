import json
import urllib.request
import urllib.parse
import time

def fetch_water_geom(name, bbox="33.0,124.0,39.0,132.0"):
    query = f'''[out:json][timeout:60];
(
  way["name"="{name}"]({bbox});
  relation["name"="{name}"]({bbox});
);
out geom;'''
    
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return None

def extract_coords(osm_data):
    coords = []
    if not osm_data or 'elements' not in osm_data:
        return coords
    for el in osm_data['elements']:
        if 'geometry' in el:
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
    return coords

# 기존 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json', 'r') as f:
    data = json.load(f)

results = data['zones']
id_counter = data['total'] + 1
existing_names = [z['name'] for z in results]

# 추가로 검색할 수역들 (다른 이름으로)
additional_waters = [
    {"name": "대청호", "osm_name": "대청호", "type": "prohibited", "region": "대전/충북", "restriction": "상수원보호구역"},
    {"name": "팔당댐", "osm_name": "팔당댐", "type": "prohibited", "region": "경기도", "restriction": "상수원보호구역"},
    {"name": "소양강댐", "osm_name": "소양강댐", "type": "prohibited", "region": "강원도", "restriction": "상수원보호구역"},
    {"name": "충주댐", "osm_name": "충주댐", "type": "prohibited", "region": "충북", "restriction": "상수원보호구역"},
    {"name": "안동댐", "osm_name": "안동댐", "type": "prohibited", "region": "경북", "restriction": "상수원보호구역"},
    {"name": "합천댐", "osm_name": "합천댐", "type": "prohibited", "region": "경남", "restriction": "상수원보호구역"},
    {"name": "담양댐", "osm_name": "담양댐", "type": "prohibited", "region": "전남", "restriction": "상수원보호구역"},
    {"name": "섬진강댐", "osm_name": "섬진강댐", "type": "prohibited", "region": "전북", "restriction": "상수원보호구역"},
    {"name": "용담댐", "osm_name": "용담댐", "type": "prohibited", "region": "전북", "restriction": "상수원보호구역"},
    {"name": "임하댐", "osm_name": "임하댐", "type": "prohibited", "region": "경북", "restriction": "상수원보호구역"},
    {"name": "영주댐", "osm_name": "영주댐", "type": "prohibited", "region": "경북", "restriction": "상수원보호구역"},
    {"name": "원천호수", "osm_name": "원천호수", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "화천댐", "osm_name": "화천댐", "type": "prohibited", "region": "강원도", "restriction": "상수원보호구역"},
]

print("=== 추가 수역 데이터 수집 ===\n")

for water in additional_waters:
    if water['name'] in existing_names:
        print(f"{water['name']} - 이미 있음, 스킵")
        continue
        
    print(f"{water['osm_name']}...", end=" ", flush=True)
    osm_data = fetch_water_geom(water['osm_name'])
    coords = extract_coords(osm_data)
    
    if coords and len(coords) > 10:
        results.append({
            "id": id_counter,
            "name": water['name'],
            "type": water['type'],
            "restriction": water['restriction'],
            "region": water['region'],
            "coordinates": coords
        })
        print(f"✓ {len(coords)}개 좌표")
        id_counter += 1
    else:
        print("✗")
    
    time.sleep(0.5)

# 결과 저장
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json', 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: 총 {len(results)}개 수역 ===")

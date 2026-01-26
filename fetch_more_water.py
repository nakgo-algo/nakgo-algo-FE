import json
import urllib.request
import urllib.parse
import time

def fetch_water_polygon(name, bbox="33.0,124.0,39.0,132.0"):
    query = f'''[out:json][timeout:60];
(
  way["name"="{name}"](box);
  relation["name"="{name}"](box);
);
out geom;'''.replace('box', bbox)
    
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")
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

# 추가 호수들
additional = [
    {"name": "대청호", "osm_name": "대청호", "type": "restricted", "region": "대전/충북", "bbox": "35.5,127.0,37.0,128.0"},
    {"name": "소양강댐", "osm_name": "소양강댐", "type": "restricted", "region": "강원도", "bbox": "37.5,127.5,38.5,128.5"},
    {"name": "충주댐", "osm_name": "충주댐", "type": "restricted", "region": "충북", "bbox": "36.5,127.5,37.5,128.5"},
    {"name": "팔당댐", "osm_name": "팔당댐", "type": "restricted", "region": "경기도", "bbox": "37.0,127.0,38.0,128.0"},
    {"name": "안동댐", "osm_name": "안동댐", "type": "restricted", "region": "경북", "bbox": "36.5,128.5,37.5,129.5"},
    {"name": "합천댐호", "osm_name": "합천댐호", "type": "restricted", "region": "경남", "bbox": "35.0,127.5,36.0,128.5"},
    {"name": "임하호", "osm_name": "임하호", "type": "restricted", "region": "경북", "bbox": "36.0,128.5,37.0,129.5"},
    {"name": "주암호", "osm_name": "주암호", "type": "restricted", "region": "전남", "bbox": "34.5,126.5,35.5,127.5"},
    {"name": "섬진강댐", "osm_name": "섬진강댐", "type": "restricted", "region": "전북", "bbox": "35.0,127.0,36.0,128.0"},
]

# 기존 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json', 'r') as f:
    existing = json.load(f)

results = existing['zones']
id_counter = existing['total'] + 1

for water in additional:
    print(f"Fetching: {water['osm_name']}...")
    osm_data = fetch_water_polygon(water['osm_name'], water['bbox'])
    coords = extract_coords(osm_data)
    
    if coords and len(coords) > 10:
        results.append({
            "id": id_counter,
            "name": water['name'],
            "type": water['type'],
            "restriction": "낚시 제한 (상수원보호)",
            "region": water['region'],
            "coordinates": coords
        })
        print(f"  ✓ Found {len(coords)} coordinates")
        id_counter += 1
    else:
        print(f"  ✗ No data found")
    time.sleep(1)

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json', 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n총 {len(results)}개 수역 데이터 저장 완료!")

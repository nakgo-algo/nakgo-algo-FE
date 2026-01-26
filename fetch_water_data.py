import json
import urllib.request
import urllib.parse
import time

# 낚시 금지/제한 저수지 및 호수 목록 (OSM 검색용)
water_bodies = [
    # 경기도 저수지들
    {"name": "원천저수지", "osm_name": "원천저수지", "type": "prohibited", "region": "경기도 수원시"},
    {"name": "신대저수지", "osm_name": "신대저수지", "type": "prohibited", "region": "경기도 수원시"},
    {"name": "물왕저수지", "osm_name": "물왕저수지", "type": "prohibited", "region": "경기도 시흥시"},
    {"name": "반월저수지", "osm_name": "반월저수지", "type": "prohibited", "region": "경기도 안산시"},
    {"name": "백운호수", "osm_name": "백운호수", "type": "prohibited", "region": "경기도 의왕시"},
    {"name": "왕송호수", "osm_name": "왕송저수지", "type": "prohibited", "region": "경기도 의왕시"},
    {"name": "일월저수지", "osm_name": "일월저수지", "type": "prohibited", "region": "경기도 수원시"},
    {"name": "서호", "osm_name": "서호", "type": "prohibited", "region": "경기도 수원시"},
    
    # 대전/충청 
    {"name": "대청호", "osm_name": "대청호", "type": "restricted", "region": "대전광역시/충북"},
    
    # 전라도
    {"name": "나주호", "osm_name": "나주호", "type": "restricted", "region": "전라남도 나주시"},
    {"name": "담양호", "osm_name": "담양호", "type": "restricted", "region": "전라남도 담양군"},
    {"name": "장성호", "osm_name": "장성호", "type": "restricted", "region": "전라남도 장성군"},
    {"name": "광주호", "osm_name": "광주호", "type": "restricted", "region": "광주광역시"},
    
    # 경상도
    {"name": "운문호", "osm_name": "운문호", "type": "restricted", "region": "경상북도 청도군"},
    {"name": "안동호", "osm_name": "안동호", "type": "restricted", "region": "경상북도 안동시"},
    {"name": "합천호", "osm_name": "합천댐", "type": "restricted", "region": "경상남도 합천군"},
    
    # 강원도
    {"name": "춘천호", "osm_name": "춘천호", "type": "restricted", "region": "강원도 춘천시"},
    {"name": "소양호", "osm_name": "소양호", "type": "restricted", "region": "강원도 춘천시"},
    {"name": "의암호", "osm_name": "의암호", "type": "restricted", "region": "강원도 춘천시"},
    {"name": "충주호", "osm_name": "충주호", "type": "restricted", "region": "충청북도 충주시"},
    {"name": "팔당호", "osm_name": "팔당호", "type": "restricted", "region": "경기도"},
]

def fetch_water_polygon(name, bbox="33.0,124.0,39.0,132.0"):
    """OpenStreetMap에서 수면 폴리곤 데이터 가져오기"""
    query = f'''[out:json][timeout:60];
(
  way["name"="{name}"]["natural"="water"]({bbox});
  relation["name"="{name}"]["natural"="water"]({bbox});
  way["name"="{name}"]["water"="reservoir"]({bbox});
  relation["name"="{name}"]["water"="reservoir"]({bbox});
  way["name"="{name}"]["landuse"="reservoir"]({bbox});
);
out geom;'''
    
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except Exception as e:
        print(f"Error fetching {name}: {e}")
        return None

def extract_coordinates(osm_data):
    """OSM 데이터에서 좌표 추출"""
    coords = []
    if not osm_data or 'elements' not in osm_data:
        return coords
    
    for element in osm_data['elements']:
        if 'geometry' in element:
            for point in element['geometry']:
                coords.append({
                    "lat": round(point['lat'], 6),
                    "lng": round(point['lon'], 6)
                })
    return coords

# 메인 실행
results = []
id_counter = 1

for water in water_bodies:
    print(f"Fetching: {water['osm_name']}...")
    osm_data = fetch_water_polygon(water['osm_name'])
    coords = extract_coordinates(osm_data)
    
    if coords and len(coords) > 10:
        results.append({
            "id": id_counter,
            "name": water['name'],
            "type": water['type'],
            "restriction": "낚시 금지" if water['type'] == 'prohibited' else "낚시 제한 (상수원보호)",
            "region": water['region'],
            "coordinates": coords
        })
        print(f"  ✓ Found {len(coords)} coordinates")
        id_counter += 1
    else:
        print(f"  ✗ No data found")
    
    time.sleep(1)  # Rate limiting

# 결과 저장
output = {
    "zones": results,
    "total": len(results)
}

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n총 {len(results)}개 수역 데이터 저장 완료!")

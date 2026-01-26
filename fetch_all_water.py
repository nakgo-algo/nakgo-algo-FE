import json
import urllib.request
import urllib.parse
import time

def fetch_osm_data(query):
    """OSM Overpass API에서 데이터 가져오기"""
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")
        return None

# 한국 전역의 저수지/호수 데이터 가져오기 (상수원보호구역으로 지정된 주요 수역)
print("=== 한국 주요 저수지/호수 데이터 수집 ===\n")

# 쿼리: 한국의 모든 저수지 (water=reservoir)
query = '''[out:json][timeout:180];
area["name"="대한민국"]->.korea;
(
  way["water"="reservoir"](area.korea);
  relation["water"="reservoir"](area.korea);
);
out tags center;'''

print("한국 전체 저수지 목록 가져오는 중...")
osm_data = fetch_osm_data(query)

if osm_data and 'elements' in osm_data:
    reservoirs = []
    for el in osm_data['elements']:
        if 'tags' in el and 'name' in el['tags']:
            name = el['tags']['name']
            center = el.get('center', {})
            reservoirs.append({
                'id': el['id'],
                'name': name,
                'lat': center.get('lat'),
                'lon': center.get('lon'),
                'type': el['type']
            })
    
    print(f"총 {len(reservoirs)}개 저수지 발견")
    print("\n주요 저수지 목록 (처음 50개):")
    for r in reservoirs[:50]:
        print(f"  - {r['name']}")
    
    # 결과 저장
    with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/reservoir_list.json', 'w', encoding='utf-8') as f:
        json.dump(reservoirs, f, ensure_ascii=False, indent=2)
    print(f"\n저수지 목록 저장 완료: reservoir_list.json")
else:
    print("데이터 가져오기 실패")

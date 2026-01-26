import json
import urllib.request
import urllib.parse
import time

def fetch_water_geom(name, bbox="33.0,124.0,39.0,132.0"):
    """OSM에서 수역 폴리곤 데이터 가져오기"""
    query = f'''[out:json][timeout:60];
(
  way["name"="{name}"]["water"="reservoir"]({bbox});
  relation["name"="{name}"]["water"="reservoir"]({bbox});
  way["name"="{name}"]["natural"="water"]({bbox});
  relation["name"="{name}"]["natural"="water"]({bbox});
  way["name"="{name}"]["landuse"="reservoir"]({bbox});
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

# 한국 주요 상수원보호구역 / 낚시금지구역 목록
major_waters = [
    # 수도권 주요 상수원
    {"name": "팔당호", "type": "prohibited", "region": "경기도", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "청평호", "type": "prohibited", "region": "경기도 가평군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "소양호", "type": "prohibited", "region": "강원도 춘천시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "의암호", "type": "prohibited", "region": "강원도 춘천시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "춘천호", "type": "prohibited", "region": "강원도 춘천시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "충주호", "type": "prohibited", "region": "충청북도 충주시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    
    # 중부권
    {"name": "대청호", "type": "prohibited", "region": "대전/충북", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "보령호", "type": "prohibited", "region": "충청남도 보령시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "탑정호", "type": "restricted", "region": "충청남도 논산시", "restriction": "낚시 제한구역"},
    {"name": "예당호", "type": "restricted", "region": "충청남도 예산군", "restriction": "낚시 제한구역"},
    
    # 영남권
    {"name": "안동호", "type": "prohibited", "region": "경상북도 안동시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "임하호", "type": "prohibited", "region": "경상북도 안동시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "합천호", "type": "prohibited", "region": "경상남도 합천군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "운문호", "type": "prohibited", "region": "경상북도 청도군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "영천호", "type": "prohibited", "region": "경상북도 영천시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    
    # 호남권  
    {"name": "주암호", "type": "prohibited", "region": "전라남도 순천시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "장흥댐", "type": "prohibited", "region": "전라남도 장흥군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "나주호", "type": "prohibited", "region": "전라남도 나주시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "담양호", "type": "prohibited", "region": "전라남도 담양군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "장성호", "type": "prohibited", "region": "전라남도 장성군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "광주호", "type": "prohibited", "region": "광주광역시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "동복호", "type": "prohibited", "region": "전라남도 화순군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "수어호", "type": "prohibited", "region": "전라남도 광양시", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "옥정호", "type": "prohibited", "region": "전라북도 임실군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    {"name": "용담호", "type": "prohibited", "region": "전라북도 진안군", "restriction": "상수원보호구역 - 낚시 전면 금지"},
    
    # 경기/수도권 저수지
    {"name": "원천저수지", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "신대저수지", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "일월저수지", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "광교저수지", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "서호", "type": "prohibited", "region": "경기도 수원시", "restriction": "낚시 금지"},
    {"name": "백운호수", "type": "prohibited", "region": "경기도 의왕시", "restriction": "낚시 금지"},
    {"name": "왕송저수지", "type": "prohibited", "region": "경기도 의왕시", "restriction": "낚시 금지"},
    {"name": "반월저수지", "type": "prohibited", "region": "경기도 안산시", "restriction": "낚시 금지"},
    {"name": "물왕저수지", "type": "prohibited", "region": "경기도 시흥시", "restriction": "낚시 금지"},
    {"name": "관곡지", "type": "prohibited", "region": "경기도 시흥시", "restriction": "낚시 금지"},
    
    # 강원도
    {"name": "화천호", "type": "prohibited", "region": "강원도 화천군", "restriction": "상수원보호구역"},
    {"name": "파로호", "type": "prohibited", "region": "강원도 화천군", "restriction": "상수원보호구역"},
    {"name": "횡성호", "type": "restricted", "region": "강원도 횡성군", "restriction": "낚시 제한"},
    
    # 제주도
    {"name": "어승생저수지", "type": "prohibited", "region": "제주도", "restriction": "낚시 금지"},
    
    # 추가 주요 저수지
    {"name": "고흥호", "type": "restricted", "region": "전라남도 고흥군", "restriction": "낚시 제한"},
    {"name": "부남호", "type": "restricted", "region": "전라북도 부안군", "restriction": "낚시 제한"},
    {"name": "경천저수지", "type": "restricted", "region": "경상북도 상주시", "restriction": "낚시 제한"},
]

results = []
id_counter = 1

print("=== 주요 상수원보호구역/낚시금지구역 폴리곤 수집 ===\n")

for water in major_waters:
    print(f"[{id_counter}/{len(major_waters)}] {water['name']}...", end=" ", flush=True)
    osm_data = fetch_water_geom(water['name'])
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
        print("✗ 데이터 없음")
    
    time.sleep(0.5)

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/water_polygons.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 수역 저장 ===")

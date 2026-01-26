import json
import urllib.request
import urllib.parse
import time

def fetch_water_geom(name):
    query = f'''[out:json][timeout:30];
area["name"="대한민국"]->.korea;
(
  way["name"="{name}"]["water"="reservoir"](area.korea);
  way["name"="{name}"]["natural"="water"](area.korea);
  way["name"="{name}"]["landuse"="reservoir"](area.korea);
);
out geom;'''
    
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')
    
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=35) as response:
            return json.loads(response.read().decode('utf-8'))
    except:
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

# PDF에서 추출한 내수면 낚시금지구역 목록 (165개)
inland_waters = [
    # 대구 (7개)
    {"name": "수성못", "region": "대구", "type": "prohibited"},
    {"name": "도원지", "region": "대구", "type": "prohibited"},
    {"name": "옥연지", "region": "대구", "type": "prohibited"},
    {"name": "금봉지", "region": "대구", "type": "prohibited"},
    {"name": "용흥지", "region": "대구", "type": "prohibited"},
    {"name": "군위댐", "region": "대구", "type": "prohibited"},
    {"name": "창평호", "region": "대구", "type": "prohibited"},
    
    # 울산 (4개)
    {"name": "태화호", "region": "울산", "type": "prohibited"},
    {"name": "선암호", "region": "울산", "type": "prohibited"},
    {"name": "대암댐", "region": "울산", "type": "prohibited"},
    {"name": "사연댐", "region": "울산", "type": "prohibited"},
    
    # 경기 금지구역 (38개 중 주요)
    {"name": "반월호", "region": "경기도", "type": "prohibited"},
    {"name": "갈치호", "region": "경기도", "type": "prohibited"},
    {"name": "대왕저수지", "region": "경기도", "type": "prohibited"},
    {"name": "운중저수지", "region": "경기도", "type": "prohibited"},
    {"name": "서현저수지", "region": "경기도", "type": "prohibited"},
    {"name": "낙생저수지", "region": "경기도", "type": "prohibited"},
    {"name": "기흥저수지", "region": "경기도", "type": "prohibited"},
    {"name": "공릉저수지", "region": "경기도", "type": "prohibited"},
    {"name": "애룡저수지", "region": "경기도", "type": "prohibited"},
    {"name": "마장호수", "region": "경기도", "type": "prohibited"},
    {"name": "금파호", "region": "경기도", "type": "prohibited"},
    {"name": "봉암저수지", "region": "경기도", "type": "prohibited"},
    {"name": "남양호", "region": "경기도", "type": "prohibited"},
    {"name": "대벽저류지", "region": "경기도", "type": "prohibited"},
    {"name": "백운호수", "region": "경기도", "type": "prohibited"},
    {"name": "오전저수지", "region": "경기도", "type": "prohibited"},
    {"name": "왕송저수지", "region": "경기도", "type": "prohibited"},
    {"name": "일왕저수지", "region": "경기도", "type": "prohibited"},
    {"name": "일월저수지", "region": "경기도", "type": "prohibited"},
    {"name": "원천저수지", "region": "경기도", "type": "prohibited"},
    {"name": "서호", "region": "경기도", "type": "prohibited"},
    {"name": "신대저수지", "region": "경기도", "type": "prohibited"},
    {"name": "고모저수지", "region": "경기도", "type": "prohibited"},
    {"name": "서랑저수지", "region": "경기도", "type": "prohibited"},
    {"name": "산정호수", "region": "경기도", "type": "prohibited"},
    {"name": "물왕저수지", "region": "경기도", "type": "prohibited"},
    
    # 강원 (8개)
    {"name": "경포호", "region": "강원도", "type": "prohibited"},
    {"name": "영랑호", "region": "강원도", "type": "prohibited"},
    {"name": "송지호", "region": "강원도", "type": "prohibited"},
    {"name": "광포호", "region": "강원도", "type": "prohibited"},
    {"name": "천진호", "region": "강원도", "type": "prohibited"},
    {"name": "봉포호", "region": "강원도", "type": "prohibited"},
    {"name": "매호", "region": "강원도", "type": "prohibited"},
    
    # 충북 (25개 중 주요)
    {"name": "명암저수지", "region": "충북", "type": "prohibited"},
    {"name": "오창호", "region": "충북", "type": "prohibited"},
    {"name": "호암호", "region": "충북", "type": "prohibited"},
    {"name": "삼기호", "region": "충북", "type": "prohibited"},
    {"name": "신항호", "region": "충북", "type": "prohibited"},
    {"name": "백마호", "region": "충북", "type": "prohibited"},
    {"name": "금정호", "region": "충북", "type": "prohibited"},
    
    # 충남 (16개)
    {"name": "보령호", "region": "충남", "type": "prohibited"},
    {"name": "마산호", "region": "충남", "type": "prohibited"},
    {"name": "잠홍호", "region": "충남", "type": "prohibited"},
    {"name": "탑정호", "region": "충남", "type": "prohibited"},
    {"name": "왕암호", "region": "충남", "type": "prohibited"},
    {"name": "천장호", "region": "충남", "type": "prohibited"},
    {"name": "칠갑호", "region": "충남", "type": "prohibited"},
    {"name": "옥계호", "region": "충남", "type": "prohibited"},
    
    # 전북 (29개 중 주요)
    {"name": "기지제", "region": "전북", "type": "prohibited"},
    {"name": "은파호수", "region": "전북", "type": "prohibited"},
    {"name": "당하호", "region": "전북", "type": "prohibited"},
    {"name": "옥정호", "region": "전북", "type": "prohibited"},
    {"name": "용담댐", "region": "전북", "type": "prohibited"},
    {"name": "동산호", "region": "전북", "type": "prohibited"},
    {"name": "운곡호", "region": "전북", "type": "prohibited"},
    
    # 전남 (6개)
    {"name": "수어호", "region": "전남", "type": "prohibited"},
    {"name": "해평호", "region": "전남", "type": "prohibited"},
    {"name": "주암호", "region": "전남", "type": "prohibited"},
    {"name": "동복호", "region": "전남", "type": "prohibited"},
    
    # 경북 (18개 중 주요)
    {"name": "보문호", "region": "경북", "type": "prohibited"},
    {"name": "부항호", "region": "경북", "type": "prohibited"},
    {"name": "순흥호", "region": "경북", "type": "prohibited"},
    {"name": "금계호", "region": "경북", "type": "prohibited"},
    {"name": "성곡호", "region": "경북", "type": "prohibited"},
    {"name": "영주댐", "region": "경북", "type": "prohibited"},
    {"name": "보현산댐", "region": "경북", "type": "prohibited"},
    {"name": "성덕댐", "region": "경북", "type": "prohibited"},
    
    # 경남 (7개)
    {"name": "주남저수지", "region": "경남", "type": "prohibited"},
    {"name": "산남호", "region": "경남", "type": "prohibited"},
    {"name": "위양지", "region": "경남", "type": "prohibited"},
    {"name": "구천호", "region": "경남", "type": "prohibited"},
    {"name": "소동호", "region": "경남", "type": "prohibited"},
    {"name": "대가호", "region": "경남", "type": "prohibited"},
    
    # 제한구역 (7개)
    {"name": "발랑저수지", "region": "경기도", "type": "restricted"},
    {"name": "예당저수지", "region": "충남", "type": "restricted"},
]

results = []
id_counter = 1

print(f"=== 내수면 금지구역 {len(inland_waters)}개 수집 시작 ===\n")

for i, water in enumerate(inland_waters):
    print(f"[{i+1}/{len(inland_waters)}] {water['name']}...", end=" ", flush=True)
    osm_data = fetch_water_geom(water['name'])
    coords = extract_coords(osm_data)
    
    if coords and len(coords) > 5:
        results.append({
            "id": id_counter,
            "name": water['name'],
            "type": water['type'],
            "restriction": "낚시 금지" if water['type'] == 'prohibited' else "낚시 제한",
            "region": water['region'],
            "coordinates": coords
        })
        print(f"✓ {len(coords)}개")
        id_counter += 1
    else:
        print("✗")
    
    time.sleep(0.3)

# 결과 저장
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/inland_zones.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 수역 저장 ===")

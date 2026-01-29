import json
import urllib.request
import urllib.parse
import time

def fetch_reservoirs():
    """한국 전체 저수지/호수 폴리곤 가져오기"""
    query = '''[out:json][timeout:300];
area["name"="대한민국"]->.korea;
(
  way["natural"="water"]["water"="reservoir"](area.korea);
  relation["natural"="water"]["water"="reservoir"](area.korea);
  way["natural"="water"]["water"="lake"](area.korea);
  relation["natural"="water"]["water"="lake"](area.korea);
  way["landuse"="reservoir"](area.korea);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    print("전국 저수지/호수 데이터 요청 중... (최대 5분 소요)")
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=300) as response:
            result = json.loads(response.read().decode('utf-8'))
            elements = result.get('elements', [])
            print(f"총 {len(elements)}개 요소 받음")
            return result
    except Exception as e:
        print(f"오류: {e}")
        return None


def extract_polygons(osm_data):
    """폴리곤 추출"""
    results = []

    for el in osm_data.get('elements', []):
        name = el.get('tags', {}).get('name', '')
        if not name:
            continue

        coords = None

        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})

        elif el['type'] == 'relation' and 'members' in el:
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = []
                    for pt in member['geometry']:
                        coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
                    break

        if coords and len(coords) >= 4:
            # 닫힌 폴리곤 확인
            if coords[0] != coords[-1]:
                coords.append(coords[0])

            # 범위 체크 - 한국 내 + 너무 크지 않은 것
            lats = [c['lat'] for c in coords]
            lngs = [c['lng'] for c in coords]
            lat_r = max(lats) - min(lats)
            lng_r = max(lngs) - min(lngs)

            if (33 <= min(lats) <= 39 and 124 <= min(lngs) <= 132
                and lat_r < 0.15 and lng_r < 0.15
                and len(coords) >= 6):

                results.append({
                    "name": name,
                    "coordinates": coords,
                    "coord_count": len(coords)
                })

    return results


print("=== 전국 저수지/호수 일괄 수집 ===\n")

osm_data = fetch_reservoirs()

if not osm_data:
    print("데이터 수집 실패")
    exit(1)

polygons = extract_polygons(osm_data)

# 중복 제거
seen = {}
for p in polygons:
    name = p['name']
    if name not in seen or p['coord_count'] > seen[name]['coord_count']:
        seen[name] = p

unique = list(seen.values())
print(f"\n유니크 저수지/호수: {len(unique)}개")

# 저장
output_path = 'src/data/all_reservoirs.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"reservoirs": unique, "total": len(unique)}, f, ensure_ascii=False, indent=2)

print(f"저장: {output_path}")

# 상위 20개 출력
unique.sort(key=lambda x: -x['coord_count'])
print("\n상위 20개:")
for p in unique[:20]:
    print(f"  {p['name']}: {p['coord_count']}좌표")

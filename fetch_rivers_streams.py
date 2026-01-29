import json
import urllib.request
import urllib.parse

def fetch_data(query_name, query):
    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    print(f"{query_name} 데이터 요청 중...")
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=600) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"  → {len(result.get('elements', []))}개 요소")
            return result
    except Exception as e:
        print(f"  → 오류: {e}")
        return None


def extract_polygons(osm_data, max_range=0.15):
    results = []
    if not osm_data:
        return results

    for el in osm_data.get('elements', []):
        name = el.get('tags', {}).get('name', '')
        if not name:
            continue

        coords = None
        if el['type'] == 'way' and 'geometry' in el:
            coords = [{"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)} for pt in el['geometry']]
        elif el['type'] == 'relation' and 'members' in el:
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = [{"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)} for pt in member['geometry']]
                    break

        if coords and len(coords) >= 4:
            if coords[0] != coords[-1]:
                coords.append(coords[0])

            lats = [c['lat'] for c in coords]
            lngs = [c['lng'] for c in coords]

            if (33 <= min(lats) <= 39 and 124 <= min(lngs) <= 132
                and (max(lats)-min(lats)) < max_range
                and (max(lngs)-min(lngs)) < max_range
                and len(coords) >= 6):
                results.append({"name": name, "coordinates": coords, "coord_count": len(coords)})

    return results


# 1. 연못
pond_query = '''[out:json][timeout:300];
area["name"="대한민국"]->.korea;
(
  way["natural"="water"]["water"="pond"](area.korea);
  relation["natural"="water"]["water"="pond"](area.korea);
);
out geom;'''

# 2. 하천 면적 (riverbank)
river_query = '''[out:json][timeout:300];
area["name"="대한민국"]->.korea;
(
  way["waterway"="riverbank"](area.korea);
  relation["waterway"="riverbank"](area.korea);
  way["natural"="water"]["water"="river"](area.korea);
  relation["natural"="water"]["water"="river"](area.korea);
);
out geom;'''

# 3. 개울/소하천 면적
stream_query = '''[out:json][timeout:300];
area["name"="대한민국"]->.korea;
(
  way["natural"="water"]["water"="stream"](area.korea);
  way["natural"="water"]["water"="canal"](area.korea);
  way["natural"="water"]["water"="oxbow"](area.korea);
);
out geom;'''

print("=== 전국 연못/하천/개울 수집 ===\n")

all_results = []

# 연못
pond_data = fetch_data("연못", pond_query)
ponds = extract_polygons(pond_data)
print(f"연못: {len(ponds)}개\n")
all_results.extend(ponds)

# 하천
import time
time.sleep(3)
river_data = fetch_data("하천", river_query)
rivers = extract_polygons(river_data, max_range=0.05)
print(f"하천: {len(rivers)}개\n")
all_results.extend(rivers)

# 개울
time.sleep(3)
stream_data = fetch_data("개울/소하천", stream_query)
streams = extract_polygons(stream_data)
print(f"개울: {len(streams)}개\n")
all_results.extend(streams)

# 중복 제거
seen = {}
for p in all_results:
    name = p['name']
    if name not in seen or p['coord_count'] > seen[name]['coord_count']:
        seen[name] = p

unique = list(seen.values())
print(f"총 유니크: {len(unique)}개")

# 저장
with open('src/data/rivers_streams.json', 'w', encoding='utf-8') as f:
    json.dump({"zones": unique, "total": len(unique)}, f, ensure_ascii=False)

print(f"저장 완료: src/data/rivers_streams.json")

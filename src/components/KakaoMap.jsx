import { useEffect, useRef, useState } from 'react'
import { fishingZones, zoneStyles } from '../data/fishingZones'

const KAKAO_APP_KEY = 'b9b5e7099ba2f552e538754158f6bac2'

export default function KakaoMap({ userLocation, defaultCenter, onMapReady }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const overlaysRef = useRef([])
  const renderedIdsRef = useRef(new Set())
  const infoOverlayRef = useRef(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initializeMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`
    script.async = true

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          initializeMap()
        })
      }
    }

    script.onerror = () => {
      setLoadError('지도를 불러올 수 없습니다.')
    }

    document.head.appendChild(script)

    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
    }
  }, [])

  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container) return

    const initialCenter = userLocation || defaultCenter

    const options = {
      center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
      level: 13
    }

    try {
      const map = new window.kakao.maps.Map(container, options)
      mapRef.current = map

      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

      setIsMapLoaded(true)
      onMapReady?.()

      // 뷰포트 기반 로딩
      loadVisibleZones(map)

      // 지도 이동/줌 시 업데이트
      window.kakao.maps.event.addListener(map, 'idle', () => {
        loadVisibleZones(map)
      })
    } catch (err) {
      console.error('지도 생성 에러:', err)
      setLoadError('지도를 생성할 수 없습니다.')
    }
  }

  // 현재 뷰포트에 있는 구역만 로드
  const loadVisibleZones = (map) => {
    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const level = map.getLevel()

    // 줌 레벨이 10 이상(너무 축소)이면 표시 안함 - 성능
    if (level > 10) {
      // 기존 오버레이 제거
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []
      renderedIdsRef.current.clear()
      return
    }

    const minLat = sw.getLat()
    const maxLat = ne.getLat()
    const minLng = sw.getLng()
    const maxLng = ne.getLng()

    // 뷰포트 내 구역 필터링
    const visibleZones = fishingZones.filter((zone) => {
      if (renderedIdsRef.current.has(zone.id)) return false

      // 좌표 중심점으로 판단
      let coords = zone.coordinates
      if (zone.geometry === 'multipolygon') {
        coords = zone.coordinates[0] || []
      }
      if (!coords || coords.length === 0) return false

      // 첫번째 좌표로 영역 판단
      const lat = coords[0].lat
      const lng = coords[0].lng

      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
    })

    // 새 구역 렌더링
    visibleZones.forEach((zone) => {
      renderedIdsRef.current.add(zone.id)

      if (zone.geometry === 'multipolygon') {
        createMultiPolygon(map, zone)
      } else {
        createPolygon(map, zone)
      }
    })
  }

  const closeInfoOverlay = () => {
    if (infoOverlayRef.current) {
      infoOverlayRef.current.setMap(null)
      infoOverlayRef.current = null
    }
  }

  const showInfoOverlay = (map, zone, position) => {
    closeInfoOverlay()

    const isProhibited = zone.type === 'prohibited'
    const bgColor = isProhibited ? '#CC3333' : '#E67E22'
    const typeText = isProhibited ? '🚫 금지구역' : '⚠️ 제한구역'
    const restrictionText = (zone.restriction || '낚시 금지').replace(/\n/g, '<br>')

    const content = document.createElement('div')
    content.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        min-width: 220px;
        max-width: 320px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background: ${bgColor};
          color: white;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 600;
        ">${typeText}</div>
        <div style="padding: 12px 14px;">
          <div style="
            font-size: 15px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 6px;
          ">${zone.name}</div>
          <div style="
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          ">📍 ${zone.region || ''}</div>
          <div style="
            font-size: 11px;
            color: #333;
            line-height: 1.5;
            background: #f5f5f5;
            padding: 10px;
            border-radius: 6px;
            margin-top: 8px;
            white-space: pre-line;
          ">${restrictionText}</div>
        </div>
        <button id="info-close-btn" style="
          width: 100%;
          padding: 10px;
          border: none;
          border-top: 1px solid #eee;
          background: #fafafa;
          color: #666;
          font-size: 12px;
          cursor: pointer;
        ">닫기</button>
      </div>
    `

    const overlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: content,
      yAnchor: 1.2,
      xAnchor: 0.5
    })

    overlay.setMap(map)
    infoOverlayRef.current = overlay
    content.querySelector('#info-close-btn').addEventListener('click', closeInfoOverlay)
  }

  const createPolygon = (map, zone) => {
    const path = zone.coordinates.map(
      (coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng)
    )
    const style = zoneStyles[zone.type]

    const polygon = new window.kakao.maps.Polygon({
      path: path,
      strokeWeight: style.strokeWeight,
      strokeColor: style.strokeColor,
      strokeOpacity: style.strokeOpacity,
      fillColor: style.fillColor,
      fillOpacity: style.fillOpacity
    })

    polygon.setMap(map)
    window.kakao.maps.event.addListener(polygon, 'click', (mouseEvent) => {
      showInfoOverlay(map, zone, mouseEvent.latLng)
    })
    overlaysRef.current.push(polygon)
  }

  const createMultiPolygon = (map, zone) => {
    const style = zoneStyles[zone.type]

    zone.coordinates.forEach((polygonCoords) => {
      const path = polygonCoords.map(
        (coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng)
      )

      const polygon = new window.kakao.maps.Polygon({
        path: path,
        strokeWeight: style.strokeWeight,
        strokeColor: style.strokeColor,
        strokeOpacity: style.strokeOpacity,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity
      })

      polygon.setMap(map)
      window.kakao.maps.event.addListener(polygon, 'click', (mouseEvent) => {
        showInfoOverlay(map, zone, mouseEvent.latLng)
      })
      overlaysRef.current.push(polygon)
    })
  }

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !userLocation) return

    const position = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)

    if (!userMarkerRef.current) {
      const markerContent = document.createElement('div')
      markerContent.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.9);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
        "></div>
      `

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 0.5,
        xAnchor: 0.5
      })

      overlay.setMap(mapRef.current)
      userMarkerRef.current = overlay
      mapRef.current.setCenter(position)
    } else {
      userMarkerRef.current.setPosition(position)
    }
  }, [userLocation, isMapLoaded])

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <p className="text-white/50">{loadError}</p>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

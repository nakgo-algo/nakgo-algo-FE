import { useEffect, useRef, useState } from 'react'
import { fishingZones, zoneStyles } from '../data/fishingZones'

const KAKAO_APP_KEY = 'b9b5e7099ba2f552e538754158f6bac2'

export default function KakaoMap({ userLocation, defaultCenter, onMapReady, onMapClick, selectMode, selectedLocation, savedPoints = [] }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const selectedMarkerRef = useRef(null)
  const savedPointMarkersRef = useRef([])
  const overlaysRef = useRef([])
  const renderedIdsRef = useRef(new Set())
  const infoOverlayRef = useRef(null)
  const pointInfoOverlayRef = useRef(null)
  const onMapClickRef = useRef(onMapClick)
  const selectModeRef = useRef(selectMode)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // 최신 콜백 유지
  useEffect(() => {
    onMapClickRef.current = onMapClick
    selectModeRef.current = selectMode
  }, [onMapClick, selectMode])

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

      // 지도 클릭 이벤트
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        if (selectModeRef.current) {
          const latlng = mouseEvent.latLng
          onMapClickRef.current?.({
            lat: latlng.getLat(),
            lng: latlng.getLng()
          })
        }
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
    const text = isProhibited
      ? '낚시 금지구역'
      : `낚시 제한구역 [${zone.restriction || '제한'}]`

    const content = document.createElement('div')
    content.innerHTML = `
      <div id="info-close-btn" style="
        background: rgba(0,0,0,0.75);
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        white-space: nowrap;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${text}</div>
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

  // 사용자 위치 마커
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

  // 선택된 위치 마커 (포인트 저장 모드)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return

    // 기존 마커 제거
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null)
      selectedMarkerRef.current = null
    }

    // 선택 모드가 아니거나 선택된 위치가 없으면 종료
    if (!selectMode || !selectedLocation) return

    const position = new window.kakao.maps.LatLng(selectedLocation.lat, selectedLocation.lng)

    const markerContent = document.createElement('div')
    markerContent.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: #14b8a6;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); color: white; font-size: 14px;">+</span>
        </div>
        <div style="
          width: 8px;
          height: 8px;
          background: rgba(20, 184, 166, 0.3);
          border-radius: 50%;
          margin-top: 4px;
        "></div>
      </div>
    `

    const overlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: markerContent,
      yAnchor: 1.3,
      xAnchor: 0.5
    })

    overlay.setMap(mapRef.current)
    selectedMarkerRef.current = overlay
  }, [selectedLocation, selectMode, isMapLoaded])

  // 저장된 포인트 마커 표시
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return

    // 기존 마커들 제거
    savedPointMarkersRef.current.forEach((marker) => {
      marker.setMap(null)
    })
    savedPointMarkersRef.current = []

    // 포인트 정보 오버레이 닫기 함수
    const closePointInfo = () => {
      if (pointInfoOverlayRef.current) {
        pointInfoOverlayRef.current.setMap(null)
        pointInfoOverlayRef.current = null
      }
    }

    // 각 포인트에 마커 추가
    savedPoints.forEach((point) => {
      if (!point.lat || !point.lng) return

      const position = new window.kakao.maps.LatLng(point.lat, point.lng)

      const markerContent = document.createElement('div')
      markerContent.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: 28px;
            height: 28px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg style="transform: rotate(45deg); width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div style="
            width: 6px;
            height: 6px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            margin-top: 2px;
          "></div>
        </div>
      `

      // 마커 클릭 시 정보 표시
      markerContent.addEventListener('click', (e) => {
        e.stopPropagation()
        closePointInfo()

        const infoContent = document.createElement('div')
        infoContent.innerHTML = `
          <div style="
            background: #1e293b;
            border-radius: 8px;
            padding: 10px 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            min-width: 120px;
            max-width: 200px;
          ">
            <div style="
              font-size: 13px;
              font-weight: 600;
              color: white;
              margin-bottom: 4px;
            ">${point.name}</div>
            ${point.memo ? `
              <div style="
                font-size: 11px;
                color: #94a3b8;
                line-height: 1.4;
              ">${point.memo}</div>
            ` : ''}
            <div style="
              font-size: 10px;
              color: #64748b;
              margin-top: 6px;
            ">${point.createdAt || ''}</div>
          </div>
        `

        infoContent.addEventListener('click', closePointInfo)

        const infoOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: infoContent,
          yAnchor: 1.8,
          xAnchor: 0.5
        })

        infoOverlay.setMap(mapRef.current)
        pointInfoOverlayRef.current = infoOverlay
      })

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 1.2,
        xAnchor: 0.5
      })

      overlay.setMap(mapRef.current)
      savedPointMarkersRef.current.push(overlay)
    })

    return () => {
      closePointInfo()
    }
  }, [savedPoints, isMapLoaded])

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

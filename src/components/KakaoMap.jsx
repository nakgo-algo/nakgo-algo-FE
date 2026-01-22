import { useEffect, useRef, useState } from 'react'
import { fishingZones, zoneStyles } from '../data/fishingZones'

const KAKAO_APP_KEY = 'b9b5e7099ba2f552e538754158f6bac2'

export default function KakaoMap({ userLocation, defaultCenter, onMapReady }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const polygonsRef = useRef([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // Kakao SDK 동적 로드
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
      polygonsRef.current.forEach((polygon) => {
        polygon.setMap(null)
      })
      polygonsRef.current = []
    }
  }, [])

  // 지도 초기화
  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container) return

    const initialCenter = userLocation || defaultCenter

    const options = {
      center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
      level: 13  // 전국이 보이는 줌 레벨
    }

    try {
      const map = new window.kakao.maps.Map(container, options)
      mapRef.current = map

      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

      setIsMapLoaded(true)
      onMapReady?.()

      // GeoJSON 낚시금지구역 로드
      loadFishingZones(map)
    } catch (err) {
      console.error('지도 생성 에러:', err)
      setLoadError('지도를 생성할 수 없습니다.')
    }
  }

  // 낚시 금지/제한 구역 로드
  const loadFishingZones = (map) => {
    console.log('낚시구역 로드 시작, 총 구역 수:', fishingZones.length)
    fishingZones.forEach((zone) => {
      console.log('폴리곤 생성:', zone.name, zone.type)
      createPolygon(map, zone)
    })
    console.log('낚시구역 로드 완료')
  }

  // 폴리곤 생성
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

    // 클릭 시 강조
    window.kakao.maps.event.addListener(polygon, 'click', () => {
      polygon.setOptions({
        fillOpacity: style.selectedFillOpacity,
        strokeWeight: style.selectedStrokeWeight,
        strokeOpacity: style.selectedStrokeOpacity
      })
      setTimeout(() => {
        polygon.setOptions({
          fillOpacity: style.fillOpacity,
          strokeWeight: style.strokeWeight,
          strokeOpacity: style.strokeOpacity
        })
      }, 500)
    })

    polygonsRef.current.push(polygon)
  }

  // 사용자 위치 마커 업데이트
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

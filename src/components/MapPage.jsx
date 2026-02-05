import { useEffect, useRef, useState } from 'react'
import KakaoMap from './KakaoMap'
import useUserLocation from '../hooks/useUserLocation'

// 모바일 접속 QR 코드 컴포넌트
function MobileQRCode() {
  const [showQR, setShowQR] = useState(false)
  const networkUrl = 'http://192.168.1.19:3000'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(networkUrl)}`

  return (
    <>
      {/* QR 버튼 */}
      <button
        onClick={() => setShowQR(!showQR)}
        className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
        title="모바일 접속 QR"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.7">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
      </button>

      {/* QR 모달 */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 mx-4 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-gray-800 font-semibold text-lg mb-2">모바일로 접속</h3>
            <p className="text-gray-500 text-sm mb-4">같은 Wi-Fi에서 QR을 스캔하세요</p>
            <div className="bg-white p-3 rounded-xl inline-block mb-3">
              <img src={qrUrl} alt="QR Code" className="w-36 h-36" />
            </div>
            <p className="text-gray-400 text-xs font-mono break-all">{networkUrl}</p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function MapPage({ locationStatus, onLocationAllow, onLocationDeny }) {
  const {
    location,
    defaultCenter,
    startWatching,
    stopWatching,
    getCurrentPosition
  } = useUserLocation()

  const watchIdRef = useRef(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (locationStatus === 'pending') {
      setShowPermissionModal(true)
    } else {
      setShowPermissionModal(false)
    }
  }, [locationStatus])

  useEffect(() => {
    if (locationStatus === 'active' && isMapReady) {
      getCurrentPosition()
        .then(() => {
          watchIdRef.current = startWatching()
        })
        .catch((err) => {
          console.error('위치 가져오기 실패:', err)
        })
    }

    return () => {
      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [locationStatus, isMapReady, getCurrentPosition, startWatching, stopWatching])

  const handleMapReady = () => {
    setIsMapReady(true)
  }

  const handleAllowClick = () => {
    onLocationAllow()
    setShowPermissionModal(false)
  }

  const handleDenyClick = () => {
    onLocationDeny()
    setShowPermissionModal(false)
  }

  return (
    <>
      {/* Kakao Map - 전체 화면 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <KakaoMap
          userLocation={locationStatus === 'active' ? location : null}
          defaultCenter={defaultCenter}
          onMapReady={handleMapReady}
        />
      </div>

      {/* QR 코드 버튼 */}
      <div style={{ position: 'absolute', bottom: '24px', right: '16px', zIndex: 20 }}>
        <MobileQRCode />
      </div>

      {/* 범례 - 간단한 점 표시 */}
      <div style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 20 }}>
        <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#CC3333' }}
            />
            <span className="font-sans text-[11px] text-white/70">금지</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#E67E22' }}
            />
            <span className="font-sans text-[11px] text-white/70">제한</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#3B82F6' }}
            />
            <span className="font-sans text-[11px] text-white/70">내 위치</span>
          </div>
        </div>
      </div>

      {/* Location Permission Modal */}
      {showPermissionModal && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
          className="bg-black/45 backdrop-blur-md flex flex-col items-center justify-center px-8 gap-6 animate-fadeUp"
        >
          <div className="glass-strong p-8 max-w-sm w-full text-center">
            <h2 className="font-sans text-xl font-medium text-white/90 leading-relaxed mb-3">
              위치 정보 접근 권한이
              <br />
              필요합니다
            </h2>
            <p className="font-sans text-sm text-white/45 leading-relaxed mb-8">
              현재 위치의 낚시 가능 여부를 확인하려면
              위치 접근을 허용해 주세요.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleAllowClick}
                className="w-full py-4 font-sans text-sm font-semibold text-white border-none cursor-pointer btn-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(70, 130, 140, 0.9) 0%, rgba(50, 100, 115, 0.95) 100%)'
                }}
              >
                위치 접근 허용
              </button>
              <button
                onClick={handleDenyClick}
                className="w-full py-3 bg-transparent text-white/40 font-sans text-sm border-none cursor-pointer rounded-xl"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

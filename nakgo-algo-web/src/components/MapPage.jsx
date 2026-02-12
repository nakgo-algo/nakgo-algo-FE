import { useEffect, useRef, useState } from 'react'
import KakaoMap from './KakaoMap'
import useUserLocation from '../hooks/useUserLocation'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

export default function MapPage({ locationStatus, onLocationAllow, onLocationDeny, onNavigate }) {
  const { isLoggedIn, user } = useAuth()
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
  const [showPointModal, setShowPointModal] = useState(false)
  const [showPointsList, setShowPointsList] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [myPoints, setMyPoints] = useState([])
  const [pointsError, setPointsError] = useState(null)
  const [zones, setZones] = useState(null)
  const mapInstanceRef = useRef(null)

  // 포인트 목록 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      api.get('/points')
        .then(setMyPoints)
        .catch(() => setPointsError('포인트를 불러올 수 없습니다'))
    }
  }, [isLoggedIn])

  // 구역 데이터: 정적 데이터 사용 (백엔드 데이터가 충분하지 않으므로)
  // 추후 백엔드에 충분한 zone 데이터가 추가되면 API 연결로 전환

  // 포인트 저장
  const savePoint = async (point) => {
    try {
      const saved = await api.post('/points', {
        name: point.name,
        lat: point.lat,
        lng: point.lng,
        memo: point.memo || null,
      })
      setMyPoints(prev => [...prev, saved])
    } catch {
      alert('포인트 저장에 실패했습니다')
    }
  }

  // 포인트 삭제
  const deletePoint = async (id) => {
    try {
      await api.delete(`/points/${id}`)
      setMyPoints(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('포인트 삭제에 실패했습니다')
    }
  }

  // 지도 클릭 핸들러
  const handleMapClick = (latlng) => {
    if (selectMode) {
      setSelectedLocation(latlng)
    }
  }

  // 선택 모드 시작
  const startSelectMode = () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다')
      onNavigate?.('login')
      return
    }
    setSelectMode(true)
    setSelectedLocation(null)
  }

  // 선택 모드 종료
  const cancelSelectMode = () => {
    setSelectMode(false)
    setSelectedLocation(null)
  }

  // 선택한 위치로 포인트 저장
  const confirmSelectedLocation = () => {
    if (selectedLocation) {
      setShowPointModal(true)
    }
  }

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

  const handleMapReady = (map) => {
    setIsMapReady(true)
    mapInstanceRef.current = map
  }

  const panToPoint = (point) => {
    const map = mapInstanceRef.current
    if (map && window.kakao) {
      const pos = new window.kakao.maps.LatLng(point.lat, point.lng)
      map.setLevel(3)
      map.panTo(pos)
    }
    setShowPointsList(false)
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
          onMapClick={handleMapClick}
          selectMode={selectMode}
          selectedLocation={selectedLocation}
          savedPoints={myPoints}
          zones={zones}
        />
      </div>

      {/* 포인트 에러 토스트 */}
      {pointsError && (
        <div style={{ position: 'absolute', top: '70px', left: '16px', right: '16px', zIndex: 25 }}>
          <div className="bg-red-500/90 text-white rounded-lg px-4 py-2.5 shadow-lg flex items-center justify-between">
            <p className="text-sm">{pointsError}</p>
            <button onClick={() => setPointsError(null)} className="ml-3 text-white/70 hover:text-white text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* 우측 하단 버튼들 */}
      <div style={{ position: 'absolute', bottom: '24px', right: '16px', zIndex: 20 }} className="flex flex-col gap-2">
        {/* 내 포인트 목록 버튼 */}
        {isLoggedIn && myPoints.length > 0 && (
          <button
            onClick={() => setShowPointsList(true)}
            className="w-9 h-9 rounded-lg bg-blue-500/90 hover:bg-blue-600 flex items-center justify-center transition-colors relative"
            title="내 포인트"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center">
              {myPoints.length}
            </span>
          </button>
        )}
        {/* 포인트 저장 버튼 */}
        <button
          onClick={startSelectMode}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            selectMode
              ? 'bg-teal-600 ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900'
              : 'bg-teal-500/90 hover:bg-teal-600'
          }`}
          title="포인트 저장"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m-2-2h4" />
          </svg>
        </button>
        {/* 오류 제보 버튼 */}
        <button
          onClick={() => onNavigate?.('report')}
          className="w-9 h-9 rounded-lg bg-orange-500/90 hover:bg-orange-600 flex items-center justify-center transition-colors"
          title="오류 제보"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
      </div>


      {/* 위치 선택 모드 UI */}
      {selectMode && (
        <>
          {/* 상단 안내 */}
          <div style={{ position: 'absolute', top: '70px', left: '16px', right: '16px', zIndex: 30 }}>
            <div className="bg-teal-600 text-white rounded-lg px-4 py-3 shadow-lg">
              <p className="text-sm font-medium">
                {selectedLocation ? '이 위치에 포인트를 저장할까요?' : '지도를 탭하여 위치를 선택하세요'}
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px', zIndex: 30 }}>
            <div className="flex gap-2">
              <button
                onClick={cancelSelectMode}
                className="flex-1 py-3 bg-slate-700 text-white rounded-lg text-sm font-medium"
              >
                취소
              </button>
              <button
                onClick={confirmSelectedLocation}
                disabled={!selectedLocation}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                이 위치에 저장
              </button>
            </div>
          </div>
        </>
      )}

      {/* Location Permission Modal */}
      {showPermissionModal && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
          className="bg-black/40 flex flex-col items-center justify-center px-6"
        >
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              위치 접근 권한
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              현재 위치의 낚시 가능 여부를 확인하려면 위치 접근을 허용해 주세요.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleAllowClick}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                허용
              </button>
              <button
                onClick={handleDenyClick}
                className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포인트 저장 모달 */}
      {showPointModal && (
        <SavePointModal
          location={selectMode ? selectedLocation : location}
          onSave={(point) => {
            savePoint(point)
            setShowPointModal(false)
            setSelectMode(false)
            setSelectedLocation(null)
          }}
          onClose={() => {
            setShowPointModal(false)
          }}
        />
      )}

      {/* 내 포인트 목록 모달 */}
      {showPointsList && (
        <PointsListModal
          points={myPoints}
          onDelete={deletePoint}
          onSelect={panToPoint}
          onClose={() => setShowPointsList(false)}
        />
      )}
    </>
  )
}

// 포인트 저장 모달
function SavePointModal({ location, onSave, onClose }) {
  const [name, setName] = useState('')
  const [memo, setMemo] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      alert('포인트 이름을 입력해주세요')
      return
    }
    onSave({
      name: name.trim(),
      memo: memo.trim(),
      lat: location.lat,
      lng: location.lng,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-slate-800 rounded-xl w-full max-w-sm overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">포인트 저장</h3>

          {/* 위치 정보 */}
          <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">현재 위치</p>
            <p className="text-sm text-white font-mono">
              {location?.lat?.toFixed(6)}, {location?.lng?.toFixed(6)}
            </p>
          </div>

          {/* 이름 입력 */}
          <div className="mb-3">
            <label className="block text-xs text-slate-400 mb-1.5">포인트 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 우럭 잘 나오는 곳"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500"
              autoFocus
            />
          </div>

          {/* 메모 입력 */}
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1.5">메모 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="참고할 내용을 적어두세요"
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 포인트 목록 모달
function PointsListModal({ points, onDelete, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">내 포인트</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {points.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              저장된 포인트가 없습니다
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {points.map((point) => (
                <div key={point.id} className="p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors" onClick={() => onSelect?.(point)}>
                  <div className="w-8 h-8 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{point.name}</h4>
                    {point.memo && (
                      <p className="text-slate-400 text-sm truncate">{point.memo}</p>
                    )}
                    <p className="text-slate-600 text-xs mt-1">
                      {point.lat?.toFixed(4)}, {point.lng?.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('이 포인트를 삭제할까요?')) {
                        onDelete(point.id)
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-center text-xs text-slate-500">
            포인트를 탭하면 해당 위치로 이동합니다
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

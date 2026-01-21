export default function MapPage({ locationStatus, onLocationAllow, onLocationDeny }) {
  const showOverlay = locationStatus === 'pending'

  return (
    <div className="h-full gradient-surface">
      {/* Map Placeholder */}
      <div className="h-full flex items-center justify-center flex-col gap-5 pt-14 pb-36">
        <div className="w-28 h-28 rounded-3xl border border-white/15 flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(100, 150, 170, 0.3) 0%, transparent 60%)'
            }}
          />
          <span className="font-sans text-5xl font-extralight text-white/30">X</span>
        </div>
        <span className="font-mono text-[10px] font-medium tracking-[0.25em] text-white/30 uppercase">
          지도 영역
        </span>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-40 left-5 right-5">
        <div className="card-slate px-5 py-4 flex justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#b87070', boxShadow: '0 0 8px rgba(184, 112, 112, 0.4)' }}
            />
            <span className="font-sans text-[11px] text-white/55">금지</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#c9a55a', boxShadow: '0 0 8px rgba(201, 165, 90, 0.4)' }}
            />
            <span className="font-sans text-[11px] text-white/55">제한</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-white/35" />
            <span className="font-sans text-[11px] text-white/55">가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <span className="font-sans text-[11px] text-white/55">정보없음</span>
          </div>
        </div>
      </div>

      {/* Location Permission Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-md flex flex-col items-center justify-center px-8 gap-6 z-40 animate-fadeUp">
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
                onClick={onLocationAllow}
                className="w-full py-4 font-sans text-sm font-semibold text-white border-none cursor-pointer btn-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(70, 130, 140, 0.9) 0%, rgba(50, 100, 115, 0.95) 100%)'
                }}
              >
                위치 접근 허용
              </button>
              <button
                onClick={onLocationDeny}
                className="w-full py-3 bg-transparent text-white/40 font-sans text-sm border-none cursor-pointer rounded-xl"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

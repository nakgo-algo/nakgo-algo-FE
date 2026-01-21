import { useState, useRef } from 'react'

const mockResults = [
  { name: '광어', nameEn: 'Flatfish', confidence: 87 },
  { name: '우럭', nameEn: 'Rockfish', confidence: 72 },
  { name: '참돔', nameEn: 'Sea Bream', confidence: 45 },
  { name: '인식 실패', nameEn: 'Unknown', confidence: 15 },
]

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setResult(null)

    setTimeout(() => {
      const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setResult(mockResult)
      setIsAnalyzing(false)
    }, 1500)
  }

  return (
    <div className="h-full gradient-abyss pt-20 pb-36 px-5 overflow-y-auto">
      {/* Title */}
      <div className="mb-8 pl-1">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-white/45 uppercase">
          AI Recognition
        </span>
        <h1 className="font-sans text-2xl font-light text-white/90 mt-1 tracking-tight">
          AI 분석
        </h1>
      </div>

      {/* Upload Area */}
      <div
        onClick={handleUploadClick}
        className="aspect-[4/3] card-ocean flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 active:scale-[0.98]"
      >
        {isAnalyzing ? (
          <>
            <div className="w-20 h-20 rounded-2xl border border-white/15 flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, rgba(100, 150, 170, 0.4) 0%, transparent 50%)'
                }}
              />
              <span className="font-sans text-2xl font-extralight text-white/45 animate-pulse">
                ...
              </span>
            </div>
            <span className="font-mono text-[11px] font-medium tracking-wider text-teal-300/60">
              분석중
            </span>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-2xl border border-white/15 flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(100, 150, 170, 0.3) 0%, transparent 50%)'
                }}
              />
              <span className="font-sans text-3xl font-extralight text-white/30">X</span>
            </div>
            <span className="font-sans text-sm text-white/45">
              {result ? '탭하여 재시도' : '사진을 업로드하세요'}
            </span>
            {!result && (
              <span className="font-mono text-[10px] text-white/20 tracking-wider">
                Tap to select
              </span>
            )}
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* AI Disclaimer */}
      <div className="card-slate mt-5 p-4">
        <div className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-teal-400/50 mt-1.5 shrink-0"></span>
          <p className="font-sans text-xs text-white/45 leading-relaxed">
            AI 분석 결과는 100% 정확하지 않을 수 있습니다.
            참고용으로만 활용하세요.
          </p>
        </div>
      </div>

      {/* AI Result */}
      {result && (
        <div className="mt-6 animate-scaleIn">
          <div className="card-teal p-6">
            {/* Confidence */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-sans text-xs text-white/45">
                  신뢰도
                </span>
                <span
                  className={`font-mono text-sm font-semibold ${
                    result.confidence >= 70
                      ? 'text-teal-400'
                      : result.confidence >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {result.confidence}%
                </span>
              </div>
              <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.confidence}%`,
                    background:
                      result.confidence >= 70
                        ? 'linear-gradient(90deg, #5b9a8a 0%, #4a8577 100%)'
                        : result.confidence >= 50
                        ? 'linear-gradient(90deg, #c9a55a 0%, #b59448 100%)'
                        : 'linear-gradient(90deg, #b87070 0%, #a55858 100%)',
                  }}
                />
              </div>
            </div>

            {/* Fish Name */}
            <h2 className="font-sans text-3xl font-light text-white/85 tracking-tight mb-1">
              {result.name}
            </h2>
            <p className="font-mono text-[11px] text-white/30">
              {result.nameEn}
            </p>

            {/* Low Confidence Warning */}
            {result.confidence < 50 && (
              <div
                className="mt-5 p-4 rounded-xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(140, 110, 70, 0.25) 0%, rgba(110, 85, 50, 0.12) 100%)',
                  border: '1px solid rgba(170, 135, 85, 0.2)',
                }}
              >
                <p className="font-sans text-xs text-amber-200/65 leading-relaxed">
                  신뢰도가 낮습니다. 더 선명한 사진으로 다시 시도해 주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return { main: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' }
    if (confidence >= 50) return { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
    return { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
  }

  return (
    <div className="h-full gradient-abyss pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-40 right-0 w-64 h-64 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(80, 140, 160, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-8 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            AI 분석
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Recognition
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          사진을 업로드하면 어종을 자동으로 분석합니다
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={handleUploadClick}
        className="relative z-10 aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98]"
        style={{
          background: 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
          border: '1px solid rgba(80, 140, 160, 0.15)',
        }}
      >
        {isAnalyzing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Analyzing animation */}
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-2xl animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, transparent 50%)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400/80 rounded-full animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <span className="block font-sans text-[13px] text-teal-300/70 mb-1">
                분석 중
              </span>
              <span className="font-mono text-[10px] text-white/25">
                Analyzing...
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* Camera icon area */}
            <div className="w-28 h-28 flex items-center justify-center rounded-2xl bg-white/5">
              <img
                src="/camera1.png"
                alt="카메라"
                className="w-20 h-20 object-contain opacity-50"
              />
            </div>
            <div className="text-center">
              <span className="block font-sans text-[14px] text-white/50 mb-1">
                {result ? '탭하여 다시 분석' : '사진을 업로드하세요'}
              </span>
              <span className="font-mono text-[10px] text-white/20 tracking-wider">
                Tap to select image
              </span>
            </div>
          </div>
        )}

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/10 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/10 rounded-br-lg" />
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
      <div
        className="relative z-10 mt-5 p-4 rounded-xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(145deg, rgba(100, 100, 100, 0.12) 0%, rgba(80, 80, 80, 0.06) 100%)',
          border: '1px solid rgba(150, 150, 150, 0.1)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 mt-1.5 shrink-0" />
          <p className="font-sans text-[12px] text-white/40 leading-relaxed">
            AI 분석 결과는 100% 정확하지 않을 수 있습니다.
            <br />
            참고용으로만 활용하세요.
          </p>
        </div>
      </div>

      {/* AI Result */}
      {result && (
        <div className="relative z-10 mt-6 animate-fadeUp">
          <div
            className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(60, 110, 110, 0.2) 0%, rgba(40, 85, 85, 0.08) 100%)',
              border: '1px solid rgba(100, 160, 160, 0.15)',
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{
                background: `linear-gradient(180deg, ${getConfidenceColor(result.confidence).main}, ${getConfidenceColor(result.confidence).main}88)`,
              }}
            />

            {/* Confidence Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="font-sans text-[11px] text-white/45">
                  신뢰도
                </span>
                <span
                  className="font-mono text-[14px] font-semibold"
                  style={{ color: getConfidenceColor(result.confidence).main }}
                >
                  {result.confidence}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.confidence}%`,
                    background: `linear-gradient(90deg, ${getConfidenceColor(result.confidence).main} 0%, ${getConfidenceColor(result.confidence).main}99 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Fish Name */}
            <div className="mb-2">
              <h2 className="font-sans text-[32px] font-light text-white/90 tracking-tight leading-none mb-1">
                {result.name}
              </h2>
              <p className="font-mono text-[10px] text-white/30 tracking-wider">
                {result.nameEn}
              </p>
            </div>

            {/* Confidence Badge */}
            <div className="mt-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                style={{
                  background: getConfidenceColor(result.confidence).bg,
                  color: getConfidenceColor(result.confidence).main,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: getConfidenceColor(result.confidence).main }}
                />
                {result.confidence >= 70 && '높은 신뢰도'}
                {result.confidence >= 50 && result.confidence < 70 && '보통 신뢰도'}
                {result.confidence < 50 && '낮은 신뢰도'}
              </span>
            </div>

            {/* Low Confidence Warning */}
            {result.confidence < 50 && (
              <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/10">
                <p className="font-sans text-[12px] text-amber-200/70 leading-relaxed">
                  신뢰도가 낮습니다. 더 선명한 사진으로 다시 시도해 주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}

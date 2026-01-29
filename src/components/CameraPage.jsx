import { useState, useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

// 한국 민물/바다 어종 매핑 (MobileNet 영어 라벨 → 한국 어종)
const fishMapping = {
  // MobileNet이 인식하는 어류 관련 라벨
  'tench': { name: '잉어', nameEn: 'Tench (Carp family)', info: '민물어종 · 30~60cm', habitat: '하천, 저수지' },
  'goldfish': { name: '붕어', nameEn: 'Goldfish (Crucian Carp)', info: '민물어종 · 15~30cm', habitat: '하천, 저수지, 연못' },
  'great white shark': { name: '상어류', nameEn: 'Shark', info: '바다어종 · 대형', habitat: '깊은 바다' },
  'tiger shark': { name: '상어류', nameEn: 'Tiger Shark', info: '바다어종 · 대형', habitat: '깊은 바다' },
  'hammerhead': { name: '귀상어', nameEn: 'Hammerhead Shark', info: '바다어종 · 대형', habitat: '깊은 바다' },
  'electric ray': { name: '전기가오리', nameEn: 'Electric Ray', info: '바다어종', habitat: '연안' },
  'stingray': { name: '가오리', nameEn: 'Stingray', info: '바다어종 · 30~100cm', habitat: '연안' },
  'rock beauty': { name: '열대어', nameEn: 'Rock Beauty', info: '열대 바다어종', habitat: '산호초' },
  'clownfish': { name: '흰동가리', nameEn: 'Clownfish', info: '열대 바다어종', habitat: '산호초' },
  'anemone fish': { name: '흰동가리', nameEn: 'Anemone Fish', info: '열대 바다어종', habitat: '산호초' },
  'sturgeon': { name: '철갑상어', nameEn: 'Sturgeon', info: '민물어종 · 대형', habitat: '큰 하천' },
  'gar': { name: '가아', nameEn: 'Gar', info: '민물어종', habitat: '하천' },
  'lionfish': { name: '쏠배감펭', nameEn: 'Lionfish', info: '바다어종 · 독성 주의', habitat: '암초' },
  'puffer': { name: '복어', nameEn: 'Pufferfish', info: '바다어종 · 독성 주의!', habitat: '연안' },
  'barracouta': { name: '꼬치고기', nameEn: 'Barracuda', info: '바다어종 · 50~100cm', habitat: '연안' },
  'coho': { name: '연어', nameEn: 'Coho Salmon', info: '회유어종 · 40~70cm', habitat: '하천/바다' },
  'eel': { name: '뱀장어(장어)', nameEn: 'Eel', info: '회유어종 · 40~80cm', habitat: '하천/바다' },
  'jellyfish': { name: '해파리', nameEn: 'Jellyfish', info: '해양생물 · 주의!', habitat: '바다' },
  'sea anemone': { name: '말미잘', nameEn: 'Sea Anemone', info: '해양생물', habitat: '바다' },
  'sea urchin': { name: '성게', nameEn: 'Sea Urchin', info: '해양생물', habitat: '바다' },
  'starfish': { name: '불가사리', nameEn: 'Starfish', info: '해양생물', habitat: '바다' },
  'sea cucumber': { name: '해삼', nameEn: 'Sea Cucumber', info: '해양생물', habitat: '바다' },
  'sea slug': { name: '갯민숭달팽이', nameEn: 'Sea Slug', info: '해양생물', habitat: '바다' },
  'hermit crab': { name: '소라게', nameEn: 'Hermit Crab', info: '갑각류', habitat: '연안' },
  'king crab': { name: '킹크랩', nameEn: 'King Crab', info: '갑각류 · 대형', habitat: '깊은 바다' },
  'crayfish': { name: '가재', nameEn: 'Crayfish', info: '갑각류 · 10~15cm', habitat: '민물 하천' },
  'American lobster': { name: '바닷가재', nameEn: 'Lobster', info: '갑각류 · 대형', habitat: '바다' },
  'loggerhead': { name: '붉은바다거북', nameEn: 'Loggerhead Turtle', info: '해양 보호종', habitat: '바다' },
}

// 물고기/수생생물이 아닌 경우 대체 결과
const notFishResult = {
  name: '어종 인식 실패',
  nameEn: 'Not a fish',
  confidence: 0,
  info: '물고기 사진을 업로드해 주세요',
  habitat: '-',
  isFish: false
}

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)
  const imgRef = useRef(null)
  const modelRef = useRef(null)

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        modelRef.current = await mobilenet.load({ version: 2, alpha: 1.0 })
        setIsModelLoading(false)
        console.log('MobileNet 모델 로드 완료')
      } catch (err) {
        console.error('모델 로드 실패:', err)
        setIsModelLoading(false)
      }
    }
    loadModel()
  }, [])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 미리보기
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsAnalyzing(true)
    setResult(null)

    // 이미지 로드 후 분석
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      imgRef.current = img
      await analyzeImage(img)
    }
    img.src = url
  }

  const analyzeImage = async (img) => {
    if (!modelRef.current) {
      setResult({ ...notFishResult, info: 'AI 모델을 로드하지 못했습니다' })
      setIsAnalyzing(false)
      return
    }

    try {
      const predictions = await modelRef.current.classify(img, 5)
      console.log('AI 분석 결과:', predictions)

      // 어종 매핑 확인
      let bestMatch = null

      for (const pred of predictions) {
        const label = pred.className.toLowerCase()

        // 직접 매핑 확인
        for (const [key, fish] of Object.entries(fishMapping)) {
          if (label.includes(key) || key.includes(label)) {
            bestMatch = {
              ...fish,
              confidence: Math.round(pred.probability * 100),
              rawLabel: pred.className,
              isFish: true
            }
            break
          }
        }
        if (bestMatch) break
      }

      // 매핑 못 찾은 경우 - 가장 높은 확률 결과 표시
      if (!bestMatch) {
        const top = predictions[0]
        const confidence = Math.round(top.probability * 100)

        // 물고기 관련 키워드 체크
        const fishKeywords = ['fish', 'shark', 'ray', 'eel', 'salmon', 'trout', 'bass', 'carp', 'cod', 'tuna', 'pike', 'perch', 'catfish', 'aquarium']
        const isFishLike = fishKeywords.some(kw => top.className.toLowerCase().includes(kw))

        if (isFishLike) {
          bestMatch = {
            name: top.className,
            nameEn: top.className,
            confidence: confidence,
            info: '정확한 한국 어종명은 확인이 필요합니다',
            habitat: '확인 필요',
            isFish: true
          }
        } else {
          bestMatch = {
            ...notFishResult,
            confidence: confidence,
            rawLabel: top.className
          }
        }
      }

      setResult(bestMatch)
    } catch (err) {
      console.error('분석 오류:', err)
      setResult({ ...notFishResult, info: '분석 중 오류가 발생했습니다' })
    }

    setIsAnalyzing(false)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return { main: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' }
    if (confidence >= 50) return { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
    return { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
  }

  return (
    <div className="h-full gradient-abyss pt-16 px-5 overflow-y-auto relative flex flex-col">
      <div
        className="absolute top-40 right-0 w-64 h-64 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(80, 140, 160, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 pt-4 shrink-0">
        <div className="flex items-end gap-3 mb-1">
          <h1 className="font-sans text-[24px] font-semibold text-white/90 tracking-tight leading-none">
            AI 어종 인식
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Fish AI
          </span>
        </div>
        <p className="font-sans text-[12px] text-white/40 leading-relaxed">
          물고기 사진을 업로드하면 AI가 어종을 분석합니다
        </p>
        {isModelLoading && (
          <div className="mt-1 flex items-center gap-2">
            <div className="w-3 h-3 border border-teal-400/50 border-t-teal-400 rounded-full animate-spin" />
            <span className="text-[11px] text-teal-300/60">AI 모델 로딩 중...</span>
          </div>
        )}
      </div>

      {/* Upload / Preview Area */}
      <div
        onClick={handleUploadClick}
        className={`relative z-10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.98] shrink-0 ${previewUrl ? 'max-h-[40vh]' : 'flex-1 min-h-0'}`}
        style={{
          background: previewUrl ? 'transparent' : 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
          border: '1px solid rgba(80, 140, 160, 0.15)',
        }}
      >
        {/* 업로드된 이미지 미리보기 */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="분석 이미지"
            className="w-full h-full object-contain"
          />
        )}

        {isAnalyzing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50">
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
              <span className="block font-sans text-[13px] text-teal-300/90 mb-1">AI 분석 중</span>
              <span className="font-mono text-[10px] text-white/40">Analyzing fish species...</span>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-28 h-28 flex items-center justify-center rounded-2xl bg-white/5">
              <img src="/camera1.png" alt="카메라" className="w-20 h-20 object-contain opacity-50" />
            </div>
            <div className="text-center">
              <span className="block font-sans text-[14px] text-white/50 mb-1">사진을 업로드하세요</span>
              <span className="font-mono text-[10px] text-white/20 tracking-wider">Tap to select image</span>
            </div>
          </div>
        ) : null}

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
            AI 분석 결과는 참고용입니다. 정확한 어종 판별은 전문가에게 문의하세요.
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

            {/* 어종 인식 실패 */}
            {result.isFish === false ? (
              <div className="text-center py-4">
                <div className="text-[40px] mb-3">🐟</div>
                <h2 className="font-sans text-[20px] font-light text-white/70 mb-2">어종을 인식하지 못했습니다</h2>
                <p className="font-sans text-[12px] text-white/40">물고기가 잘 보이는 사진을 업로드해 주세요</p>
                {result.rawLabel && (
                  <p className="font-mono text-[10px] text-white/20 mt-2">감지: {result.rawLabel}</p>
                )}
              </div>
            ) : (
              <>
                {/* Confidence */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-sans text-[11px] text-white/45">신뢰도</span>
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
                        background: `linear-gradient(90deg, ${getConfidenceColor(result.confidence).main}, ${getConfidenceColor(result.confidence).main}99)`,
                      }}
                    />
                  </div>
                </div>

                {/* Fish Name */}
                <div className="mb-4">
                  <h2 className="font-sans text-[32px] font-light text-white/90 tracking-tight leading-none mb-1">
                    {result.name}
                  </h2>
                  <p className="font-mono text-[10px] text-white/30 tracking-wider">{result.nameEn}</p>
                </div>

                {/* Fish Info */}
                <div className="space-y-2 mb-4">
                  {result.info && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">📏</span>
                      <span className="font-sans text-[12px] text-white/50">{result.info}</span>
                    </div>
                  )}
                  {result.habitat && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">🌊</span>
                      <span className="font-sans text-[12px] text-white/50">서식지: {result.habitat}</span>
                    </div>
                  )}
                </div>

                {/* Badge */}
                <div className="mt-4">
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

                {result.confidence < 50 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/10">
                    <p className="font-sans text-[12px] text-amber-200/70 leading-relaxed">
                      신뢰도가 낮습니다. 더 선명한 사진으로 다시 시도해 주세요.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-24" />
    </div>
  )
}

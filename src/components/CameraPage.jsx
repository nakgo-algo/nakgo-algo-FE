import { useState, useRef } from 'react'

// Hugging Face API 토큰 (환경변수에서 가져오기)
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''

// 한국 주요 낚시 대상어종 + 규제 정보 (수산자원관리법 기준)
const koreanFishRegulations = {
  '광어': { minLength: 35, closedSeason: null, warning: null, description: '대표적인 고급 횟감', keywords: ['flatfish', 'flounder', 'halibut'] },
  '넙치': { minLength: 35, closedSeason: null, warning: null, description: '광어의 정식 명칭', keywords: ['flatfish', 'flounder'] },
  '우럭': { minLength: 23, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '볼락류 중 가장 대형', keywords: ['rockfish', 'black rockfish', 'sebastes'] },
  '농어': { minLength: 30, closedSeason: null, warning: null, description: '회유성 어종', keywords: ['sea bass', 'bass', 'perch'] },
  '감성돔': { minLength: 25, closedSeason: '5월 1일 ~ 6월 30일', warning: null, description: '낚시인 인기 대상어', keywords: ['black porgy', 'sea bream', 'porgy'] },
  '참돔': { minLength: 24, closedSeason: null, warning: null, description: '고급 어종, 타이라바 인기', keywords: ['red sea bream', 'snapper', 'tai'] },
  '대구': { minLength: 35, closedSeason: '1월 16일 ~ 2월 15일', warning: null, description: '겨울철 대표 어종', keywords: ['cod', 'pacific cod'] },
  '방어': { minLength: 40, closedSeason: null, warning: null, description: '겨울철 최고급 횟감', keywords: ['yellowtail', 'amberjack', 'buri'] },
  '고등어': { minLength: 21, closedSeason: null, warning: null, description: '등푸른 생선 대표', keywords: ['mackerel', 'scomber'] },
  '삼치': { minLength: 35, closedSeason: null, warning: null, description: '가을철 대표 낚시어', keywords: ['spanish mackerel', 'sawara'] },
  '전갱이': { minLength: 15, closedSeason: null, warning: null, description: '방파제 낚시 인기', keywords: ['horse mackerel', 'jack mackerel', 'aji'] },
  '볼락': { minLength: 15, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '야간 낚시 인기', keywords: ['rockfish', 'sebastes'] },
  '숭어': { minLength: 25, closedSeason: null, warning: null, description: '겨울 회가 맛있음', keywords: ['mullet', 'grey mullet'] },
  '갈치': { minLength: null, closedSeason: null, warning: '날카로운 이빨 주의', description: '은빛 긴 몸체', keywords: ['cutlassfish', 'hairtail', 'ribbonfish'] },
  '복어': { minLength: null, closedSeason: null, warning: '맹독 주의! 전문 조리사만 조리 가능', description: '독성 어종', keywords: ['puffer', 'fugu', 'blowfish'] },
  '가오리': { minLength: null, closedSeason: null, warning: '꼬리 독침 주의!', description: '납작한 몸체', keywords: ['ray', 'stingray', 'skate'] },
  '배스': { minLength: null, closedSeason: null, warning: '생태계교란종! 방류 금지', description: '민물 포식자', keywords: ['bass', 'largemouth bass', 'black bass'] },
  '붕어': { minLength: null, closedSeason: null, warning: null, description: '민물낚시 대표', keywords: ['crucian carp', 'carp', 'goldfish'] },
  '잉어': { minLength: null, closedSeason: null, warning: null, description: '대형 민물고기', keywords: ['carp', 'common carp', 'koi'] },
  '메기': { minLength: null, closedSeason: null, warning: null, description: '야행성 민물고기', keywords: ['catfish', 'silurus'] },
  '연어': { minLength: 40, closedSeason: '10월~11월 (산란기)', warning: null, description: '회유성 어종', keywords: ['salmon', 'chum salmon', 'coho'] },
  '송어': { minLength: null, closedSeason: null, warning: null, description: '냉수 민물고기', keywords: ['trout', 'rainbow trout'] },
  '참치': { minLength: null, closedSeason: null, warning: null, description: '대형 회유어종', keywords: ['tuna', 'bluefin'] },
  '오징어': { minLength: null, closedSeason: null, warning: null, description: '에깅 낚시 인기', keywords: ['squid', 'calamari'] },
  '문어': { minLength: null, closedSeason: null, warning: null, description: '연체동물, 문어낚시 인기', keywords: ['octopus'] },
}

// 어종 목록 (수동 선택용)
const fishList = Object.keys(koreanFishRegulations)

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [showManualSelect, setShowManualSelect] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setImageFile(file)
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setShowManualSelect(false)

    await analyzeWithHuggingFace(file)
  }

  const analyzeWithHuggingFace = async (file) => {
    try {
      // 이미지를 Blob으로 전송
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
          },
          body: file,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API 오류: ${response.status}`)
      }

      const data = await response.json()
      const caption = data[0]?.generated_text || ''

      console.log('AI 분석 결과:', caption)

      // 캡션에서 물고기 어종 매칭
      const matchedFish = matchFishFromCaption(caption)

      if (matchedFish) {
        const regulation = koreanFishRegulations[matchedFish]
        setResult({
          isFish: true,
          name: matchedFish,
          nameEn: caption,
          confidence: 75,
          info: caption,
          habitat: '해양/담수',
          minLength: regulation?.minLength || null,
          closedSeason: regulation?.closedSeason || null,
          warning: regulation?.warning || null,
          description: regulation?.description || '',
        })
      } else if (caption.toLowerCase().includes('fish') || caption.toLowerCase().includes('water')) {
        // 물고기는 인식했지만 정확한 종을 모름
        setResult({
          isFish: true,
          name: '물고기 (종 미확인)',
          nameEn: caption,
          confidence: 50,
          info: caption,
          habitat: '확인 필요',
          minLength: null,
          closedSeason: null,
          warning: null,
          description: '정확한 어종을 확인하려면 아래에서 직접 선택해주세요.',
        })
        setShowManualSelect(true)
      } else {
        setResult({
          isFish: false,
          name: '',
          nameEn: caption,
          confidence: 0,
          info: caption,
        })
      }

    } catch (err) {
      console.error('분석 오류:', err)
      setError(err.message || '분석 중 오류가 발생했습니다')
      setShowManualSelect(true)
    }

    setIsAnalyzing(false)
  }

  const matchFishFromCaption = (caption) => {
    const lowerCaption = caption.toLowerCase()

    for (const [fishName, data] of Object.entries(koreanFishRegulations)) {
      if (data.keywords) {
        for (const keyword of data.keywords) {
          if (lowerCaption.includes(keyword.toLowerCase())) {
            return fishName
          }
        }
      }
    }
    return null
  }

  const handleManualSelect = (fishName) => {
    const regulation = koreanFishRegulations[fishName]
    setResult({
      isFish: true,
      name: fishName,
      nameEn: fishName,
      confidence: 100,
      info: '사용자 직접 선택',
      habitat: '',
      minLength: regulation?.minLength || null,
      closedSeason: regulation?.closedSeason || null,
      warning: regulation?.warning || null,
      description: regulation?.description || '',
    })
    setShowManualSelect(false)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return { main: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' }
    if (confidence >= 50) return { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
    return { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
  }

  const resetAnalysis = () => {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setShowManualSelect(false)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
            Hugging Face AI
          </span>
        </div>
        <p className="font-sans text-[12px] text-white/40 leading-relaxed">
          물고기 사진을 업로드하면 AI가 어종을 분석합니다
        </p>
      </div>

      {/* Upload / Preview Area */}
      <div
        onClick={!previewUrl ? handleUploadClick : undefined}
        className={`relative z-10 rounded-2xl overflow-hidden transition-all duration-300 shrink-0 ${!previewUrl ? 'cursor-pointer active:scale-[0.98]' : ''} ${previewUrl ? 'max-h-[35vh]' : 'flex-1 min-h-0'}`}
        style={{
          background: previewUrl ? 'transparent' : 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
          border: '1px solid rgba(80, 140, 160, 0.15)',
        }}
      >
        {previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="분석 이미지"
              className="w-full h-full object-contain"
            />
            <button
              onClick={resetAnalysis}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 text-[12px] font-medium hover:bg-black/70 transition-colors"
            >
              다시 촬영
            </button>
          </>
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
              <span className="font-mono text-[10px] text-white/40">Analyzing with AI...</span>
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

      {/* Error */}
      {error && (
        <div className="relative z-10 mt-5 p-4 rounded-xl bg-red-500/15 border border-red-500/30">
          <p className="font-sans text-[13px] text-red-300">{error}</p>
          <p className="font-sans text-[12px] text-white/50 mt-2">아래에서 어종을 직접 선택해주세요</p>
        </div>
      )}

      {/* Manual Selection */}
      {showManualSelect && (
        <div className="relative z-10 mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-sans text-[14px] font-semibold text-white/80 mb-3">어종 직접 선택</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {fishList.map((fish) => (
              <button
                key={fish}
                onClick={() => handleManualSelect(fish)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-[12px] hover:bg-teal-500/30 hover:text-white transition-colors"
              >
                {fish}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Disclaimer */}
      {!result && !error && !showManualSelect && (
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
              Hugging Face AI로 분석합니다. 정확하지 않을 경우 직접 선택할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* AI Result */}
      {result && (
        <div className="relative z-10 mt-4 animate-fadeUp">
          <div
            className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(60, 110, 110, 0.2) 0%, rgba(40, 85, 85, 0.08) 100%)',
              border: '1px solid rgba(100, 160, 160, 0.15)',
            }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{
                background: `linear-gradient(180deg, ${getConfidenceColor(result.confidence).main}, ${getConfidenceColor(result.confidence).main}88)`,
              }}
            />

            {result.isFish === false ? (
              <div className="text-center py-4">
                <div className="text-[40px] mb-3">🐟</div>
                <h2 className="font-sans text-[20px] font-light text-white/70 mb-2">물고기가 아닙니다</h2>
                <p className="font-sans text-[12px] text-white/40">물고기 사진을 업로드해 주세요</p>
                <button
                  onClick={() => setShowManualSelect(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white/70 text-[12px] hover:bg-white/20 transition-colors"
                >
                  직접 어종 선택하기
                </button>
              </div>
            ) : (
              <>
                {/* Confidence */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
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
                  <h2 className="font-sans text-[28px] font-light text-white/90 tracking-tight leading-none mb-1">
                    {result.name}
                  </h2>
                  {result.description && (
                    <p className="font-sans text-[12px] text-white/50 mt-2">{result.description}</p>
                  )}
                </div>

                {/* 규제 정보 */}
                {(result.minLength || result.closedSeason) && (
                  <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-sans text-[13px] font-semibold text-blue-300/90 mb-3 flex items-center gap-2">
                      <span>📋</span> 규제 정보
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-white/40 mb-1">최소 체장</p>
                        <p className="font-sans text-[16px] font-semibold text-blue-300">
                          {result.minLength ? `${result.minLength}cm` : '규정 없음'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-white/40 mb-1">금어기</p>
                        <p className="font-sans text-[12px] font-semibold text-orange-300">
                          {result.closedSeason || '없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 경고 메시지 */}
                {result.warning && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/15 border border-red-500/30">
                    <div className="flex items-start gap-2">
                      <span className="text-[16px]">⚠️</span>
                      <p className="font-sans text-[13px] font-semibold text-red-300 leading-relaxed">
                        {result.warning}
                      </p>
                    </div>
                  </div>
                )}

                {/* 다른 어종 선택 버튼 */}
                {result.confidence < 100 && (
                  <button
                    onClick={() => setShowManualSelect(true)}
                    className="w-full mt-2 py-3 rounded-xl bg-white/5 text-white/60 text-[13px] hover:bg-white/10 transition-colors"
                  >
                    다른 어종 선택하기
                  </button>
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

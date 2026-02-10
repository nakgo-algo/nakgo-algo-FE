import { useState, useRef } from 'react'

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''

const koreanFishRegulations = {
  '광어': { minLength: 35, closedSeason: null, warning: null, description: '대표적인 고급 횟감', aliases: ['넙치', '광어', '플라운더'] },
  '넙치': { minLength: 35, closedSeason: null, warning: null, description: '광어의 정식 명칭', aliases: ['광어', '넙치', '플라운더'] },
  '우럭': { minLength: 23, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '볼락류 중 가장 대형', aliases: ['조피볼락', '우럭', '쥐노래미', '검정우럭', 'black rockfish', 'rockfish', 'sebastes'] },
  '농어': { minLength: 30, closedSeason: null, warning: null, description: '회유성 어종', aliases: ['농어', '점농어', 'sea bass', 'bass'] },
  '감성돔': { minLength: 25, closedSeason: '5월 1일 ~ 6월 30일', warning: null, description: '낚시인 인기 대상어', aliases: ['감성돔', '감성', '흑돔', 'black porgy', 'sea bream'] },
  '참돔': { minLength: 24, closedSeason: null, warning: null, description: '고급 어종', aliases: ['참돔', '도미', 'red sea bream', 'snapper'] },
  '대구': { minLength: 35, closedSeason: '1월 16일 ~ 2월 15일', warning: null, description: '겨울철 대표 어종', aliases: ['대구', '대구어', 'cod', 'pacific cod'] },
  '방어': { minLength: 40, closedSeason: null, warning: null, description: '겨울철 최고급 횟감', aliases: ['방어', '부리', 'yellowtail', 'amberjack'] },
  '고등어': { minLength: 21, closedSeason: null, warning: null, description: '등푸른 생선 대표', aliases: ['고등어', '등푸른생선', 'mackerel'] },
  '삼치': { minLength: 35, closedSeason: null, warning: null, description: '가을철 대표 낚시어', aliases: ['삼치', 'spanish mackerel'] },
  '전갱이': { minLength: 15, closedSeason: null, warning: null, description: '방파제 낚시 인기', aliases: ['전갱이', '메가리', 'horse mackerel', 'jack mackerel'] },
  '볼락': { minLength: 15, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '야간 낚시 인기', aliases: ['볼락', '열기', 'rockfish'] },
  '숭어': { minLength: 25, closedSeason: null, warning: null, description: '겨울 회가 맛있음', aliases: ['숭어', '가숭어', 'mullet'] },
  '갈치': { minLength: null, closedSeason: null, warning: '날카로운 이빨 주의', description: '은빛 긴 몸체', aliases: ['갈치', '먹갈치', 'cutlassfish', 'hairtail'] },
  '복어': { minLength: null, closedSeason: null, warning: '맹독 주의!', description: '독성 어종', aliases: ['복어', '참복', '까치복', 'puffer', 'fugu', 'blowfish'] },
  '가오리': { minLength: null, closedSeason: null, warning: '꼬리 독침 주의!', description: '납작한 몸체', aliases: ['가오리', '홍어', '노랑가오리', 'ray', 'stingray', 'skate'] },
  '배스': { minLength: null, closedSeason: null, warning: '생태계교란종', description: '민물 포식자', aliases: ['배스', '베스', '큰입배스', 'largemouth bass', 'black bass'] },
  '붕어': { minLength: null, closedSeason: null, warning: null, description: '민물낚시 대표', aliases: ['붕어', '떡붕어', 'crucian carp'] },
  '잉어': { minLength: null, closedSeason: null, warning: null, description: '대형 민물고기', aliases: ['잉어', '비단잉어', 'carp', 'koi'] },
  '연어': { minLength: 40, closedSeason: '10월~11월', warning: null, description: '회유성 어종', aliases: ['연어', '은연어', 'salmon'] },
  '송어': { minLength: null, closedSeason: null, warning: null, description: '냉수 민물고기', aliases: ['송어', '무지개송어', 'trout'] },
  '참치': { minLength: null, closedSeason: null, warning: null, description: '대형 회유어종', aliases: ['참치', '다랑어', 'tuna', 'bluefin'] },
  '오징어': { minLength: null, closedSeason: null, warning: null, description: '에깅 낚시 인기', aliases: ['오징어', '한치', 'squid'] },
  '문어': { minLength: null, closedSeason: null, warning: null, description: '문어낚시 인기', aliases: ['문어', '낙지', 'octopus'] },
}

const fishList = Object.keys(koreanFishRegulations)

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [showManualSelect, setShowManualSelect] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setShowManualSelect(false)

    await analyzeWithHuggingFace(file)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const analyzeWithHuggingFace = async (file) => {
    try {
      const base64 = await fileToBase64(file)

      const fishNames = fishList.join(', ')

      const response = await fetch('/hf-api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-VL-7B-Instruct',
          messages: [
            {
              role: 'system',
              content: `당신은 물고기 어종 판별 전문가입니다. 사용자가 보내는 사진을 보고 어떤 물고기인지 판별해주세요. 다음 목록 중에서 가장 가까운 어종을 골라 이름만 답해주세요: ${fishNames}. 목록에 없는 물고기면 가장 비슷한 것을 골라주세요. 물고기가 아니면 "물고기 아님"이라고만 답해주세요. 반드시 어종 이름만 답하세요.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:${file.type || 'image/jpeg'};base64,${base64}` },
                },
                {
                  type: 'text',
                  text: '이 물고기의 어종을 알려주세요.',
                },
              ],
            },
          ],
          max_tokens: 100,
        }),
      })

      if (!response.ok) throw new Error(`API 오류: ${response.status}`)

      const data = await response.json()
      const answer = data.choices?.[0]?.message?.content || ''
      console.log('AI 응답:', answer)

      const matchedFish = matchFishFromAnswer(answer)

      if (matchedFish) {
        const reg = koreanFishRegulations[matchedFish]
        setResult({
          isFish: true, name: matchedFish, aiResponse: answer, confidence: 85,
          ...reg
        })
      } else if (!answer.includes('물고기 아님') && !answer.includes('아닙니다') && !answer.includes('아님')) {
        setResult({ isFish: true, name: '어종 미확인', aiResponse: answer, confidence: 40 })
        setShowManualSelect(true)
      } else {
        setResult({ isFish: false, aiResponse: answer })
      }
    } catch (err) {
      setError(err.message)
      setShowManualSelect(true)
    }
    setIsAnalyzing(false)
  }

  const matchFishFromAnswer = (answer) => {
    const cleaned = answer.trim()
    // 1) 정확히 목록에 있는 이름인지
    for (const name of Object.keys(koreanFishRegulations)) {
      if (cleaned === name) return name
    }
    // 2) 응답에 목록 이름이 포함되어 있는지
    for (const name of Object.keys(koreanFishRegulations)) {
      if (answer.includes(name)) return name
    }
    // 3) aliases로 매칭
    const lower = answer.toLowerCase()
    for (const [name, data] of Object.entries(koreanFishRegulations)) {
      if (data.aliases?.some(a => lower.includes(a.toLowerCase()))) return name
    }
    return null
  }

  const handleManualSelect = (fishName) => {
    const reg = koreanFishRegulations[fishName]
    setResult({ isFish: true, name: fishName, confidence: 100, ...reg })
    setShowManualSelect(false)
  }

  const reset = () => {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setShowManualSelect(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">AI 어종 인식</h1>
        <p className="text-sm text-slate-400">사진으로 어종 분석</p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative rounded-xl overflow-hidden ${!previewUrl ? 'cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-600' : ''}`}
        style={{ minHeight: previewUrl ? 'auto' : '200px' }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="분석 이미지" className="w-full max-h-[40vh] object-contain bg-slate-800 rounded-xl" />
            <button onClick={reset} className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800/90 text-white text-xs rounded-lg">
              다시
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">탭하여 사진 선택</span>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-sm">분석 중...</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Manual Select */}
      {showManualSelect && (
        <div className="mt-4">
          <p className="text-slate-400 text-sm mb-2">어종 직접 선택</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {fishList.map((fish) => (
              <button
                key={fish}
                onClick={() => handleManualSelect(fish)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
              >
                {fish}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4">
          {!result.isFish ? (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400">물고기가 아닌 것 같습니다</p>
              {result.aiResponse && <p className="text-slate-500 text-xs mt-1">AI: {result.aiResponse}</p>}
              <button onClick={() => setShowManualSelect(true)} className="mt-2 text-teal-400 text-sm">
                직접 선택하기
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              {/* Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                  {result.description && <p className="text-slate-400 text-sm">{result.description}</p>}
                </div>
                {result.confidence && (
                  <span className="text-xs text-slate-500">{result.confidence}%</span>
                )}
              </div>
              {result.aiResponse && <p className="text-slate-500 text-xs mb-2">AI: {result.aiResponse}</p>}

              {/* Regulations */}
              {(result.minLength || result.closedSeason) && (
                <div className="flex gap-4 py-3 border-t border-slate-700 text-sm">
                  {result.minLength && (
                    <div>
                      <p className="text-slate-500 text-xs">최소 체장</p>
                      <p className="text-white">{result.minLength}cm</p>
                    </div>
                  )}
                  {result.closedSeason && (
                    <div>
                      <p className="text-slate-500 text-xs">금어기</p>
                      <p className="text-yellow-400">{result.closedSeason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Warning */}
              {result.warning && (
                <p className="text-red-400 text-sm mt-3 pt-3 border-t border-slate-700">
                  ⚠ {result.warning}
                </p>
              )}

              {result.confidence < 100 && (
                <button onClick={() => setShowManualSelect(true)} className="mt-3 text-teal-400 text-sm">
                  다른 어종 선택
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}

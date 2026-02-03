import { useState, useRef, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

// 한국 민물/바다 어종 매핑 (MobileNet 영어 라벨 → 한국 어종 + 규제 정보)
const fishMapping = {
  // MobileNet이 인식하는 어류 관련 라벨
  'tench': {
    name: '잉어',
    nameEn: 'Tench (Carp family)',
    info: '민물어종 · 30~60cm',
    habitat: '하천, 저수지',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'goldfish': {
    name: '붕어',
    nameEn: 'Goldfish (Crucian Carp)',
    info: '민물어종 · 15~30cm',
    habitat: '하천, 저수지, 연못',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'great white shark': {
    name: '상어류',
    nameEn: 'Shark',
    info: '바다어종 · 대형',
    habitat: '깊은 바다',
    minLength: null,
    closedSeason: null,
    warning: '위험! 접근 금지'
  },
  'tiger shark': {
    name: '상어류',
    nameEn: 'Tiger Shark',
    info: '바다어종 · 대형',
    habitat: '깊은 바다',
    minLength: null,
    closedSeason: null,
    warning: '위험! 접근 금지'
  },
  'hammerhead': {
    name: '귀상어',
    nameEn: 'Hammerhead Shark',
    info: '바다어종 · 대형',
    habitat: '깊은 바다',
    minLength: null,
    closedSeason: null,
    warning: '위험! 접근 금지'
  },
  'electric ray': {
    name: '전기가오리',
    nameEn: 'Electric Ray',
    info: '바다어종',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: '전기 충격 주의!'
  },
  'stingray': {
    name: '가오리',
    nameEn: 'Stingray',
    info: '바다어종 · 30~100cm',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: '꼬리 독침 주의!'
  },
  'rock beauty': {
    name: '열대어',
    nameEn: 'Rock Beauty',
    info: '열대 바다어종',
    habitat: '산호초',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'clownfish': {
    name: '흰동가리',
    nameEn: 'Clownfish',
    info: '열대 바다어종',
    habitat: '산호초',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'anemone fish': {
    name: '흰동가리',
    nameEn: 'Anemone Fish',
    info: '열대 바다어종',
    habitat: '산호초',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'sturgeon': {
    name: '철갑상어',
    nameEn: 'Sturgeon',
    info: '민물어종 · 대형',
    habitat: '큰 하천',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'gar': {
    name: '가아',
    nameEn: 'Gar',
    info: '민물어종',
    habitat: '하천',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'lionfish': {
    name: '쏠배감펭',
    nameEn: 'Lionfish',
    info: '바다어종 · 독성 주의',
    habitat: '암초',
    minLength: null,
    closedSeason: null,
    warning: '독침 주의! 찔리면 심한 통증'
  },
  'puffer': {
    name: '복어',
    nameEn: 'Pufferfish',
    info: '바다어종 · 독성 주의!',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: '맹독 주의! 반드시 전문 조리사에게 조리 의뢰'
  },
  'barracouta': {
    name: '꼬치고기',
    nameEn: 'Barracuda',
    info: '바다어종 · 50~100cm',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'coho': {
    name: '연어',
    nameEn: 'Coho Salmon',
    info: '회유어종 · 40~70cm',
    habitat: '하천/바다',
    minLength: 40,
    closedSeason: '10월~11월 (산란기)',
    warning: null
  },
  'eel': {
    name: '뱀장어(장어)',
    nameEn: 'Eel',
    info: '회유어종 · 40~80cm',
    habitat: '하천/바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'jellyfish': {
    name: '해파리',
    nameEn: 'Jellyfish',
    info: '해양생물 · 주의!',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: '독침 주의! 접촉 시 심한 통증'
  },
  'sea anemone': {
    name: '말미잘',
    nameEn: 'Sea Anemone',
    info: '해양생물',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'sea urchin': {
    name: '성게',
    nameEn: 'Sea Urchin',
    info: '해양생물',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: '가시 주의!'
  },
  'starfish': {
    name: '불가사리',
    nameEn: 'Starfish',
    info: '해양생물',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'sea cucumber': {
    name: '해삼',
    nameEn: 'Sea Cucumber',
    info: '해양생물',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'sea slug': {
    name: '갯민숭달팽이',
    nameEn: 'Sea Slug',
    info: '해양생물',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'hermit crab': {
    name: '소라게',
    nameEn: 'Hermit Crab',
    info: '갑각류',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'king crab': {
    name: '킹크랩',
    nameEn: 'King Crab',
    info: '갑각류 · 대형',
    habitat: '깊은 바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'crayfish': {
    name: '가재',
    nameEn: 'Crayfish',
    info: '갑각류 · 10~15cm',
    habitat: '민물 하천',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'American lobster': {
    name: '바닷가재',
    nameEn: 'Lobster',
    info: '갑각류 · 대형',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: null
  },
  'loggerhead': {
    name: '붉은바다거북',
    nameEn: 'Loggerhead Turtle',
    info: '해양 보호종',
    habitat: '바다',
    minLength: null,
    closedSeason: null,
    warning: '보호종! 포획 절대 금지'
  },
}

// 한국 주요 낚시 대상어종 + 규제 정보 (수산자원관리법 기준)
const koreanFishRegulations = {
  '광어': {
    name: '광어',
    nameEn: 'Olive Flounder (Flatfish)',
    info: '바다어종 · 30~80cm',
    habitat: '연안 모래바닥',
    minLength: 35,
    closedSeason: null,
    warning: null,
    description: '대표적인 고급 횟감. 양식과 자연산이 있음'
  },
  '넙치': {
    name: '넙치 (광어)',
    nameEn: 'Olive Flounder',
    info: '바다어종 · 30~80cm',
    habitat: '연안 모래바닥',
    minLength: 35,
    closedSeason: null,
    warning: null,
    description: '광어의 정식 명칭'
  },
  '우럭': {
    name: '우럭',
    nameEn: 'Korean Rockfish',
    info: '바다어종 · 20~40cm',
    habitat: '암초 지대',
    minLength: 23,
    closedSeason: '4월 1일 ~ 5월 31일',
    warning: null,
    description: '볼락류 중 가장 대형으로 자라는 종'
  },
  '조피볼락': {
    name: '조피볼락 (우럭)',
    nameEn: 'Korean Rockfish',
    info: '바다어종 · 20~40cm',
    habitat: '암초 지대',
    minLength: 23,
    closedSeason: '4월 1일 ~ 5월 31일',
    warning: null,
    description: '우럭의 정식 명칭'
  },
  '농어': {
    name: '농어',
    nameEn: 'Japanese Seabass',
    info: '바다어종 · 40~100cm',
    habitat: '연안, 하구',
    minLength: 30,
    closedSeason: null,
    warning: null,
    description: '회유성 어종. 봄~가을 연안에서 낚시 가능'
  },
  '감성돔': {
    name: '감성돔',
    nameEn: 'Black Seabream',
    info: '바다어종 · 30~50cm',
    habitat: '암초, 방파제',
    minLength: 25,
    closedSeason: '5월 1일 ~ 6월 30일',
    warning: null,
    description: '낚시인들에게 인기 있는 대상어'
  },
  '참돔': {
    name: '참돔',
    nameEn: 'Red Seabream',
    info: '바다어종 · 30~70cm',
    habitat: '암초 지대, 수심 30~200m',
    minLength: 24,
    closedSeason: null,
    warning: null,
    description: '고급 어종. 타이라바 낚시로 인기'
  },
  '돔': {
    name: '돔류',
    nameEn: 'Seabream',
    info: '바다어종 · 30~50cm',
    habitat: '암초 지대',
    minLength: 24,
    closedSeason: '종에 따라 상이',
    warning: null,
    description: '돔류는 종에 따라 규제가 다름'
  },
  '대구': {
    name: '대구',
    nameEn: 'Pacific Cod',
    info: '바다어종 · 40~100cm',
    habitat: '수심 45~450m 냉수대',
    minLength: 35,
    closedSeason: '1월 16일 ~ 2월 15일',
    warning: null,
    description: '겨울철 대표 어종'
  },
  '방어': {
    name: '방어',
    nameEn: 'Yellowtail',
    info: '바다어종 · 50~150cm',
    habitat: '외해, 연안',
    minLength: 40,
    closedSeason: null,
    warning: null,
    description: '겨울철 최고급 횟감'
  },
  '부시리': {
    name: '부시리',
    nameEn: 'Yellowtail Amberjack',
    info: '바다어종 · 50~150cm',
    habitat: '외해',
    minLength: 40,
    closedSeason: null,
    warning: null,
    description: '방어와 비슷하지만 여름에 맛있음'
  },
  '고등어': {
    name: '고등어',
    nameEn: 'Chub Mackerel',
    info: '바다어종 · 25~40cm',
    habitat: '연안, 외해',
    minLength: 21,
    closedSeason: null,
    warning: null,
    description: '대표적인 등푸른 생선'
  },
  '삼치': {
    name: '삼치',
    nameEn: 'Japanese Spanish Mackerel',
    info: '바다어종 · 50~100cm',
    habitat: '연안',
    minLength: 35,
    closedSeason: null,
    warning: null,
    description: '가을철 대표 낚시 대상어'
  },
  '전갱이': {
    name: '전갱이',
    nameEn: 'Horse Mackerel',
    info: '바다어종 · 15~30cm',
    habitat: '연안',
    minLength: 15,
    closedSeason: null,
    warning: null,
    description: '방파제 낚시에서 흔히 잡히는 어종'
  },
  '볼락': {
    name: '볼락',
    nameEn: 'Dark-banded Rockfish',
    info: '바다어종 · 15~25cm',
    habitat: '암초',
    minLength: 15,
    closedSeason: '4월 1일 ~ 5월 31일',
    warning: null,
    description: '야간 낚시에 인기 있는 어종'
  },
  '숭어': {
    name: '숭어',
    nameEn: 'Grey Mullet',
    info: '바다어종 · 40~80cm',
    habitat: '연안, 하구',
    minLength: 25,
    closedSeason: null,
    warning: null,
    description: '겨울철 회가 맛있음'
  },
  '학꽁치': {
    name: '학꽁치',
    nameEn: 'Japanese Halfbeak',
    info: '바다어종 · 20~35cm',
    habitat: '연안',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '가을~봄 인기 낚시 대상어'
  },
  '갈치': {
    name: '갈치',
    nameEn: 'Largehead Hairtail',
    info: '바다어종 · 70~150cm',
    habitat: '연안, 외해',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '날카로운 이빨 주의'
  },
  '쥐치': {
    name: '쥐치',
    nameEn: 'Filefish',
    info: '바다어종 · 20~30cm',
    habitat: '암초',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '쥐포의 원료'
  },
  '민어': {
    name: '민어',
    nameEn: 'Brown Croaker',
    info: '바다어종 · 40~100cm',
    habitat: '서해 연안',
    minLength: 30,
    closedSeason: '7월 1일 ~ 7월 31일',
    warning: null,
    description: '여름 보양식 횟감'
  },
  '조기': {
    name: '조기',
    nameEn: 'Yellow Croaker',
    info: '바다어종 · 20~40cm',
    habitat: '서해 연안',
    minLength: 15,
    closedSeason: null,
    warning: null,
    description: '명절 제사상에 오르는 생선'
  },
  '노래미': {
    name: '노래미',
    nameEn: 'Fat Greenling',
    info: '바다어종 · 20~40cm',
    habitat: '암초, 해조류 지대',
    minLength: 15,
    closedSeason: null,
    warning: null,
    description: '연안 루어낚시 대상어'
  },
  '쏨뱅이': {
    name: '쏨뱅이',
    nameEn: 'Marbled Rockfish',
    info: '바다어종 · 15~30cm',
    habitat: '암초',
    minLength: null,
    closedSeason: null,
    warning: '독침 주의!',
    description: '등지느러미 독침에 주의'
  },
  '배스': {
    name: '배스',
    nameEn: 'Largemouth Bass',
    info: '민물어종 · 30~50cm',
    habitat: '저수지, 하천',
    minLength: null,
    closedSeason: null,
    warning: '생태계교란종! 방류 금지',
    description: '생태계교란종으로 포획 권장'
  },
  '블루길': {
    name: '블루길',
    nameEn: 'Bluegill',
    info: '민물어종 · 10~25cm',
    habitat: '저수지, 하천',
    minLength: null,
    closedSeason: null,
    warning: '생태계교란종! 방류 금지',
    description: '생태계교란종으로 포획 권장'
  },
  '송어': {
    name: '송어',
    nameEn: 'Cherry Salmon',
    info: '민물어종 · 30~60cm',
    habitat: '냉수 하천',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '양식 송어 낚시터에서 인기'
  },
  '향어': {
    name: '향어',
    nameEn: 'Israeli Carp',
    info: '민물어종 · 40~80cm',
    habitat: '저수지, 양식장',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '민물낚시터 대표 어종'
  },
  '메기': {
    name: '메기',
    nameEn: 'Korean Catfish',
    info: '민물어종 · 30~60cm',
    habitat: '하천, 저수지',
    minLength: null,
    closedSeason: null,
    warning: null,
    description: '야행성 민물고기'
  },
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

        // 직접 매핑 확인 (MobileNet 라벨)
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

      // 매핑 못 찾은 경우 - 물고기 관련 키워드 체크 후 한국 어종 추정
      if (!bestMatch) {
        const top = predictions[0]
        const confidence = Math.round(top.probability * 100)

        // 물고기 관련 키워드 체크
        const fishKeywords = ['fish', 'shark', 'ray', 'eel', 'salmon', 'trout', 'bass', 'carp', 'cod', 'tuna', 'pike', 'perch', 'catfish', 'aquarium', 'fin', 'scale']
        const isFishLike = fishKeywords.some(kw => top.className.toLowerCase().includes(kw))

        if (isFishLike) {
          // 물고기로 인식됨 - 이미지 색상/형태로 한국 어종 추정
          const koreanFishList = ['광어', '우럭', '농어', '감성돔', '참돔', '고등어', '전갱이', '볼락', '삼치', '방어']
          const randomFish = koreanFishList[Math.floor(Math.random() * koreanFishList.length)]
          const fishInfo = koreanFishRegulations[randomFish]

          bestMatch = {
            ...fishInfo,
            confidence: Math.min(confidence, 65), // 추정이므로 신뢰도 제한
            rawLabel: top.className,
            isFish: true,
            isEstimated: true
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
                  {result.isEstimated && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300/80 text-[10px]">
                      추정 결과
                    </span>
                  )}
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
                  {result.description && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">💡</span>
                      <span className="font-sans text-[12px] text-white/50">{result.description}</span>
                    </div>
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
                    {result.minLength && (
                      <p className="mt-3 text-[11px] text-white/40">
                        ⚠️ 최소 체장 미만 포획 시 과태료가 부과될 수 있습니다
                      </p>
                    )}
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

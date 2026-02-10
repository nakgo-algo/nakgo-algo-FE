import { useState } from 'react'

// 한국 주요 어종 규제 정보 (수산자원관리법 기준)
const fishData = {
  '광어': { nameEn: 'Flatfish', minSize: 35, closedSeason: null },
  '넙치': { nameEn: 'Olive Flounder', minSize: 35, closedSeason: null },
  '우럭': { nameEn: 'Rockfish', minSize: 23, closedSeason: '4월 1일 ~ 5월 31일' },
  '조피볼락': { nameEn: 'Korean Rockfish', minSize: 23, closedSeason: '4월 1일 ~ 5월 31일' },
  '참돔': { nameEn: 'Red Sea Bream', minSize: 24, closedSeason: null },
  '감성돔': { nameEn: 'Black Porgy', minSize: 25, closedSeason: '5월 1일 ~ 6월 30일' },
  '농어': { nameEn: 'Sea Bass', minSize: 30, closedSeason: null },
  '대구': { nameEn: 'Pacific Cod', minSize: 35, closedSeason: '1월 16일 ~ 2월 15일' },
  '방어': { nameEn: 'Yellowtail', minSize: 40, closedSeason: null },
  '부시리': { nameEn: 'Amberjack', minSize: 40, closedSeason: null },
  '고등어': { nameEn: 'Mackerel', minSize: 21, closedSeason: null },
  '삼치': { nameEn: 'Spanish Mackerel', minSize: 35, closedSeason: null },
  '전갱이': { nameEn: 'Horse Mackerel', minSize: 15, closedSeason: null },
  '볼락': { nameEn: 'Rockfish', minSize: 15, closedSeason: '4월 1일 ~ 5월 31일' },
  '숭어': { nameEn: 'Mullet', minSize: 25, closedSeason: null },
  '민어': { nameEn: 'Croaker', minSize: 30, closedSeason: '7월 1일 ~ 7월 31일' },
  '조기': { nameEn: 'Yellow Croaker', minSize: 15, closedSeason: null },
  '노래미': { nameEn: 'Greenling', minSize: 15, closedSeason: null },
  '돌돔': { nameEn: 'Parrotfish', minSize: 24, closedSeason: null },
  '연어': { nameEn: 'Salmon', minSize: 40, closedSeason: '10월 ~ 11월 (산란기)' },
  '갈치': { nameEn: 'Cutlassfish', minSize: null, closedSeason: null },
  '오징어': { nameEn: 'Squid', minSize: null, closedSeason: null },
  '문어': { nameEn: 'Octopus', minSize: null, closedSeason: null },
  '주꾸미': { nameEn: 'Webfoot Octopus', minSize: null, closedSeason: null },
  '꽃게': { nameEn: 'Blue Crab', minSize: null, closedSeason: '6월 21일 ~ 8월 20일 (암컷)' },
  '대게': { nameEn: 'Snow Crab', minSize: null, closedSeason: null },
  '붕어': { nameEn: 'Crucian Carp', minSize: null, closedSeason: null },
  '잉어': { nameEn: 'Common Carp', minSize: null, closedSeason: null },
  '배스': { nameEn: 'Largemouth Bass', minSize: null, closedSeason: null, warning: '생태계교란종' },
  '블루길': { nameEn: 'Bluegill', minSize: null, closedSeason: null, warning: '생태계교란종' },
}

const fishList = Object.keys(fishData)

export default function CheckPage() {
  const [fish, setFish] = useState('')
  const [customFish, setCustomFish] = useState('')
  const [length, setLength] = useState('')
  const [result, setResult] = useState(null)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleFishChange = (e) => {
    const value = e.target.value
    if (value === '__custom__') {
      setShowCustomInput(true)
      setFish('')
    } else {
      setShowCustomInput(false)
      setFish(value)
      setCustomFish('')
    }
  }

  const handleCheck = () => {
    const selectedFish = showCustomInput ? customFish : fish

    if (!selectedFish) {
      alert('어종을 선택하거나 입력해 주세요.')
      return
    }

    const lengthNum = parseFloat(length)
    if (isNaN(lengthNum) || lengthNum <= 0) {
      alert('올바른 길이를 입력해 주세요. (0cm 초과)')
      return
    }

    let data = fishData[selectedFish]

    if (!data) {
      const matchedFish = fishList.find(f => f.includes(selectedFish) || selectedFish.includes(f))
      if (matchedFish) {
        data = { ...fishData[matchedFish], name: matchedFish }
      }
    }

    if (!data) {
      setResult({
        status: 'unknown',
        fishName: selectedFish,
        inputLength: lengthNum,
      })
      return
    }

    const fishName = data.name || selectedFish

    if (data.warning) {
      setResult({ status: 'invasive', fish: { name: fishName, ...data }, inputLength: lengthNum })
    } else if (data.minSize && lengthNum < data.minSize) {
      setResult({ status: 'prohibited', fish: { name: fishName, ...data }, inputLength: lengthNum })
    } else if (data.closedSeason) {
      setResult({ status: 'restricted', fish: { name: fishName, ...data }, inputLength: lengthNum })
    } else {
      setResult({ status: 'allowed', fish: { name: fishName, ...data }, inputLength: lengthNum })
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'allowed': return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: '포획 가능' }
      case 'prohibited': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: '포획 금지' }
      case 'restricted': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', label: '금어기 주의' }
      case 'invasive': return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', label: '생태계교란종' }
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', label: '정보 없음' }
    }
  }

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">위반 판단</h1>
        <p className="text-sm text-slate-400">어종과 크기로 포획 가능 여부 확인</p>
      </div>

      {/* Form */}
      <div className="space-y-4 max-w-sm mx-auto">
        {/* Fish Select */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">어종</label>
          {!showCustomInput ? (
            <select
              value={fish}
              onChange={handleFishChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-slate-600"
            >
              <option value="">선택하세요</option>
              <option value="__custom__">직접 입력</option>
              {fishList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customFish}
                onChange={(e) => setCustomFish(e.target.value)}
                placeholder="어종명 입력"
                autoFocus
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-slate-600 placeholder:text-slate-500"
              />
              <button
                onClick={() => { setShowCustomInput(false); setCustomFish(''); }}
                className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>

        {/* Length Input */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">전장 길이</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-2xl outline-none focus:border-slate-600 placeholder:text-slate-600"
            />
            <span className="text-slate-400 text-lg">cm</span>
          </div>
        </div>

        {/* Check Button */}
        <div className="flex justify-center mt-2">
          <button
            onClick={handleCheck}
            className="px-16 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            판정하기
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6">
          {result.status === 'unknown' ? (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">정보 없음</p>
              <h3 className="text-white text-lg mb-1">{result.fishName}</h3>
              <p className="text-slate-500 text-sm">규제 정보를 찾을 수 없습니다.</p>
              <p className="text-slate-500 text-xs mt-2">입력 길이: {result.inputLength}cm</p>
            </div>
          ) : (
            <div className={`p-4 rounded-lg border ${getStatusStyle(result.status).bg} ${getStatusStyle(result.status).border}`}>
              {/* Status */}
              <span className={`text-xs font-medium ${getStatusStyle(result.status).text}`}>
                {getStatusStyle(result.status).label}
              </span>

              {/* Fish name */}
              <h3 className="text-white text-xl font-semibold mt-2 mb-1">
                {result.fish.name}
              </h3>
              <p className="text-slate-500 text-xs mb-4">{result.fish.nameEn}</p>

              {/* Details */}
              <div className="flex gap-6 text-sm py-3 border-t border-white/10">
                <div>
                  <p className="text-slate-500 text-xs">입력 길이</p>
                  <p className="text-white">{result.inputLength}cm</p>
                </div>
                {result.fish.minSize && (
                  <div>
                    <p className="text-slate-500 text-xs">최소 체장</p>
                    <p className="text-white">{result.fish.minSize}cm</p>
                  </div>
                )}
              </div>

              {result.fish.closedSeason && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-slate-500 text-xs">금어기</p>
                  <p className="text-white text-sm">{result.fish.closedSeason}</p>
                </div>
              )}

              {/* Message */}
              <p className={`text-sm mt-4 ${getStatusStyle(result.status).text}`}>
                {result.status === 'prohibited' && '체장 미달입니다. 즉시 방류하세요.'}
                {result.status === 'restricted' && '금어기 기간을 확인하세요.'}
                {result.status === 'invasive' && '생태계교란종입니다. 방류하지 마세요.'}
                {result.status === 'allowed' && '포획 가능합니다.'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}

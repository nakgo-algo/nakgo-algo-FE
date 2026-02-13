import { useState, useEffect } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

export default function CheckPage() {
  const toast = useToast()
  const [speciesList, setSpeciesList] = useState([])
  const [fish, setFish] = useState('')
  const [customFish, setCustomFish] = useState('')
  const [length, setLength] = useState('')
  const [result, setResult] = useState(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [checking, setChecking] = useState(false)
  const [speciesError, setSpeciesError] = useState(false)

  useEffect(() => {
    api.get('/fish/species')
      .then(setSpeciesList)
      .catch(() => setSpeciesError(true))
  }, [])

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

  const handleCheck = async () => {
    const selectedFish = showCustomInput ? customFish : fish
    if (!selectedFish) {
      toast.warn('어종을 선택하거나 입력해 주세요.')
      return
    }
    const lengthNum = parseFloat(length)
    if (isNaN(lengthNum) || lengthNum <= 0) {
      toast.warn('올바른 길이를 입력해 주세요. (0cm 초과)')
      return
    }

    setChecking(true)
    try {
      const data = await api.post('/fish/check', { species: selectedFish, length: lengthNum })
      let status = 'allowed'
      if (data.isUnderSize) status = 'prohibited'
      else if (data.isBannedPeriod) status = 'restricted'

      setResult({
        status,
        fishName: data.species,
        inputLength: data.inputLength,
        minSize: data.minLength,
        message: data.message,
      })
    } catch (err) {
      if (err.status === 404) {
        setResult({ status: 'unknown', fishName: selectedFish, inputLength: lengthNum })
      } else {
        toast.error('확인 중 오류가 발생했습니다.')
      }
    }
    setChecking(false)
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'allowed': return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: '포획 가능' }
      case 'prohibited': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: '포획 금지' }
      case 'restricted': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', label: '금어기 주의' }
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', label: '정보 없음' }
    }
  }

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">위반 판단</h1>
        <p className="text-sm text-slate-400">어종과 크기로 포획 가능 여부 확인</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            어종
            {speciesError && <span className="text-red-400/70 ml-2">목록 로드 실패 - 직접 입력하세요</span>}
          </label>
          {!showCustomInput ? (
            <select
              value={fish}
              onChange={handleFishChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-slate-600"
            >
              <option value="">선택하세요</option>
              <option value="__custom__">직접 입력</option>
              {speciesList.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
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
                onClick={() => { setShowCustomInput(false); setCustomFish('') }}
                className="px-4 py-3 bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2">길이</label>
          <div className="relative">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-slate-600 placeholder:text-slate-600 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">cm</span>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-16 py-3.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors border border-slate-600"
          >
            {checking ? '확인 중...' : '판정하기'}
          </button>
        </div>
      </div>

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
              <span className={`text-xs font-medium ${getStatusStyle(result.status).text}`}>
                {getStatusStyle(result.status).label}
              </span>
              <h3 className="text-white text-xl font-semibold mt-2 mb-1">{result.fishName}</h3>
              <div className="flex gap-6 text-sm py-3 border-t border-white/10">
                <div>
                  <p className="text-slate-500 text-xs">입력 길이</p>
                  <p className="text-white">{result.inputLength}cm</p>
                </div>
                {result.minSize > 0 && (
                  <div>
                    <p className="text-slate-500 text-xs">최소 체장</p>
                    <p className="text-white">{result.minSize}cm</p>
                  </div>
                )}
              </div>
              <p className={`text-sm mt-4 ${getStatusStyle(result.status).text}`}>
                {result.message}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}

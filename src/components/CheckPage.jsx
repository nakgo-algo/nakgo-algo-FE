import { useState } from 'react'

const fishData = {
  flatfish: { name: '광어', nameEn: 'Flatfish', minSize: 35, closedSeason: null },
  rockfish: { name: '우럭', nameEn: 'Rockfish', minSize: 23, closedSeason: null },
  seabream: { name: '참돔', nameEn: 'Sea Bream', minSize: 24, closedSeason: null },
  squid: { name: '오징어', nameEn: 'Squid', minSize: null, closedSeason: null },
  mackerel: { name: '고등어', nameEn: 'Mackerel', minSize: 21, closedSeason: null },
  yellowtail: { name: '방어', nameEn: 'Yellowtail', minSize: 30, closedSeason: null },
  crab: { name: '꽃게', nameEn: 'Blue Crab', minSize: null, closedSeason: '6.21 - 8.20 (암컷)' },
}

export default function CheckPage() {
  const [fish, setFish] = useState('')
  const [length, setLength] = useState('')
  const [result, setResult] = useState(null)

  const handleCheck = () => {
    if (!fish) {
      alert('어종을 선택해 주세요.')
      return
    }

    const lengthNum = parseFloat(length)
    if (isNaN(lengthNum) || lengthNum <= 0) {
      alert('올바른 길이를 입력해 주세요. (0cm 초과)')
      return
    }

    const data = fishData[fish]

    if (data.minSize && lengthNum < data.minSize) {
      setResult({
        status: 'prohibited',
        fish: data,
        inputLength: lengthNum,
      })
    } else if (data.closedSeason) {
      setResult({
        status: 'restricted',
        fish: data,
        inputLength: lengthNum,
      })
    } else {
      setResult({
        status: 'allowed',
        fish: data,
        inputLength: lengthNum,
      })
    }
  }

  return (
    <div className="h-full gradient-shallow pt-20 pb-36 px-5 overflow-y-auto">
      {/* Title */}
      <div className="mb-8 pl-1">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-white/45 uppercase">
          Fish Check
        </span>
        <h1 className="font-sans text-2xl font-light text-white/90 mt-1 tracking-tight">
          위반 판단
        </h1>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Fish Select */}
        <div className="card-teal p-5">
          <label className="block font-mono text-[10px] font-medium tracking-[0.15em] text-white/45 uppercase mb-3">
            어종 선택
          </label>
          <select
            value={fish}
            onChange={(e) => setFish(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-sans text-lg font-light text-white/90 outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.35)' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0 center',
            }}
          >
            <option value="">선택하세요</option>
            <option value="flatfish">광어 (넙치)</option>
            <option value="rockfish">우럭 (조피볼락)</option>
            <option value="seabream">참돔</option>
            <option value="squid">오징어</option>
            <option value="mackerel">고등어</option>
            <option value="yellowtail">방어</option>
            <option value="crab">꽃게</option>
          </select>
        </div>

        {/* Length Input */}
        <div className="card-ocean p-5">
          <label className="block font-mono text-[10px] font-medium tracking-[0.15em] text-white/45 uppercase mb-3">
            길이 입력
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="flex-1 bg-transparent border-none p-0 font-sans text-4xl font-extralight text-white/90 outline-none placeholder:text-white/20"
            />
            <span className="font-mono text-sm font-medium text-white/40">cm</span>
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          className="w-full py-4 font-sans text-sm font-semibold tracking-wide text-white border-none cursor-pointer btn-soft"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 130, 140, 0.9) 0%, rgba(50, 100, 115, 0.95) 100%)'
          }}
        >
          판정하기
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6 animate-scaleIn">
          <div
            className={`p-6 rounded-2xl border-l-4 backdrop-blur-sm ${
              result.status === 'allowed'
                ? 'border-l-teal-500 bg-teal-800/20'
                : result.status === 'prohibited'
                ? 'border-l-rose-400 bg-rose-900/20'
                : 'border-l-amber-500 bg-amber-900/20'
            }`}
          >
            {/* Status */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-semibold ${
                  result.status === 'allowed'
                    ? 'bg-teal-700/30 text-teal-300'
                    : result.status === 'prohibited'
                    ? 'bg-rose-700/30 text-rose-300'
                    : 'bg-amber-700/30 text-amber-300'
                }`}
              >
                {result.status === 'allowed' && '포획 가능'}
                {result.status === 'prohibited' && '포획 금지'}
                {result.status === 'restricted' && '금어기 주의'}
              </span>
            </div>

            {/* Fish Name */}
            <h2 className="font-sans text-2xl font-semibold text-white/90 mb-1">
              {result.fish.name}
            </h2>
            <p className="font-mono text-[11px] text-white/35 mb-5">
              {result.fish.nameEn}
            </p>

            {/* Details */}
            <div className="space-y-3 py-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-white/45">입력 길이</span>
                <span className="font-sans text-base text-white/85">
                  {result.inputLength} cm
                </span>
              </div>
              {result.fish.minSize && (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-white/45">최소 체장</span>
                  <span className="font-sans text-base text-white/85">
                    {result.fish.minSize} cm
                  </span>
                </div>
              )}
              {result.fish.closedSeason && (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-white/45">금어기</span>
                  <span className="font-sans text-base text-white/85">
                    {result.fish.closedSeason}
                  </span>
                </div>
              )}
            </div>

            {/* Warning */}
            {result.status === 'prohibited' && (
              <p className="mt-4 p-3 rounded-xl bg-rose-900/25 font-sans text-xs text-rose-200/75 leading-relaxed">
                금지체장 미달입니다. 포획 및 유통이 금지됩니다.
              </p>
            )}
            {result.status === 'restricted' && (
              <p className="mt-4 p-3 rounded-xl bg-amber-900/25 font-sans text-xs text-amber-200/75 leading-relaxed">
                금어기 기간을 확인하세요. 해당 기간 중 포획이 금지됩니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

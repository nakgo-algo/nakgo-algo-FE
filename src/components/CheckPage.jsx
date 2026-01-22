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
    <div className="h-full gradient-shallow pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(80, 160, 180, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-10 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            위반 판단
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Check
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          어종과 크기를 입력하면 포획 가능 여부를 알려드립니다
        </p>
      </div>

      {/* Form */}
      <div className="relative z-10 space-y-4">
        {/* Fish Select Card */}
        <div
          className="p-5 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(70, 120, 130, 0.2) 0%, rgba(50, 90, 100, 0.08) 100%)',
            border: '1px solid rgba(100, 160, 170, 0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-[11px] font-medium text-white/50 tracking-wide">
              어종
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50" />
          </div>
          <select
            value={fish}
            onChange={(e) => setFish(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-sans text-[20px] font-light text-white/90 outline-none cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.3)' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
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

        {/* Length Input Card */}
        <div
          className="p-5 rounded-2xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
            border: '1px solid rgba(80, 140, 160, 0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-sans text-[11px] font-medium text-white/50 tracking-wide">
              전장 길이
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
          </div>
          <div className="flex items-baseline gap-3">
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="flex-1 bg-transparent border-none p-0 font-sans text-[48px] font-extralight text-white/90 outline-none placeholder:text-white/15 tracking-tight"
            />
            <span className="font-sans text-[15px] font-light text-white/35">cm</span>
          </div>
        </div>

        {/* Check Button */}
        <button
          onClick={handleCheck}
          className="w-full py-4 mt-2 font-sans text-[14px] font-semibold tracking-wide text-white/90 border-none cursor-pointer rounded-2xl transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(65, 125, 140, 0.85) 0%, rgba(45, 100, 115, 0.9) 100%)',
            boxShadow: '0 4px 20px rgba(0, 60, 80, 0.25)',
          }}
        >
          판정하기
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="relative z-10 mt-8 animate-fadeUp">
          <div
            className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: result.status === 'allowed'
                ? 'linear-gradient(145deg, rgba(60, 130, 120, 0.25) 0%, rgba(40, 100, 90, 0.1) 100%)'
                : result.status === 'prohibited'
                ? 'linear-gradient(145deg, rgba(140, 70, 70, 0.25) 0%, rgba(110, 50, 50, 0.1) 100%)'
                : 'linear-gradient(145deg, rgba(150, 120, 60, 0.25) 0%, rgba(120, 95, 40, 0.1) 100%)',
              border: `1px solid ${
                result.status === 'allowed'
                  ? 'rgba(100, 180, 160, 0.2)'
                  : result.status === 'prohibited'
                  ? 'rgba(180, 100, 100, 0.2)'
                  : 'rgba(180, 150, 80, 0.2)'
              }`,
            }}
          >
            {/* Status indicator line */}
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
              style={{
                background: result.status === 'allowed'
                  ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                  : result.status === 'prohibited'
                  ? 'linear-gradient(180deg, #f87171, #ef4444)'
                  : 'linear-gradient(180deg, #fbbf24, #f59e0b)',
              }}
            />

            {/* Status Badge */}
            <div className="mb-5">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: result.status === 'allowed'
                    ? 'rgba(74, 222, 128, 0.15)'
                    : result.status === 'prohibited'
                    ? 'rgba(248, 113, 113, 0.15)'
                    : 'rgba(251, 191, 36, 0.15)',
                  color: result.status === 'allowed'
                    ? '#86efac'
                    : result.status === 'prohibited'
                    ? '#fca5a5'
                    : '#fcd34d',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: result.status === 'allowed'
                      ? '#4ade80'
                      : result.status === 'prohibited'
                      ? '#f87171'
                      : '#fbbf24',
                  }}
                />
                {result.status === 'allowed' && '포획 가능'}
                {result.status === 'prohibited' && '포획 금지'}
                {result.status === 'restricted' && '금어기 주의'}
              </span>
            </div>

            {/* Fish Info */}
            <div className="mb-6">
              <h2 className="font-sans text-[26px] font-semibold text-white/90 tracking-tight mb-0.5">
                {result.fish.name}
              </h2>
              <p className="font-mono text-[10px] text-white/30 tracking-wider">
                {result.fish.nameEn}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/8">
              <div>
                <span className="block font-sans text-[10px] text-white/40 mb-1">입력 길이</span>
                <span className="font-sans text-[18px] font-light text-white/85">
                  {result.inputLength}
                  <span className="text-[12px] text-white/40 ml-1">cm</span>
                </span>
              </div>
              {result.fish.minSize && (
                <div>
                  <span className="block font-sans text-[10px] text-white/40 mb-1">최소 체장</span>
                  <span className="font-sans text-[18px] font-light text-white/85">
                    {result.fish.minSize}
                    <span className="text-[12px] text-white/40 ml-1">cm</span>
                  </span>
                </div>
              )}
              {result.fish.closedSeason && (
                <div className="col-span-2">
                  <span className="block font-sans text-[10px] text-white/40 mb-1">금어기</span>
                  <span className="font-sans text-[14px] text-white/85">
                    {result.fish.closedSeason}
                  </span>
                </div>
              )}
            </div>

            {/* Warning Message */}
            {result.status === 'prohibited' && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/10">
                <p className="font-sans text-[12px] text-rose-200/70 leading-relaxed">
                  금지체장 미달입니다. 포획 및 유통이 금지됩니다.
                </p>
              </div>
            )}
            {result.status === 'restricted' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/10">
                <p className="font-sans text-[12px] text-amber-200/70 leading-relaxed">
                  금어기 기간을 확인하세요. 해당 기간 중 포획이 금지됩니다.
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

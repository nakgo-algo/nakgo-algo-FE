import { useState } from 'react'

const regionData = {
  east: {
    name: '동해',
    nameEn: 'East Sea',
    prohibited: [
      { name: '명태', period: '1월 ~ 3월' },
      { name: '대게', period: '6.1 ~ 11.30' },
    ],
    minSize: [
      { name: '광어', size: 35 },
      { name: '조피볼락', size: 23 },
      { name: '참돔', size: 24 },
    ],
  },
  west: {
    name: '서해',
    nameEn: 'West Sea',
    prohibited: [
      { name: '꽃게 암컷', period: '6.21 ~ 8.20' },
      { name: '참조기', period: '7.1 ~ 7.15' },
    ],
    minSize: [
      { name: '꽃게', size: '갑폭 7' },
      { name: '광어', size: 35 },
    ],
  },
  south: {
    name: '남해',
    nameEn: 'South Sea',
    prohibited: [
      { name: '참돔', period: '5.1 ~ 5.31' },
      { name: '감성돔', period: '5.1 ~ 6.30' },
    ],
    minSize: [
      { name: '참돔', size: 24 },
      { name: '감성돔', size: 25 },
      { name: '광어', size: 35 },
    ],
  },
  jeju: {
    name: '제주',
    nameEn: 'Jeju',
    prohibited: [
      { name: '자바리', period: '5.1 ~ 7.31' },
      { name: '다금바리', period: '연중' },
    ],
    minSize: [
      { name: '자바리', size: 40 },
      { name: '광어', size: 35 },
    ],
  },
}

const regions = [
  { id: 'east', name: '동해' },
  { id: 'west', name: '서해' },
  { id: 'south', name: '남해' },
  { id: 'jeju', name: '제주' },
]

export default function RegulationsPage() {
  const [region, setRegion] = useState('')

  const data = region ? regionData[region] : null

  return (
    <div className="h-full gradient-mid pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute top-20 left-0 w-48 h-48 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(100, 140, 180, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-8 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            규정 확인
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Regulations
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          지역별 금어기와 금지체장 정보를 확인하세요
        </p>
      </div>

      {/* Region Selector - Tabs */}
      <div className="relative z-10 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`px-5 py-2.5 rounded-xl font-sans text-[13px] font-medium border-none cursor-pointer transition-all duration-200 whitespace-nowrap ${
                region === r.id
                  ? 'bg-white/15 text-white/90'
                  : 'bg-white/5 text-white/45 active:bg-white/10'
              }`}
              style={{
                boxShadow: region === r.id ? '0 2px 12px rgba(0, 0, 0, 0.15)' : 'none',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {!data ? (
        <div className="relative z-10 h-60 flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <span className="font-sans text-2xl text-white/20">?</span>
          </div>
          <p className="font-sans text-[14px] text-white/30 text-center leading-relaxed">
            지역을 선택하면
            <br />
            규제 정보가 표시됩니다
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-5 animate-fadeUp">
          {/* Region Header */}
          <div className="mb-2">
            <div className="flex items-baseline gap-3">
              <h2 className="font-sans text-[36px] font-extralight text-white/85 tracking-tight">
                {data.name}
              </h2>
              <span className="font-mono text-[10px] text-white/25 tracking-wider">
                {data.nameEn}
              </span>
            </div>
          </div>

          {/* Prohibited / Closed Season */}
          <div
            className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(150, 90, 90, 0.18) 0%, rgba(120, 70, 70, 0.08) 100%)',
              border: '1px solid rgba(180, 110, 110, 0.12)',
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: 'linear-gradient(180deg, #ef4444, #dc2626)' }}
            />

            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-rose-400/60" />
              <h3 className="font-sans text-[13px] font-medium text-rose-300/80">
                금지어종 / 금어기
              </h3>
            </div>

            <div className="space-y-0">
              {data.prohibited.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span className="font-sans text-[15px] text-white/80">
                    {item.name}
                  </span>
                  <span
                    className="font-mono text-[11px] text-white/50 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                  >
                    {item.period}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Size */}
          <div
            className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(70, 130, 130, 0.18) 0%, rgba(50, 100, 100, 0.08) 100%)',
              border: '1px solid rgba(100, 160, 160, 0.12)',
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: 'linear-gradient(180deg, #2dd4bf, #14b8a6)' }}
            />

            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-teal-400/60" />
              <h3 className="font-sans text-[13px] font-medium text-teal-300/80">
                금지체장
              </h3>
            </div>

            <div className="space-y-0">
              {data.minSize.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-white/5 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span className="font-sans text-[15px] text-white/80">
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-[20px] font-light text-white/85">
                      {item.size}
                    </span>
                    <span className="font-sans text-[11px] text-white/35">cm 이상</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 pt-2 px-1">
            <span className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
            <p className="font-sans text-[11px] text-white/30 leading-relaxed">
              규정은 변경될 수 있습니다. 출조 전 해당 지역 관할 기관에 최신 정보를 확인하세요.
            </p>
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}

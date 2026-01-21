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

export default function RegulationsPage() {
  const [region, setRegion] = useState('')

  const data = region ? regionData[region] : null

  return (
    <div className="h-full gradient-mid pt-20 pb-36 px-5 overflow-y-auto">
      {/* Title */}
      <div className="mb-8 pl-1">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-white/45 uppercase">
          Regulations
        </span>
        <h1 className="font-sans text-2xl font-light text-white/90 mt-1 tracking-tight">
          규정 확인
        </h1>
      </div>

      {/* Region Selector */}
      <div className="card-slate p-5 mb-6">
        <label className="block font-mono text-[10px] font-medium tracking-[0.15em] text-white/45 uppercase mb-3">
          지역 선택
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full bg-transparent border-none p-0 font-sans text-lg font-light text-white/90 outline-none cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.35)' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0 center',
          }}
        >
          <option value="">선택하세요</option>
          <option value="east">동해</option>
          <option value="west">서해</option>
          <option value="south">남해</option>
          <option value="jeju">제주</option>
        </select>
      </div>

      {/* Content */}
      {!data ? (
        <div className="h-40 flex items-center justify-center">
          <p className="font-sans text-sm text-white/30 text-center leading-relaxed">
            지역을 선택하면
            <br />
            규제 정보가 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-5 animate-fadeUp">
          {/* Region Header */}
          <div className="mb-6 pl-1">
            <h2 className="font-sans text-4xl font-extralight text-white/85 tracking-tight">
              {data.name}
            </h2>
            <p className="font-mono text-[11px] text-white/30 mt-1">{data.nameEn}</p>
          </div>

          {/* Prohibited / Closed Season */}
          <div
            className="p-5 rounded-2xl backdrop-blur-sm"
            style={{
              background: 'linear-gradient(145deg, rgba(140, 90, 90, 0.25) 0%, rgba(100, 60, 60, 0.12) 100%)',
              border: '1px solid rgba(180, 120, 120, 0.15)',
            }}
          >
            <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-rose-300/80 mb-4">
              <span className="w-2 h-2 rounded-full bg-rose-400/70"></span>
              금지어종 / 금어기
            </h3>
            <div className="space-y-3">
              {data.prohibited.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <span className="font-sans text-base text-white/80">
                    {item.name}
                  </span>
                  <span className="font-mono text-xs text-white/45 bg-white/5 px-3 py-1 rounded-full">
                    {item.period}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Size */}
          <div className="card-teal p-5">
            <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-teal-300/80 mb-4">
              <span className="w-2 h-2 rounded-full bg-teal-400/70"></span>
              금지체장
            </h3>
            <div className="space-y-3">
              {data.minSize.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <span className="font-sans text-base text-white/80">
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-xl font-light text-white/85">
                      {item.size}
                    </span>
                    <span className="font-mono text-[10px] text-white/35">cm 이상</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

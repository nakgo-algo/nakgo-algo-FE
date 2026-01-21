export default function FinesPage() {
  const fines = [
    {
      type: '금지구역 내 낚시',
      amount: '100',
      unit: '만원 이하',
      law: '수산자원관리법 제67조',
      bg: 'rgba(130, 110, 90, 0.25)',
      border: 'rgba(160, 140, 110, 0.2)',
    },
    {
      type: '금어기 위반 포획',
      amount: '2,000',
      unit: '만원 이하',
      extra: '또는 2년 이하 징역',
      law: '수산자원관리법 제63조',
      bg: 'rgba(140, 90, 90, 0.25)',
      border: 'rgba(170, 110, 110, 0.2)',
    },
    {
      type: '금지체장 미달 포획',
      amount: '100',
      unit: '만원 이하',
      law: '수산자원관리법 제67조',
      bg: 'rgba(140, 120, 85, 0.25)',
      border: 'rgba(170, 145, 100, 0.2)',
    },
    {
      type: '금지어구 사용',
      amount: '3,000',
      unit: '만원 이하',
      extra: '또는 3년 이하 징역',
      law: '수산자원관리법 제62조',
      bg: 'rgba(130, 85, 85, 0.28)',
      border: 'rgba(160, 105, 105, 0.22)',
    },
  ]

  return (
    <div className="h-full gradient-deep pt-20 pb-36 px-5 overflow-y-auto">
      {/* Title */}
      <div className="mb-8 pl-1">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-white/45 uppercase">
          Penalties
        </span>
        <h1 className="font-sans text-2xl font-light text-white/90 mt-1 tracking-tight">
          벌금 안내
        </h1>
      </div>

      {/* Warning Banner */}
      <div className="card-slate p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-500/60 mt-1.5 shrink-0"></span>
          <p className="font-sans text-xs text-white/55 leading-relaxed">
            벌금 기준은 지역과 상황에 따라 다를 수 있습니다.
            정확한 내용은 관할 기관에 문의하세요.
          </p>
        </div>
      </div>

      {/* Fine List */}
      <div className="space-y-4">
        {fines.map((fine, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl backdrop-blur-sm animate-fadeUp"
            style={{
              background: `linear-gradient(145deg, ${fine.bg} 0%, ${fine.bg.replace('0.25', '0.1').replace('0.28', '0.12')} 100%)`,
              border: `1px solid ${fine.border}`,
              animationDelay: `${index * 0.08}s`,
            }}
          >
            {/* Type */}
            <p className="font-sans text-sm text-white/60 mb-3">
              {fine.type}
            </p>

            {/* Amount */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-sans text-4xl font-extralight text-white/85 tracking-tight">
                {fine.amount}
              </span>
              <span className="font-mono text-sm text-white/45">{fine.unit}</span>
            </div>

            {/* Extra penalty */}
            {fine.extra && (
              <p className="font-sans text-sm text-amber-300/65 mb-3">
                {fine.extra}
              </p>
            )}

            {/* Law reference */}
            <p className="font-mono text-[10px] text-white/25 mt-2">
              {fine.law}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FinesPage() {
  const fines = [
    {
      type: '금지구역 내 낚시',
      amount: '100',
      unit: '만원 이하',
      law: '수산자원관리법 제67조',
      severity: 'medium',
    },
    {
      type: '금어기 위반 포획',
      amount: '2,000',
      unit: '만원 이하',
      extra: '또는 2년 이하 징역',
      law: '수산자원관리법 제63조',
      severity: 'high',
    },
    {
      type: '금지체장 미달 포획',
      amount: '100',
      unit: '만원 이하',
      law: '수산자원관리법 제67조',
      severity: 'medium',
    },
    {
      type: '금지어구 사용',
      amount: '3,000',
      unit: '만원 이하',
      extra: '또는 3년 이하 징역',
      law: '수산자원관리법 제62조',
      severity: 'high',
    },
  ]

  const getSeverityStyle = (severity) => {
    if (severity === 'high') {
      return {
        bg: 'linear-gradient(145deg, rgba(140, 70, 70, 0.2) 0%, rgba(110, 50, 50, 0.08) 100%)',
        border: 'rgba(180, 100, 100, 0.15)',
        accent: 'linear-gradient(180deg, #ef4444, #dc2626)',
        badge: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5' },
      }
    }
    return {
      bg: 'linear-gradient(145deg, rgba(150, 120, 70, 0.2) 0%, rgba(120, 95, 50, 0.08) 100%)',
      border: 'rgba(180, 150, 100, 0.15)',
      accent: 'linear-gradient(180deg, #f59e0b, #d97706)',
      badge: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d' },
    }
  }

  return (
    <div className="h-full gradient-deep pt-16 pb-8 px-5 overflow-y-auto relative">
      {/* Background accent */}
      <div
        className="absolute bottom-20 right-0 w-56 h-56 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(160, 100, 80, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-8 pt-4">
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-sans text-[28px] font-semibold text-white/90 tracking-tight leading-none">
            벌금 안내
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Penalties
          </span>
        </div>
        <p className="font-sans text-[13px] text-white/40 leading-relaxed">
          위반 시 부과되는 벌금과 처벌 정보입니다
        </p>
      </div>

      {/* Warning Banner */}
      <div
        className="relative z-10 mb-6 p-4 rounded-xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(145deg, rgba(100, 100, 100, 0.12) 0%, rgba(80, 80, 80, 0.06) 100%)',
          border: '1px solid rgba(150, 150, 150, 0.1)',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
          <p className="font-sans text-[12px] text-white/45 leading-relaxed">
            벌금 기준은 지역과 상황에 따라 다를 수 있습니다.
            <br />
            정확한 내용은 관할 기관에 문의하세요.
          </p>
        </div>
      </div>

      {/* Fine Cards */}
      <div className="relative z-10 space-y-4">
        {fines.map((fine, index) => {
          const style = getSeverityStyle(fine.severity)
          return (
            <div
              key={index}
              className="p-5 rounded-2xl backdrop-blur-sm relative overflow-hidden animate-fadeUp"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                animationDelay: `${index * 0.06}s`,
              }}
            >
              {/* Accent line */}
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ background: style.accent }}
              />

              {/* Severity badge */}
              <div className="mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium"
                  style={{ background: style.badge.bg, color: style.badge.color }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: style.badge.color }}
                  />
                  {fine.severity === 'high' ? '중대 위반' : '일반 위반'}
                </span>
              </div>

              {/* Type */}
              <p className="font-sans text-[14px] text-white/60 mb-3">
                {fine.type}
              </p>

              {/* Amount */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-sans text-[42px] font-extralight text-white/90 tracking-tight leading-none">
                  {fine.amount}
                </span>
                <span className="font-sans text-[14px] font-light text-white/45">
                  {fine.unit}
                </span>
              </div>

              {/* Extra penalty */}
              {fine.extra && (
                <p className="font-sans text-[13px] text-amber-300/60 mt-2">
                  {fine.extra}
                </p>
              )}

              {/* Law reference */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="font-mono text-[10px] text-white/25 tracking-wide">
                  {fine.law}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <div className="relative z-10 mt-6 flex items-start gap-3 px-1">
        <span className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
        <p className="font-sans text-[11px] text-white/30 leading-relaxed">
          위 정보는 참고용이며, 실제 처벌은 관련 법률과 판례에 따라 달라질 수 있습니다.
        </p>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}

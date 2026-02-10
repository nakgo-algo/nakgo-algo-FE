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

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">
          벌금 안내
        </h1>
        <p className="text-sm text-slate-400">
          위반 시 부과되는 벌금 정보
        </p>
      </div>

      {/* Notice */}
      <div className="mb-6 py-3 px-4 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 leading-relaxed">
          벌금 기준은 지역과 상황에 따라 다를 수 있습니다.
        </p>
      </div>

      {/* Fine List */}
      <div className="space-y-3">
        {fines.map((fine, index) => (
          <div
            key={index}
            className="py-4 border-b border-slate-700/50 last:border-b-0"
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  fine.severity === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {fine.severity === 'high' ? '중대' : '일반'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {fine.law}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-white text-base mb-2">
              {fine.type}
            </h3>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-light text-white">
                {fine.amount}
              </span>
              <span className="text-sm text-slate-400">
                {fine.unit}
              </span>
            </div>

            {fine.extra && (
              <p className="text-sm text-red-400/80 mt-1">
                {fine.extra}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-[11px] text-slate-500 leading-relaxed">
        * 위 정보는 참고용이며, 실제 처벌은 관련 법률에 따라 달라질 수 있습니다.
      </p>

      <div className="h-20" />
    </div>
  )
}

import { useState, useEffect } from 'react'
import api from '../api'

export default function FinesPage() {
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/fines')
      .then(setFines)
      .catch(() => setError('벌금 정보를 불러올 수 없습니다'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">벌금 안내</h1>
        <p className="text-sm text-slate-400">위반 시 부과되는 벌금 정보</p>
      </div>

      {/* Notice */}
      <div className="mb-6 py-3 px-4 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 leading-relaxed">
          벌금 기준은 지역과 상황에 따라 다를 수 있습니다.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-xs text-slate-400 hover:text-white transition-colors">다시 시도</button>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((fine) => (
            <div key={fine.id} className="py-4 border-b border-slate-700/50 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                  {fine.species || '일반'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {fine.legalBasis}
                </span>
              </div>
              <h3 className="text-white text-base mb-2">{fine.violation}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-light text-white">{fine.fineAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-slate-500 leading-relaxed">
        * 위 정보는 참고용이며, 실제 처벌은 관련 법률에 따라 달라질 수 있습니다.
      </p>
      <div className="mt-4 pt-3 border-t border-slate-700/30">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          출처: 해양수산부, 국가법령정보센터 (수산업법, 낚시관리및육성법, 내수면어업법)
        </p>
        <p className="text-[10px] text-slate-600">
          자료 확인일: 2025.02
        </p>
      </div>
      <div className="h-20" />
    </div>
  )
}

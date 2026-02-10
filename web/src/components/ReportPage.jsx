import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// 샘플 제보 데이터
const sampleReports = [
  {
    id: 1,
    type: 'missing',
    title: '울산 매암동 금지구역 누락',
    location: '울산 남구 매암동 472-6',
    description: '이 지역은 실제로 낚시 금지구역인데 지도에 표시되어 있지 않습니다.',
    status: 'pending',
    createdAt: '2026.02.05',
    author: '바다사랑',
  },
  {
    id: 2,
    type: 'wrong',
    title: '부산 기장 해제된 구역',
    location: '부산 기장군 일광면',
    description: '작년에 금지구역에서 해제되었는데 아직 빨간색으로 표시됩니다.',
    status: 'reviewing',
    createdAt: '2026.02.03',
    author: '민물킹',
  },
  {
    id: 3,
    type: 'boundary',
    title: '경계 오류 - 범위가 너무 넓음',
    location: '인천 옹진군',
    description: '금지구역 경계가 실제보다 넓게 표시되어 있습니다.',
    status: 'resolved',
    createdAt: '2026.01.28',
    author: '낚시초보',
  },
]

const reportTypes = [
  { value: 'missing', label: '누락된 금지구역', desc: '실제 금지구역인데 지도에 없음' },
  { value: 'wrong', label: '잘못된 표시', desc: '해제되었거나 잘못 표시됨' },
  { value: 'boundary', label: '경계 오류', desc: '구역 범위가 정확하지 않음' },
  { value: 'other', label: '기타', desc: '다른 종류의 오류' },
]

const statusLabels = {
  pending: { label: '검토 대기', color: 'text-slate-400 bg-slate-400/10' },
  reviewing: { label: '검토 중', color: 'text-yellow-400 bg-yellow-400/10' },
  resolved: { label: '반영 완료', color: 'text-green-400 bg-green-400/10' },
  rejected: { label: '반려', color: 'text-red-400 bg-red-400/10' },
}

export default function ReportPage({ onNavigate }) {
  const { isLoggedIn } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [reports] = useState(sampleReports)
  const [filter, setFilter] = useState('all')

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.status === filter)

  if (!isLoggedIn) {
    return (
      <div className="h-full bg-slate-900 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-2">로그인이 필요합니다</h2>
        <p className="text-slate-500 text-sm text-center mb-6">
          오류 제보 기능을 사용하려면<br />로그인해주세요
        </p>
        <button
          onClick={() => onNavigate?.('login')}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-colors"
        >
          로그인하기
        </button>
      </div>
    )
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-white mb-1">오류 제보</h1>
        <p className="text-sm text-slate-400">잘못된 정보를 신고해주세요</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-3 flex gap-2 border-b border-slate-800">
        {[
          { value: 'all', label: '전체' },
          { value: 'pending', label: '대기' },
          { value: 'reviewing', label: '검토중' },
          { value: 'resolved', label: '완료' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              filter === tab.value
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">제보 내역이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredReports.map((report) => (
              <div key={report.id} className="px-5 py-4">
                {/* Status & Type */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusLabels[report.status].color}`}>
                    {statusLabels[report.status].label}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {reportTypes.find(t => t.value === report.type)?.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-medium mb-1">{report.title}</h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {report.location}
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                  {report.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span>{report.author}</span>
                  <span>·</span>
                  <span>{report.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Report FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>

      {/* Create Report Modal */}
      {showCreateModal && (
        <CreateReportModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

function CreateReportModal({ onClose, initialLocation }) {
  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState(initialLocation || '')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type || !title || !location || !description) {
      alert('모든 항목을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert('제보가 접수되었습니다. 검토 후 반영됩니다.')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">오류 제보하기</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Report Type */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">제보 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setType(rt.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    type === rt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <p className={`text-sm font-medium ${type === rt.value ? 'text-orange-400' : 'text-white'}`}>
                    {rt.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{rt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: OO항 금지구역 누락"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">위치</label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="주소 또는 위치 설명"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500"
              />
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setLocation(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
                      },
                      () => alert('위치를 가져올 수 없습니다')
                    )
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">GPS 버튼으로 현재 위치 입력 가능</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="오류 내용을 자세히 설명해주세요"
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 resize-none"
            />
          </div>

          {/* Notice */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              제보 내용은 검토 후 반영됩니다. 허위 제보 시 이용이 제한될 수 있습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-700">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? '제출 중...' : '제보하기'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// 외부에서 사용할 수 있도록 export
export { CreateReportModal }

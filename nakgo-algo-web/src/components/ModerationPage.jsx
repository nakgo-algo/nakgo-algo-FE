import { useState, useEffect } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

export default function ModerationPage() {
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')

  const fetchRequests = async () => {
    try {
      const data = await api.get('/moderation?status=pending')
      setRequests(data)
    } catch {
      setRequests([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleIgnore = async (id) => {
    setResolving(id)
    try {
      await api.put(`/moderation/${id}/resolve`, { action: 'ignore' })
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch {
      toast.error('처리에 실패했습니다')
    }
    setResolving(null)
  }

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast.warn('삭제 사유를 입력해주세요')
      return
    }
    const id = deleteModal
    setResolving(id)
    try {
      await api.put(`/moderation/${id}/resolve`, { action: 'delete', deleteReason: deleteReason.trim() })
      setRequests(prev => prev.filter(r => r.id !== id))
      setDeleteModal(null)
      setDeleteReason('')
    } catch {
      toast.error('처리에 실패했습니다')
    }
    setResolving(null)
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-1">콘텐츠 검토</h1>
        <p className="text-slate-500 text-xs">AI가 감지한 부적절한 게시글</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-sm">검토할 게시글이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {requests.map((r) => (
              <div key={r.id} className="px-5 py-4">
                {/* Post Info */}
                <div className="mb-3">
                  <p className="text-white text-sm font-medium mb-1 line-clamp-1">
                    {r.postTitle || '(삭제된 게시글)'}
                  </p>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-2">
                    {r.postContent || ''}
                  </p>
                  {r.postAuthor && (
                    <p className="text-slate-600 text-[10px]">작성자: {r.postAuthor}</p>
                  )}
                </div>

                {/* Detection Info */}
                <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                  <p className="text-yellow-400 text-xs font-medium mb-1">감지 사유: {r.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.matchedWords.map((w, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full border border-red-500/30">
                        {w}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600 text-[10px] mt-2">{r.createdAt}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDeleteModal(r.id); setDeleteReason('') }}
                    disabled={resolving === r.id}
                    className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleIgnore(r.id)}
                    disabled={resolving === r.id}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    무시
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Reason Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-3">삭제 사유 입력</h3>
            <input
              type="text"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="삭제 사유를 입력하세요"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 mb-4"
              maxLength={200}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setDeleteModal(null); setDeleteReason('') }}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={resolving === deleteModal}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

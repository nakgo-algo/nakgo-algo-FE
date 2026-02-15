import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

const BTN = 'flex-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50'

export default function ModerationPage() {
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    api.get('/moderation?status=pending').then(setRequests).catch(() => setRequests([])).finally(() => setLoading(false))
  }, [])

  const closeModal = useCallback(() => { setDeleteModal(null); setDeleteReason('') }, [])

  const handleResolve = useCallback(async (id, action, reason) => {
    if (action === 'delete' && !reason?.trim()) return toast.warn('삭제 사유를 입력해주세요')
    setResolving(id)
    try {
      await api.put(`/moderation/${id}/resolve`, { action, ...(reason && { deleteReason: reason.trim() }) })
      setRequests(prev => prev.filter(r => r.id !== id))
      if (action === 'delete') closeModal()
    } catch {
      toast.error('처리에 실패했습니다')
    } finally {
      setResolving(null)
    }
  }, [toast, closeModal])

  if (loading) return (
    <div className="h-full bg-slate-900 flex justify-center pt-28">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-1">콘텐츠 검토</h1>
        <p className="text-slate-500 text-xs">AI가 감지한 부적절한 게시글</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 text-sm">검토할 게시글이 없습니다</p>
          </div>
        ) : requests.map((r) => (
          <div key={r.id} className="px-5 py-4 border-b border-slate-800">
            <p className="text-white text-sm font-medium mb-1 line-clamp-1">{r.postTitle || '(삭제된 게시글)'}</p>
            <p className="text-slate-400 text-xs line-clamp-2 mb-1">{r.postContent}</p>
            {r.postAuthor && <p className="text-slate-600 text-[10px] mb-3">작성자: {r.postAuthor}</p>}

            <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
              <p className="text-yellow-400 text-xs font-medium mb-1">감지 사유: {r.reason}</p>
              <div className="flex flex-wrap gap-1">
                {r.matchedWords.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full border border-red-500/30">{w}</span>
                ))}
              </div>
              <p className="text-slate-600 text-[10px] mt-2">{r.createdAt}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setDeleteModal(r.id); setDeleteReason('') }} disabled={resolving === r.id} className={`${BTN} py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400`}>삭제</button>
              <button onClick={() => handleResolve(r.id, 'ignore')} disabled={resolving === r.id} className={`${BTN} py-2 bg-slate-700 hover:bg-slate-600 text-slate-300`}>무시</button>
            </div>
          </div>
        ))}
      </div>

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
          <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-3">삭제 사유 입력</h3>
            <input
              type="text" value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
              placeholder="삭제 사유를 입력하세요" maxLength={200}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={closeModal} className={`${BTN} py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm`}>취소</button>
              <button onClick={() => handleResolve(deleteModal, 'delete', deleteReason)} disabled={resolving === deleteModal} className={`${BTN} py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm`}>삭제 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

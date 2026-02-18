import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

const BTN = 'flex-1 font-medium rounded-lg transition-colors disabled:opacity-50'
const BADGE = 'px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full border border-red-500/30'
const INPUT = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 mb-4'
const INITIAL_MODAL = { id: null, reason: '' }

/* ── Custom Hook ── */
function useModeration() {
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)
  const [modal, setModal] = useState(INITIAL_MODAL)

  useEffect(() => {
    api.get('/moderation?status=pending').then(setRequests).catch(() => setRequests([])).finally(() => setLoading(false))
  }, [])

  const openModal = useCallback(id => setModal({ id, reason: '' }), [])
  const closeModal = useCallback(() => setModal(INITIAL_MODAL), [])
  const setReason = useCallback(reason => setModal(m => ({ ...m, reason })), [])

  const resolve = useCallback(async (id, action) => {
    if (action === 'delete' && !modal.reason.trim()) return toast.warn('삭제 사유를 입력해주세요')
    setResolving(id)
    try {
      await api.put(`/moderation/${id}/resolve`, { action, ...(action === 'delete' && { deleteReason: modal.reason.trim() }) })
      setRequests(prev => prev.filter(r => r.id !== id))
      if (action === 'delete') closeModal()
    } catch {
      toast.error('처리에 실패했습니다')
    } finally {
      setResolving(null)
    }
  }, [toast, closeModal, modal.reason])

  return { requests, loading, resolving, modal, openModal, closeModal, setReason, resolve }
}

/* ── Sub Components ── */
const Spinner = () => (
  <div className="h-full bg-slate-900 flex justify-center pt-28">
    <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <svg className="w-12 h-12 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-slate-500 text-sm">검토할 게시글이 없습니다</p>
  </div>
)

const RequestCard = ({ r, disabled, onDelete, onIgnore }) => (
  <div className="px-5 py-4 border-b border-slate-800">
    <p className="text-white text-sm font-medium mb-1 line-clamp-1">{r.postTitle || '(삭제된 게시글)'}</p>
    <p className="text-slate-400 text-xs line-clamp-2 mb-1">{r.postContent}</p>
    {r.postAuthor && <p className="text-slate-600 text-[10px] mb-3">작성자: {r.postAuthor}</p>}
    <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
      <p className="text-yellow-400 text-xs font-medium mb-1">감지 사유: {r.reason}</p>
      <div className="flex flex-wrap gap-1">
        {r.matchedWords.map((w, i) => <span key={i} className={BADGE}>{w}</span>)}
      </div>
      <p className="text-slate-600 text-[10px] mt-2">{r.createdAt}</p>
    </div>
    <div className="flex gap-2">
      <button onClick={onDelete} disabled={disabled} className={`${BTN} py-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400`}>삭제</button>
      <button onClick={onIgnore} disabled={disabled} className={`${BTN} py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300`}>무시</button>
    </div>
  </div>
)

const DeleteModal = ({ modal, disabled, onReasonChange, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5" onClick={onClose}>
    <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
      <h3 className="text-white font-semibold mb-3">삭제 사유 입력</h3>
      <input
        type="text" value={modal.reason} onChange={e => onReasonChange(e.target.value)}
        placeholder="삭제 사유를 입력하세요" maxLength={200} autoFocus className={INPUT}
        onKeyDown={e => e.key === 'Enter' && onConfirm()}
      />
      <div className="flex gap-2">
        <button onClick={onClose} className={`${BTN} py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300`}>취소</button>
        <button onClick={onConfirm} disabled={disabled} className={`${BTN} py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white`}>삭제 확인</button>
      </div>
    </div>
  </div>
)

/* ── Main Component ── */
export default function ModerationPage() {
  const { requests, loading, resolving, modal, openModal, closeModal, setReason, resolve } = useModeration()

  if (loading) return <Spinner />

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-1">콘텐츠 검토</h1>
        <p className="text-slate-500 text-xs">AI가 감지한 부적절한 게시글</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!requests.length ? <EmptyState /> : requests.map(r => (
          <RequestCard key={r.id} r={r} disabled={resolving === r.id} onDelete={() => openModal(r.id)} onIgnore={() => resolve(r.id, 'ignore')} />
        ))}
      </div>

      {modal.id && (
        <DeleteModal modal={modal} disabled={resolving === modal.id} onReasonChange={setReason} onConfirm={() => resolve(modal.id, 'delete')} onClose={closeModal} />
      )}
    </div>
  )
}

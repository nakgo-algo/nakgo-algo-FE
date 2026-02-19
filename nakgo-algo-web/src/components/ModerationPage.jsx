import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useToast } from '../contexts/ToastContext'

const BTN = 'flex-1 font-medium rounded-lg transition-colors disabled:opacity-50'
const WORD_BADGE = 'px-2.5 py-1 bg-red-500/15 text-red-400 text-[10px] rounded-full border border-red-500/20'
const INPUT = 'w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-500 outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all'
const INITIAL_MODAL = { id: null, reason: '' }

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

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
  <div className="flex flex-col items-center justify-center py-20 px-5">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-white text-sm font-medium mb-1">모든 게시글이 검토되었습니다</p>
    <p className="text-slate-500 text-xs">검토 대기 중인 게시글이 없습니다</p>
  </div>
)

const RequestCard = ({ r, disabled, onDelete, onIgnore, style }) => (
  <div className="px-5 py-4" style={style}>
    <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-white text-sm font-semibold line-clamp-1">{r.postTitle || '(삭제된 게시글)'}</p>
          <p className="text-slate-400 text-xs line-clamp-2 mt-1">{r.postContent}</p>
        </div>
        <span className="text-slate-600 text-[10px] whitespace-nowrap mt-0.5">{formatTimeAgo(r.createdAt)}</span>
      </div>

      {r.postAuthor && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-[9px] text-slate-400">{r.postAuthor[0]}</span>
          </div>
          <span className="text-slate-500 text-[11px]">{r.postAuthor}</span>
        </div>
      )}

      <div className="bg-yellow-500/5 rounded-xl p-3 mb-3 border border-yellow-500/10">
        <div className="flex items-center gap-1.5 mb-2">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-400 text-xs font-medium">{r.reason}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {r.matchedWords.map((w, i) => <span key={i} className={WORD_BADGE}>{w}</span>)}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onDelete} disabled={disabled} className={`${BTN} py-2.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20`}>삭제</button>
        <button onClick={onIgnore} disabled={disabled} className={`${BTN} py-2.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-300`}>무시</button>
      </div>
    </div>
  </div>
)

const DeleteModal = ({ modal, disabled, onReasonChange, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50" onClick={onClose}>
    <div
      className="bg-slate-800 rounded-t-2xl p-5 pb-8 w-full max-w-lg border-t border-slate-700/50 animate-slide-up"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto mb-5" />
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg">게시글 삭제</h3>
      </div>
      <p className="text-slate-400 text-xs mb-4">삭제 사유를 입력하면 작성자에게 알림이 전송됩니다.</p>
      <input
        type="text" value={modal.reason} onChange={e => onReasonChange(e.target.value)}
        placeholder="삭제 사유를 입력하세요" maxLength={200} autoFocus className={INPUT}
        onKeyDown={e => e.key === 'Enter' && onConfirm()}
      />
      <div className="flex gap-2 mt-4">
        <button onClick={onClose} className={`${BTN} py-3 text-sm bg-slate-700/50 hover:bg-slate-600/50 text-slate-300`}>취소</button>
        <button onClick={onConfirm} disabled={disabled} className={`${BTN} py-3 text-sm bg-red-600 hover:bg-red-700 text-white`}>삭제 확인</button>
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">콘텐츠 검토</h1>
          {requests.length > 0 && (
            <span className="px-2.5 py-0.5 bg-yellow-500/15 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/20">
              {requests.length}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-1">키워드 필터에 감지된 게시글을 검토합니다</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {!requests.length ? <EmptyState /> : requests.map((r, i) => (
          <RequestCard
            key={r.id} r={r} disabled={resolving === r.id}
            onDelete={() => openModal(r.id)} onIgnore={() => resolve(r.id, 'ignore')}
            style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}
          />
        ))}
      </div>

      {modal.id && (
        <DeleteModal modal={modal} disabled={resolving === modal.id} onReasonChange={setReason} onConfirm={() => resolve(modal.id, 'delete')} onClose={closeModal} />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}

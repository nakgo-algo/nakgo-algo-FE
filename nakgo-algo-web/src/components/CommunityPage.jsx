import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function CommunityPage() {
  const { isLoggedIn } = useAuth()
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  const fetchPosts = useCallback(async () => {
    setError(null)
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      const data = await api.get(`/posts${params}`)
      setPosts(data)
    } catch {
      setError('게시글을 불러올 수 없습니다')
      setPosts([])
    }
    setLoading(false)
  }, [searchQuery])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(fetchPosts, 300)
    return () => clearTimeout(timer)
  }, [fetchPosts])

  const handlePostCreated = () => {
    setShowWriteModal(false)
    fetchPosts()
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-4">자유게시판</h1>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 내용 검색"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-600"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto">
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
            <button onClick={fetchPosts} className="mt-3 text-xs text-slate-400 hover:text-white transition-colors">다시 시도</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            게시글이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post.id)}
                className="px-5 py-4 active:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {/* Title */}
                <h3 className="text-white font-medium mb-2 line-clamp-1">
                  {post.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-slate-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400">{post.author}</span>
                  <span className="text-xs text-slate-600">{post.date}</span>
                </div>

                {/* Image Preview */}
                {post.image && (
                  <div className="mb-3 rounded-lg bg-slate-800 overflow-hidden">
                    <img src={post.image} alt="" className="w-full object-contain max-h-60" />
                  </div>
                )}

                {/* Content Preview */}
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* Comment Count */}
                <div className="flex items-center gap-1 text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-xs">{post.comments}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Write Button (FAB) */}
      <button
        onClick={() => {
          if (!isLoggedIn) {
            toast.warn('로그인이 필요합니다')
            return
          }
          setShowWriteModal(true)
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Write Modal */}
      {showWriteModal && (
        <WritePostModal
          onClose={() => setShowWriteModal(false)}
          onCreated={handlePostCreated}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          postId={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={() => { setSelectedPost(null); fetchPosts(); toast.success('게시글이 삭제되었습니다') }}
        />
      )}

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

function WritePostModal({ onClose, onCreated }) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.warn('이미지 크기는 5MB 이하여야 합니다')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.warn('제목과 내용을 입력해주세요')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      if (image) formData.append('image', image)
      await api.upload('/posts', formData)
      onCreated()
    } catch {
      toast.error('게시글 등록에 실패했습니다')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-800 z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">글쓰기</h2>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-4 overflow-y-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 mb-3"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          className="w-full flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 resize-none mb-3"
        />

        {/* Image Upload */}
        <div className="mb-2">
          <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            사진 첨부
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <img src={imagePreview} alt="미리보기" className="h-24 rounded-lg object-cover" />
              <button
                onClick={() => { setImage(null); setImagePreview(null) }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 border-t border-slate-700">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}

const DELETE_REASONS = [
  '욕설/비속어',
  '음란내용',
  '스팸/광고',
  '허위정보',
  '개인정보 노출',
  '기타',
]

function PostDetailModal({ postId, onClose, onDeleted }) {
  const { isLoggedIn, user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.isAdmin
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteReasonModal, setShowDeleteReasonModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  useEffect(() => {
    api.get(`/posts/${postId}`)
      .then(setPost)
      .catch(() => onClose())
      .finally(() => setLoading(false))
  }, [postId])

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const comment = await api.post(`/posts/${postId}/comments`, { text: commentText.trim() })
      setPost(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }))
      setCommentText('')
    } catch {
      toast.error('댓글 등록에 실패했습니다')
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    // 어드민이 타인 게시글 삭제 시 → 사유 모달
    if (isAdmin && post && post.userId !== user?.id) {
      setShowDeleteReasonModal(true)
      return
    }
    // 본인 게시글 삭제
    if (!confirm('게시글을 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await api.delete(`/posts/${postId}`)
      onDeleted?.()
    } catch {
      toast.error('삭제에 실패했습니다')
      setDeleting(false)
    }
  }

  const handleAdminDelete = async () => {
    const reason = selectedReason === '기타' ? customReason.trim() : selectedReason
    if (!reason) {
      toast.warn('삭제 사유를 선택해주세요')
      return
    }
    setDeleting(true)
    try {
      await api.put(`/posts/${postId}/admin-delete`, { reason })
      onDeleted?.()
    } catch {
      toast.error('삭제에 실패했습니다')
      setDeleting(false)
    }
  }

  const canDelete = isLoggedIn && post && (post.userId === user?.id || isAdmin)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">게시글</h3>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : post ? (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-white text-lg font-semibold mb-2">{post.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-400">{post.author}</span>
                <span className="text-xs text-slate-600">{post.date}</span>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="mb-4 rounded-lg overflow-hidden bg-slate-700">
                  <img src={post.image} alt="" className="w-full object-contain max-h-80" />
                </div>
              )}

              <p className="text-slate-300 text-sm whitespace-pre-wrap mb-6">{post.content}</p>

              {/* Comments */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-500 mb-3">
                  댓글 {post.comments?.length || 0}
                </p>
                <div className="space-y-3">
                  {(post.comments || []).map((c) => (
                    <div key={c.id} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-300 font-medium">{c.author}</span>
                        <span className="text-[10px] text-slate-600">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-400">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            {isLoggedIn && (
              <div className="p-4 border-t border-slate-700 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                >
                  {submitting ? '...' : '등록'}
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Admin Delete Reason Modal */}
      {showDeleteReasonModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-5">
          <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-1">삭제 사유 선택</h3>
            <p className="text-slate-500 text-xs mb-4">사용자에게 삭제 사유가 알림으로 전달됩니다</p>

            <div className="space-y-2 mb-4">
              {DELETE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => { setSelectedReason(reason); if (reason !== '기타') setCustomReason('') }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedReason === reason
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-700 text-slate-300 border border-transparent hover:bg-slate-600'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === '기타' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="사유를 직접 입력하세요"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-slate-500 mb-4"
                maxLength={200}
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteReasonModal(false); setSelectedReason(''); setCustomReason('') }}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdminDelete}
                disabled={deleting || !selectedReason || (selectedReason === '기타' && !customReason.trim())}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

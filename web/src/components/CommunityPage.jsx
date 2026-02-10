import { useState } from 'react'

// 샘플 게시글 데이터
const samplePosts = [
  {
    id: 1,
    title: '여기 낚시해도 되나요?',
    author: '바다사랑',
    date: '2026.02.05 14:32',
    content: '울산 북구 연암동에 위치한 연암소류지입니다. 저수지 바깥쪽 색은 상관없는건가요? 수년전 낚시 엄청 많이 했었는데...',
    image: null,
    comments: 3,
  },
  {
    id: 2,
    title: '오남저수지 낚시하면안되나여?? ㅠㅠ',
    author: '낚시초보',
    date: '2026.02.04 09:15',
    content: '지도에 빨간색으로 표시되어 있던데 완전 금지인건가요? 주변에 다른 포인트 추천해주세요',
    image: null,
    comments: 7,
  },
  {
    id: 3,
    title: '붕어 30cm 잡았습니다!',
    author: '민물킹',
    date: '2026.02.03 18:44',
    content: '오늘 처음으로 30cm 넘는 붕어 잡았어요. 체장 규정 통과!',
    image: 'fish',
    comments: 12,
  },
  {
    id: 4,
    title: '금어기 확인 부탁드려요',
    author: '주말낚시',
    date: '2026.02.02 11:20',
    content: '우럭 금어기가 4월부터인데 3월 말에 잡으면 괜찮은건가요?',
    image: null,
    comments: 5,
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showWriteModal, setShowWriteModal] = useState(false)

  const filteredPosts = samplePosts.filter(
    (post) =>
      post.title.includes(searchQuery) || post.content.includes(searchQuery)
  )

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-16 px-5 pb-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-white mb-4">자유게시판</h1>

        {/* Search & Filter */}
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
          <button className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400">
            내 활동
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            게시글이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="px-5 py-4 active:bg-slate-800/50 transition-colors"
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
                  <div className="mb-3 rounded-lg bg-slate-800 h-32 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
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
        onClick={() => setShowWriteModal(true)}
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
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">글쓰기</h2>
              <button
                onClick={() => setShowWriteModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              placeholder="제목"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 mb-3"
            />

            <textarea
              placeholder="내용을 입력하세요"
              rows={5}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-slate-500 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg text-sm">
                사진 첨부
              </button>
              <button className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                등록하기
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              * 현재 데모 버전으로 실제 등록되지 않습니다
            </p>
          </div>
        </div>
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

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage({ onNavigate }) {
  const { user, logout, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showLoginRequired, setShowLoginRequired] = useState(false)

  const isGuest = user?.provider !== 'kakao'

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      updateProfile({ nickname: nickname.trim() })
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    console.log('handleLogout called')
    console.log('logout function:', logout)
    logout()
    console.log('logout done')
    setShowLogoutConfirm(false)
    console.log('navigating to map')
    onNavigate?.('map') // 로그아웃 후 지도 페이지로 이동
  }

  // 메뉴 아이템들
  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: '나의 포인트',
      desc: '저장한 낚시 장소',
      page: 'myPoints',
      count: 0,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: '조과 기록',
      desc: '잡은 물고기 기록',
      page: 'catchRecords',
      count: 0,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: '오류 제보 내역',
      desc: '내가 신고한 오류',
      page: 'reports',
      count: 0,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      label: '내가 쓴 글',
      desc: '게시판 활동 내역',
      page: 'myPosts',
      count: 0,
    },
  ]

  return (
    <div className="h-full bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="pt-16 px-5 pb-6">
        <h1 className="text-xl font-semibold text-white">내 프로필</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-slate-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="px-3 py-2 bg-teal-600 text-white text-sm rounded-lg"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">
                      {user?.nickname}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-slate-500 hover:text-slate-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">
                    {user?.provider === 'kakao' ? '카카오 로그인' : 'Guest'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 mb-6">
        <div className="bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-700/50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (isGuest) {
                  setShowLoginRequired(true)
                  return
                }
                onNavigate?.(item.page)
              }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-700/30 transition-colors text-left"
            >
              <div className="text-slate-400">{item.icon}</div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.count > 0 && (
                  <span className="px-2 py-0.5 bg-teal-600/20 text-teal-400 text-xs rounded-full">
                    {item.count}
                  </span>
                )}
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 mb-6">
        <p className="text-xs text-slate-500 mb-2 px-1">설정</p>
        <div className="bg-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-700/50">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-700/30 transition-colors text-left"
          >
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="flex-1 text-red-400 text-sm">로그아웃</span>
          </button>
        </div>
      </div>

      <div className="h-24" />

      {/* Login Required Modal */}
      {showLoginRequired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-slate-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">로그인 필요</h3>
            <p className="text-slate-400 text-sm mb-5">
              로그인이 필요한 기능입니다.<br />카카오 로그인 후 이용해주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginRequired(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowLoginRequired(false)
                  onNavigate?.('login')
                }}
                className="flex-1 py-2.5 bg-[#FEE500] text-[#191919] rounded-lg text-sm font-medium"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-slate-800 rounded-xl p-5 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">로그아웃</h3>
            <p className="text-slate-400 text-sm mb-5">정말 로그아웃 하시겠습니까?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-sm"
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

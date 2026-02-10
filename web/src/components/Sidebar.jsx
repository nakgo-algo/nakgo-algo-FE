import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

const pages = ['map', 'check', 'regulations', 'fines', 'camera', 'community', 'report']

const navLabels = [
  '위치 보기',
  '위반 판단',
  '규정 확인',
  '벌금 안내',
  'AI 분석',
  '자유게시판',
  '오류 제보',
]

export default function Sidebar({ isOpen, onClose, currentPage, onNavigate }) {
  const { user, isLoggedIn } = useAuth()
  const sidebarRef = useRef(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)

  // 사이드바 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 스와이프로 닫기
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = startXRef.current
  }

  const handleTouchMove = (e) => {
    currentXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = startXRef.current - currentXRef.current
    if (diff > 50) {
      onClose()
    }
  }

  const handleNavClick = (page) => {
    onNavigate(page)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 h-full z-[70] w-[75vw] max-w-[280px] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(15, 35, 55, 0.95) 0%, rgba(10, 25, 40, 0.98) 100%)',
          borderRight: '1px solid rgba(100, 150, 180, 0.15)',
          boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {/* User Profile Section */}
        <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-5 border-b border-white/10">
          {isLoggedIn ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-3 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.nickname}
                </p>
                <p className="text-slate-500 text-xs">프로필 보기</p>
              </div>
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="flex items-center gap-3 w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">로그인</p>
                <p className="text-slate-500 text-xs">로그인하고 더 많은 기능 사용</p>
              </div>
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* App Title */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="flex flex-col leading-none">
            <span className="font-sans text-[20px] font-semibold tracking-[0.06em] text-white/90">
              낚고
            </span>
            <span className="font-sans text-[20px] font-light tracking-[0.1em] text-white/50">
              알고
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col py-2">
          {pages.map((page, index) => {
            const isActive = currentPage === page

            return (
              <button
                key={page}
                onClick={() => handleNavClick(page)}
                className={`flex items-center gap-4 px-6 py-3.5 bg-transparent border-none cursor-pointer text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10'
                    : 'hover:bg-white/5 active:bg-white/10'
                }`}
              >
                {/* Active Indicator */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'bg-white/20'
                  }`}
                />

                <span
                  className={`font-sans text-[14px] tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-normal text-white/60'
                  }`}
                >
                  {navLabels[index]}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Disclaimer */}
        <div className="absolute bottom-0 left-0 right-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-6">
          <p className="font-mono text-[9px] text-white/25 tracking-wider leading-relaxed">
            본 서비스의 정보는 참고용이며
            <br />
            법적 효력이 없습니다
          </p>
        </div>
      </aside>
    </>
  )
}

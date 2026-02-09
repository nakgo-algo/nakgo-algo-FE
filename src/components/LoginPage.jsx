import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithKakao, loginDemo } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithKakao()
      onLoginSuccess?.()
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
    }
    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    loginDemo()
    onLoginSuccess?.()
  }

  return (
    <div className="h-full gradient-mid flex flex-col overflow-y-auto">
      {/* Top section */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-10 pt-20">
        {/* Small wave decoration */}
        <svg viewBox="0 0 120 16" className="w-20 mb-6 opacity-25" fill="none">
          <path
            d="M0 8c10 0 10-6 20-6s10 6 20 6 10-6 20-6 10 6 20 6 10-6 20-6 10 6 20 6"
            stroke="white" strokeWidth="1.5" strokeLinecap="round"
          />
        </svg>

        <h1 className="font-sans text-[32px] font-extralight text-white/90 leading-tight mb-2">
          낚고알고에
          <br />
          오신 것을 환영합니다
        </h1>
        <p className="font-sans text-[14px] text-white/35 leading-relaxed">
          로그인하고 나만의 낚시 기록을 시작하세요
        </p>
      </div>

      {/* Features — simple text list, no icons */}
      <div className="px-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {['포인트 저장', '조과 기록', '오류 제보', '게시판'].map((label) => (
            <span
              key={label}
              className="font-sans text-[12px] text-white/40 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Login Buttons */}
      <div className="px-6 pb-6 space-y-3">
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-sans text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: '#FEE500',
            color: '#191600',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0C4.029 0 0 3.13 0 6.989c0 2.393 1.523 4.508 3.868 5.768l-.986 3.678a.31.31 0 00.466.345l4.269-2.832c.456.045.92.07 1.383.07 4.971 0 9-3.13 9-6.99C18 3.13 13.971 0 9 0z"
              fill="#191600"
            />
          </svg>
          {isLoading ? '로그인 중...' : '카카오로 시작하기'}
        </button>

        <button
          onClick={handleDemoLogin}
          className="w-full py-4 rounded-2xl font-sans text-[14px] text-white/50 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          비회원으로 둘러보기
        </button>

        {error && (
          <p className="text-center text-red-400/80 text-[13px] pt-1">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8">
        <p className="font-sans text-[10px] text-white/15 leading-relaxed">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}

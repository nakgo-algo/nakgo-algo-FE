import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

// SwimmingFish.jsx에서 그대로 가져온 물고기 실루엣
function FishSilhouette({ size = 50, animationDelay = 0 }) {
  return (
    <svg
      width={size * 0.5}
      height={size}
      viewBox="0 0 50 100"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <path fill="white" opacity="0.18">
        <animate
          attributeName="d"
          dur="1.2s"
          repeatCount="indefinite"
          begin={`${animationDelay}s`}
          calcMode="spline"
          keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
          values="
            M 25 0 C 33 6, 36 18, 36 30 C 36 42, 34 52, 31 64 C 28 76, 26 84, 25 90 L 6 100 L 25 88 L 44 100 L 25 90 C 24 84, 22 76, 19 64 C 16 52, 14 42, 14 30 C 14 18, 17 6, 25 0 Z;
            M 25 0 C 33 6, 36 18, 36 30 C 36 42, 36 52, 34 64 C 32 76, 32 84, 32 90 L 16 100 L 34 88 L 52 100 L 32 90 C 30 84, 22 76, 19 64 C 16 52, 14 42, 14 30 C 14 18, 17 6, 25 0 Z;
            M 25 0 C 33 6, 36 18, 36 30 C 36 42, 34 52, 31 64 C 28 76, 26 84, 25 90 L 6 100 L 25 88 L 44 100 L 25 90 C 24 84, 22 76, 19 64 C 16 52, 14 42, 14 30 C 14 18, 17 6, 25 0 Z;
            M 25 0 C 33 6, 36 18, 36 30 C 36 42, 32 52, 28 64 C 24 76, 20 84, 18 90 L -2 100 L 16 88 L 34 100 L 18 90 C 20 84, 22 76, 19 64 C 16 52, 14 42, 14 30 C 14 18, 17 6, 25 0 Z;
            M 25 0 C 33 6, 36 18, 36 30 C 36 42, 34 52, 31 64 C 28 76, 26 84, 25 90 L 6 100 L 25 88 L 44 100 L 25 90 C 24 84, 22 76, 19 64 C 16 52, 14 42, 14 30 C 14 18, 17 6, 25 0 Z
          "
        />
      </path>
      <path d="M 14 28 C 6 32, 4 40, 8 44 C 10 41, 14 35, 14 30 Z" fill="white" opacity="0.12" />
      <path d="M 36 28 C 44 32, 46 40, 42 44 C 40 41, 36 35, 36 30 Z" fill="white" opacity="0.12" />
    </svg>
  )
}

function LoginFish({ initialX, initialY, initialVx, initialVy, size, animationDelay, boundWidth, boundHeight }) {
  const posRef = useRef({ x: initialX, y: initialY })
  const velRef = useRef({ vx: initialVx, vy: initialVy })
  const elementRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const speed = 0.25 + Math.random() * 0.15

    const animate = () => {
      const pos = posRef.current
      const vel = velRef.current

      pos.x += vel.vx * speed
      pos.y += vel.vy * speed

      const maxX = boundWidth - size * 0.5
      const maxY = boundHeight - size

      if (pos.x <= 0 || pos.x >= maxX) {
        vel.vx *= -1
        vel.vy += (Math.random() - 0.5) * 0.15
        pos.x = Math.max(0, Math.min(pos.x, maxX))
      }

      if (pos.y <= 0 || pos.y >= maxY) {
        vel.vy *= -1
        vel.vx += (Math.random() - 0.5) * 0.15
        pos.y = Math.max(0, Math.min(pos.y, maxY))
      }

      const currentSpeed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy)
      const targetSpeed = 0.5
      if (currentSpeed > 0) {
        const factor = targetSpeed / currentSpeed
        vel.vx = vel.vx * 0.995 + vel.vx * factor * 0.005
        vel.vy = vel.vy * 0.995 + vel.vy * factor * 0.005
      }

      if (elementRef.current) {
        const moveAngle = Math.atan2(vel.vy, vel.vx) * (180 / Math.PI) + 90
        elementRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${moveAngle}deg)`
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [size, boundWidth, boundHeight])

  return (
    <div
      ref={elementRef}
      className="absolute will-change-transform"
      style={{
        transform: `translate(${initialX}px, ${initialY}px)`,
        transformOrigin: 'center center',
      }}
    >
      <FishSilhouette size={size} animationDelay={animationDelay} />
    </div>
  )
}

function RightPanelFish() {
  const [fishList, setFishList] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    const generate = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.offsetWidth
      const h = el.offsetHeight
      const count = 6
      const newFish = []
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 0.3
        newFish.push({
          id: i,
          initialX: Math.random() * w,
          initialY: Math.random() * h,
          initialVx: Math.cos(angle) * speed,
          initialVy: Math.sin(angle) * speed,
          size: 40 + Math.random() * 25,
          animationDelay: Math.random(),
          boundWidth: w,
          boundHeight: h,
        })
      }
      setFishList(newFish)
    }
    generate()
    window.addEventListener('resize', generate)
    return () => window.removeEventListener('resize', generate)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {fishList.map((fish) => (
        <LoginFish key={fish.id} {...fish} />
      ))}
    </div>
  )
}

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
    <div className="h-full flex">
      {/* 왼쪽 — 기존 그라데이션 + 텍스트 + 버튼 */}
      <div className="w-1/2 gradient-mid flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-end px-6 pb-10 pt-20">
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

        <div className="px-6 pb-8">
          <p className="font-sans text-[10px] text-white/15 leading-relaxed">
            로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>

      {/* 오른쪽 — 그라데이션 + 물고기 수영 */}
      <div className="w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 30%, #80deea 60%, #4dd0e1 100%)' }}>
        <RightPanelFish />
      </div>

      {/* 버튼 — 전체 화면 기준 가운데 하단 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-80 space-y-3">
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-sans text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg"
          style={{ background: '#FEE500', color: '#191600' }}
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
          className="w-full py-4 rounded-2xl font-sans text-[14px] text-white/70 transition-all active:scale-[0.98] backdrop-blur-sm"
          style={{ background: 'rgba(255, 255, 255, 0.15)' }}
        >
          비회원으로 둘러보기
        </button>

        {error && (
          <p className="text-center text-red-400/80 text-[13px] pt-1">{error}</p>
        )}
      </div>
    </div>
  )
}

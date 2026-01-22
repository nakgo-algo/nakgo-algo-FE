import { useEffect, useRef, useState } from 'react'

// 위에서 내려다본 물고기 실루엣 (꼬리 삼각형)
function FishSilhouette({ size = 50, animationDelay = 0 }) {
  return (
    <svg
      width={size * 0.45}
      height={size}
      viewBox="0 0 45 100"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      <path
        fill="white"
        opacity="0.18"
      >
        <animate
          attributeName="d"
          dur="1s"
          repeatCount="indefinite"
          begin={`${animationDelay}s`}
          values="
            M 22.5 3 C 30 6, 33 12, 33 20 C 33 30, 32 40, 31 50 C 30 58, 28 66, 26 74 L 0 95 L 22.5 78 L 45 95 L 19 74 C 17 66, 15 58, 14 50 C 13 40, 12 30, 12 20 C 12 12, 15 6, 22.5 3 Z;
            M 22.5 3 C 30 6, 33 12, 33 20 C 33 30, 32 40, 32 50 C 31 58, 30 66, 29 74 L 10 95 L 28 78 L 50 95 L 24 74 C 21 66, 18 58, 16 50 C 14 40, 12 30, 12 20 C 12 12, 15 6, 22.5 3 Z;
            M 22.5 3 C 30 6, 33 12, 33 20 C 33 30, 32 40, 31 50 C 30 58, 28 66, 26 74 L 0 95 L 22.5 78 L 45 95 L 19 74 C 17 66, 15 58, 14 50 C 13 40, 12 30, 12 20 C 12 12, 15 6, 22.5 3 Z;
            M 22.5 3 C 30 6, 33 12, 33 20 C 33 30, 32 40, 30 50 C 29 58, 26 66, 22 74 L -5 95 L 18 78 L 38 95 L 16 74 C 15 66, 14 58, 13 50 C 12 40, 12 30, 12 20 C 12 12, 15 6, 22.5 3 Z;
            M 22.5 3 C 30 6, 33 12, 33 20 C 33 30, 32 40, 31 50 C 30 58, 28 66, 26 74 L 0 95 L 22.5 78 L 45 95 L 19 74 C 17 66, 15 58, 14 50 C 13 40, 12 30, 12 20 C 12 12, 15 6, 22.5 3 Z
          "
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"
        />
      </path>

      {/* 옆 지느러미 (고정) */}
      <path
        d="M 12 25 C 5 28, 3 34, 7 37 C 8 35, 12 30, 12 27 Z"
        fill="white"
        opacity="0.12"
      />
      <path
        d="M 33 25 C 40 28, 42 34, 38 37 C 37 35, 33 30, 33 27 Z"
        fill="white"
        opacity="0.12"
      />
    </svg>
  )
}

// 개별 물고기 컴포넌트
function Fish({ initialX, initialY, initialVx, initialVy, size, animationDelay }) {
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

      const maxX = window.innerWidth - size * 0.45
      const maxY = window.innerHeight - size

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

      // 속도 정규화
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

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [size])

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

export default function SwimmingFish() {
  const [fishList, setFishList] = useState([])

  useEffect(() => {
    const generateFish = () => {
      const count = 8
      const newFish = []

      for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight

        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 0.3
        const vx = Math.cos(angle) * speed
        const vy = Math.sin(angle) * speed

        const size = 40 + Math.random() * 25

        newFish.push({
          id: i,
          initialX: x,
          initialY: y,
          initialVx: vx,
          initialVy: vy,
          size,
          animationDelay: Math.random() * 1,
        })
      }

      setFishList(newFish)
    }

    generateFish()

    const handleResize = () => generateFish()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {fishList.map((fish) => (
        <Fish
          key={fish.id}
          initialX={fish.initialX}
          initialY={fish.initialY}
          initialVx={fish.initialVx}
          initialVy={fish.initialVy}
          size={fish.size}
          animationDelay={fish.animationDelay}
        />
      ))}
    </div>
  )
}

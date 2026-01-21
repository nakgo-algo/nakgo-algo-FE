export default function SwimmingFish() {
  const fishTypes = [
    // 톤다운된 블루, 그린, 그레이 계열
    { id: 1, size: 48, top: '12%', delay: 0, duration: 11, direction: 'right',
      bodyColor: '#7a9eb8', finColor: '#5d8299', accent: '#9bb8cc' },
    { id: 2, size: 44, top: '24%', delay: 4, duration: 13, direction: 'left',
      bodyColor: '#8b9a87', finColor: '#6b7d67', accent: '#a8b5a3' },
    { id: 3, size: 40, top: '44%', delay: 7, duration: 10, direction: 'right',
      bodyColor: '#9ca8b8', finColor: '#7b8a9c', accent: '#b5bfcc' },
    // 중간 크기
    { id: 4, size: 62, top: '34%', delay: 2, duration: 15, direction: 'left',
      bodyColor: '#6d8f9c', finColor: '#4d7280', accent: '#8aabb5' },
    { id: 5, size: 56, top: '54%', delay: 9, duration: 14, direction: 'right',
      bodyColor: '#8c9e8a', finColor: '#6a8068', accent: '#a5b5a3' },
    { id: 6, size: 58, top: '70%', delay: 5, duration: 16, direction: 'left',
      bodyColor: '#7895a3', finColor: '#5a7785', accent: '#96b0bc' },
    // 큰 물고기
    { id: 7, size: 80, top: '60%', delay: 3, duration: 19, direction: 'right',
      bodyColor: '#6a8a7c', finColor: '#4d6b5e', accent: '#88a699' },
    { id: 8, size: 72, top: '80%', delay: 11, duration: 22, direction: 'left',
      bodyColor: '#8a9caa', finColor: '#6a7d8c', accent: '#a5b5c2' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {fishTypes.map((fish) => (
        <div
          key={fish.id}
          className="absolute"
          style={{
            top: fish.top,
            left: fish.direction === 'right' ? '-100px' : 'auto',
            right: fish.direction === 'left' ? '-100px' : 'auto',
            animation: `swim${fish.direction === 'right' ? 'Right' : 'Left'} ${fish.duration}s ease-in-out infinite`,
            animationDelay: `${fish.delay}s`,
          }}
        >
          <svg
            width={fish.size}
            height={fish.size * 0.6}
            viewBox="0 0 100 60"
            style={{
              transform: fish.direction === 'left' ? 'scaleX(-1)' : 'none',
              filter: `drop-shadow(0 3px 6px rgba(0,0,0,0.1))`,
            }}
          >
            {/* 몸통 그라데이션 */}
            <defs>
              <linearGradient id={`bodyGrad${fish.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={fish.accent} stopOpacity="0.85" />
                <stop offset="50%" stopColor={fish.bodyColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={fish.finColor} stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id={`finGrad${fish.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={fish.finColor} stopOpacity="0.65" />
                <stop offset="100%" stopColor={fish.bodyColor} stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* 물고기 몸통 */}
            <ellipse
              cx="45"
              cy="30"
              rx="32"
              ry="19"
              fill={`url(#bodyGrad${fish.id})`}
            />

            {/* 꼬리 */}
            <path
              d="M12 30 Q-2 14 -6 18 Q2 30 -6 42 Q-2 46 12 30"
              fill={`url(#finGrad${fish.id})`}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-10 12 30; 10 12 30; -10 12 30"
                dur="0.35s"
                repeatCount="indefinite"
              />
            </path>

            {/* 등지느러미 */}
            <path
              d="M40 12 Q48 2 56 12"
              fill={fish.finColor}
              opacity="0.55"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-3 48 12; 3 48 12; -3 48 12"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* 배지느러미 */}
            <path
              d="M44 48 Q50 55 54 48"
              fill={fish.finColor}
              opacity="0.45"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="2 49 48; -2 49 48; 2 49 48"
                dur="0.6s"
                repeatCount="indefinite"
              />
            </path>

            {/* 가슴지느러미 */}
            <ellipse
              cx="52"
              cy="35"
              rx="7"
              ry="3.5"
              fill={fish.finColor}
              opacity="0.45"
              transform="rotate(-15 52 35)"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-20 52 35; -10 52 35; -20 52 35"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </ellipse>

            {/* 눈 - 작고 차분하게 */}
            <circle cx="64" cy="27" r="4.5" fill="white" opacity="0.9" />
            <circle cx="65" cy="26.5" r="2.5" fill="#2d3436" />
            <circle cx="66" cy="25.5" r="0.8" fill="white" opacity="0.8" />

            {/* 아가미 라인 */}
            <path
              d="M54 24 Q51 30 54 36"
              stroke={fish.finColor}
              strokeWidth="1.2"
              fill="none"
              opacity="0.3"
            />
          </svg>
        </div>
      ))}

      {/* 거품들 */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`bubble-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${10 + i * 14}%`,
            bottom: '-20px',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.1))',
            animation: `bubble ${8 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from "react";

// 몸통-꼬리 일체형 물고기 실루엣 (머리 고정, 꼬리만 흔들림)
function FishSilhouette({ size = 50, animationDelay = 0 }) {
  return (
    <svg
      width={size * 0.5}
      height={size}
      viewBox="0 0 50 100"
      fill="none"
      style={{ overflow: "visible" }}
    >
      {/* 몸통+꼬리 일체형 - 머리는 고정, 뒷부분+꼬리만 부드럽게 흔들림 */}
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

      {/* 옆 지느러미 (고정) */}
      <path
        d="M 14 28 C 6 32, 4 40, 8 44 C 10 41, 14 35, 14 30 Z"
        fill="white"
        opacity="0.12"
      />
      <path
        d="M 36 28 C 44 32, 46 40, 42 44 C 40 41, 36 35, 36 30 Z"
        fill="white"
        opacity="0.12"
      />
    </svg>
  );
}

// 개별 물고기 컴포넌트
function Fish({ initialX, initialY, initialVx, initialVy, size, animationDelay }) {
  const posRef = useRef({ x: initialX, y: initialY });
  const velRef = useRef({ vx: initialVx, vy: initialVy });
  const elementRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const speed = 0.25 + Math.random() * 0.15;

    const animate = () => {
      const pos = posRef.current;
      const vel = velRef.current;

      pos.x += vel.vx * speed;
      pos.y += vel.vy * speed;

      const maxX = window.innerWidth - size * 0.5;
      const maxY = window.innerHeight - size;

      if (pos.x <= 0 || pos.x >= maxX) {
        vel.vx *= -1;
        vel.vy += (Math.random() - 0.5) * 0.15;
        pos.x = Math.max(0, Math.min(pos.x, maxX));
      }

      if (pos.y <= 0 || pos.y >= maxY) {
        vel.vy *= -1;
        vel.vx += (Math.random() - 0.5) * 0.15;
        pos.y = Math.max(0, Math.min(pos.y, maxY));
      }

      // 속도 정규화
      const currentSpeed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
      const targetSpeed = 0.5;
      if (currentSpeed > 0) {
        const factor = targetSpeed / currentSpeed;
        vel.vx = vel.vx * 0.995 + vel.vx * factor * 0.005;
        vel.vy = vel.vy * 0.995 + vel.vy * factor * 0.005;
      }

      if (elementRef.current) {
        const moveAngle = Math.atan2(vel.vy, vel.vx) * (180 / Math.PI) + 90;
        elementRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${moveAngle}deg)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [size]);

  return (
    <div
      ref={elementRef}
      className="absolute will-change-transform"
      style={{
        transform: `translate(${initialX}px, ${initialY}px)`,
        transformOrigin: "center center",
      }}
    >
      <FishSilhouette size={size} animationDelay={animationDelay} />
    </div>
  );
}

export default function SwimmingFish() {
  const [fishList, setFishList] = useState([]);

  useEffect(() => {
    const generateFish = () => {
      const count = 8;
      const newFish = [];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const size = 40 + Math.random() * 25;

        newFish.push({
          id: i,
          initialX: x,
          initialY: y,
          initialVx: vx,
          initialVy: vy,
          size,
          animationDelay: Math.random() * 1,
        });
      }

      setFishList(newFish);
    };

    generateFish();

    const handleResize = () => generateFish();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  );
}

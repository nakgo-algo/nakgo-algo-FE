import { useState } from "react";
import MapPage from "./components/MapPage";
import CheckPage from "./components/CheckPage";
import RegulationsPage from "./components/RegulationsPage";
import FinesPage from "./components/FinesPage";
import CameraPage from "./components/CameraPage";
import SwimmingFish from "./components/SwimmingFish";

const pages = ["map", "check", "regulations", "fines", "camera"];

// 👇 기능명 → 사용자 행동 중심
const navLabels = [
  "위치 보기",
  "위반 판단",
  "규정 확인",
  "벌금 안내",
  "AI 분석",
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("map");
  const [locationStatus, setLocationStatus] = useState("pending");

  const handleLocationAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationStatus("active"),
        () => setLocationStatus("limited")
      );
    }
  };

  const handleLocationDeny = () => {
    setLocationStatus("inactive");
  };

  const renderPage = () => {
    const pageProps = {
      isActive: true,
      locationStatus,
      onLocationAllow: handleLocationAllow,
      onLocationDeny: handleLocationDeny,
    };

    switch (currentPage) {
      case "map":
        return <MapPage {...pageProps} />;
      case "check":
        return <CheckPage {...pageProps} />;
      case "regulations":
        return <RegulationsPage {...pageProps} />;
      case "fines":
        return <FinesPage {...pageProps} />;
      case "camera":
        return <CameraPage {...pageProps} />;
      default:
        return <MapPage {...pageProps} />;
    }
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative">
      {/* Swimming Fish Background */}
      <SwimmingFish />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-5 pt-[env(safe-area-inset-top)] h-14 flex items-center justify-between">
        <div className="flex flex-col leading-none">
          <span className="font-sans text-[17px] font-semibold tracking-[0.06em] text-white/90">
            낚고
          </span>
          <span className="font-sans text-[17px] font-light tracking-[0.1em] text-white/50">
            알고
          </span>
        </div>
        <div className="glass px-3 py-1.5">
          <span className="font-mono text-[9px] font-medium text-cyan-300/80">
            {locationStatus === "active" && "위치 ON"}
            {locationStatus === "limited" && "위치 제한"}
            {locationStatus === "inactive" && "위치 OFF"}
            {locationStatus === "pending" && "대기중"}
          </span>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 relative overflow-hidden">{renderPage()}</main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-4 mb-4 glass-strong flex justify-around items-center h-16">
          {pages.map((page, index) => {
            const isActive = currentPage === page;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-2 bg-transparent border-none cursor-pointer transition-all duration-300"
              >
                <span
                  className={`font-mono text-[10px] tracking-[0.05em] transition-all duration-300 ${
                    isActive
                      ? "font-bold text-white"
                      : "font-medium text-white/40"
                  }`}
                >
                  {navLabels[index]}
                </span>

                {/* 포인트는 dot 하나로만 (과하지 않게) */}
                <span
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Disclaimer */}
      <p className="absolute bottom-[calc(88px+env(safe-area-inset-bottom))] left-0 right-0 text-center font-mono text-[8px] text-white/25 tracking-wider px-8">
        본 서비스의 정보는 참고용이며 법적 효력이 없습니다
      </p>
    </div>
  );
}

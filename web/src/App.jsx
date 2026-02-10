import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MapPage from "./components/MapPage";
import CheckPage from "./components/CheckPage";
import RegulationsPage from "./components/RegulationsPage";
import FinesPage from "./components/FinesPage";
import CameraPage from "./components/CameraPage";
import CommunityPage from "./components/CommunityPage";
import ReportPage from "./components/ReportPage";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import SwimmingFish from "./components/SwimmingFish";
import Sidebar from "./components/Sidebar";

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("map");
  const [locationStatus, setLocationStatus] = useState("pending");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      onNavigate: setCurrentPage,
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
      case "community":
        return <CommunityPage {...pageProps} />;
      case "report":
        return <ReportPage {...pageProps} />;
      case "login":
        return <LoginPage onLoginSuccess={() => setCurrentPage("profile")} />;
      case "profile":
        return isLoggedIn ? (
          <ProfilePage onNavigate={setCurrentPage} />
        ) : (
          <LoginPage onLoginSuccess={() => setCurrentPage("profile")} />
        );
      default:
        return <MapPage {...pageProps} />;
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="h-dvh bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative">
      {/* Swimming Fish Background (지도, 게시판, 제보, 로그인, 프로필 페이지 제외) */}
      {!["map", "community", "report", "login", "profile"].includes(currentPage) && (
        <SwimmingFish />
      )}

      {/* Hamburger Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-0 left-0 z-50 mt-[env(safe-area-inset-top)] ml-4 w-12 h-12 flex items-center justify-center bg-transparent border-none cursor-pointer"
        aria-label="메뉴 열기"
      >
        <div
          className="w-6 h-5 flex flex-col justify-between transition-all duration-300"
          style={{ transform: isSidebarOpen ? "rotate(0deg)" : "rotate(0deg)" }}
        >
          <span
            className={`block h-[2px] bg-white/80 rounded-full transition-all duration-300 origin-left ${
              isSidebarOpen
                ? "rotate-45 translate-x-[1px] translate-y-[-1px] w-[26px]"
                : "w-6"
            }`}
          />
          <span
            className={`block h-[2px] bg-white/80 rounded-full transition-all duration-300 ${
              isSidebarOpen ? "opacity-0 w-0" : "opacity-100 w-4"
            }`}
          />
          <span
            className={`block h-[2px] bg-white/80 rounded-full transition-all duration-300 origin-left ${
              isSidebarOpen
                ? "-rotate-45 translate-x-[1px] translate-y-[1px] w-[26px]"
                : "w-5"
            }`}
          />
        </div>
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Page Content */}
      <main className="flex-1 relative overflow-hidden">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

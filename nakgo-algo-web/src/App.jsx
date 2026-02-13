import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
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
import NotificationsPage from "./components/NotificationsPage";
import ModerationPage from "./components/ModerationPage";
import api from "./api";

function AppContent() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState("map");
  const [locationStatus, setLocationStatus] = useState("pending");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await api.get("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // 페이지 전환 시 unread count 폴링
  useEffect(() => {
    fetchUnreadCount();
  }, [currentPage, fetchUnreadCount]);

  // 주기적 폴링 (30초)
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnreadCount]);

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

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page === "notifications") {
      setUnreadCount(0);
    }
  };

  const renderPage = () => {
    const pageProps = {
      isActive: true,
      locationStatus,
      onLocationAllow: handleLocationAllow,
      onLocationDeny: handleLocationDeny,
      onNavigate: handleNavigate,
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
      case "notifications":
        return <NotificationsPage />;
      case "moderation":
        return <ModerationPage />;
      case "login":
        return <LoginPage onLoginSuccess={() => handleNavigate("profile")} />;
      case "profile":
        return isLoggedIn ? (
          <ProfilePage onNavigate={handleNavigate} />
        ) : (
          <LoginPage onLoginSuccess={() => handleNavigate("profile")} />
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
      {/* Swimming Fish Background (지도, 게시판, 제보, 로그인, 프로필, 알림, 검토 페이지 제외) */}
      {!["map", "community", "report", "login", "profile", "notifications", "moderation"].includes(currentPage) && (
        <SwimmingFish />
      )}

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between mt-[env(safe-area-inset-top)]">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="ml-4 w-12 h-12 flex items-center justify-center bg-transparent border-none cursor-pointer"
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

        {/* Notification Bell */}
        {isLoggedIn && (
          <button
            onClick={() => handleNavigate("notifications")}
            className="mr-4 w-10 h-10 flex items-center justify-center relative"
            aria-label="알림"
          >
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Page Content */}
      <main className="flex-1 relative overflow-hidden">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

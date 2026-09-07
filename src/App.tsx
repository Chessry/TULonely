import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { CategoryView } from './components/views/CategoryView';
import { FindFriendsView } from './components/views/FindFriendsView';
import { RoomDetailView } from './components/views/RoomDetailView';
import { ProfileView } from './components/views/ProfileView';
import { OnboardingAuthView } from './components/views/OnboardingAuthView';
import { ResetPasswordView } from './components/views/ResetPasswordView';
import { CreateRoomModal } from './components/modals/CreateRoomModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { ReportModal } from './components/modals/ReportModal';
import { AuthModal } from './components/modals/AuthModal';
import { Toast } from './components/common/Toast';
import { Heart } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Global handler that catches Supabase Password Recovery redirects
 * regardless of whether Supabase bounced to Site URL (/) or another page.
 */
const AuthRecoveryHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Immediate URL check for recovery token in hash or query parameters
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isRecoveryUrl = hash.includes('type=recovery') || search.includes('type=recovery');

    if (isRecoveryUrl) {
      console.log('[AuthRecoveryHandler] Detected recovery token in URL');
      // Reset any previous expiry flags so new reset session starts fresh
      sessionStorage.removeItem('tulonely_reset_password_completed');
      sessionStorage.setItem('tulonely_reset_password_start_time', Date.now().toString());

      if (location.pathname !== '/reset-password') {
        navigate('/reset-password' + hash, { replace: true });
        return;
      }
    }

    // 2. Global listener for Supabase PASSWORD_RECOVERY event
    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, _session) => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('[AuthRecoveryHandler] Received PASSWORD_RECOVERY event -> navigating to /reset-password');
          sessionStorage.removeItem('tulonely_reset_password_completed');
          sessionStorage.setItem('tulonely_reset_password_start_time', Date.now().toString());
          if (location.pathname !== '/reset-password') {
            navigate('/reset-password', { replace: true });
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [navigate, location.pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { openCreateRoomFlow } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2D2D2D] font-prompt relative overflow-x-hidden selection:bg-[#8B1D1D] selection:text-white">
      <ScrollToTop />
      <AuthRecoveryHandler />

      {/* Frosted Glass Ambient Backdrop Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-[#8B1D1D]/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#F27D26]/20 rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 left-1/4 w-[28rem] h-[28rem] bg-[#5A5A40]/15 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-2/3 left-10 w-72 h-72 bg-[#E04B5A]/15 rounded-full blur-[110px]" />
      </div>

      {/* Top Navbar */}
      <Navbar />

      {/* Main View Container with React Router */}
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Activities routes */}
          <Route path="/activities" element={<ActivitiesView />} />
          <Route path="/activities/:activityId" element={<ActivitiesView />} />

          {/* Direct category routes as required (/eating, /sports, /study, etc.) */}
          <Route path="/eating" element={<CategoryView categoryOverride="food" />} />
          <Route path="/food" element={<CategoryView categoryOverride="food" />} />
          <Route path="/sports" element={<CategoryView categoryOverride="sports" />} />
          <Route path="/study" element={<CategoryView categoryOverride="study" />} />
          <Route path="/entertainment" element={<CategoryView categoryOverride="entertainment" />} />
          <Route path="/category/:categoryKey" element={<CategoryView />} />

          {/* Find Friends routes */}
          <Route path="/find-friends" element={<FindFriendsView />} />
          <Route path="/rooms" element={<FindFriendsView />} />

          {/* Dynamic Room detail route */}
          <Route path="/rooms/:roomId" element={<RoomDetailView />} />
          <Route path="/room/:roomId" element={<RoomDetailView />} />

          {/* Profile route */}
          <Route path="/profile" element={<ProfileView />} />

          {/* Auth & Onboarding routes */}
          <Route path="/auth" element={<OnboardingAuthView />} />
          <Route path="/login" element={<OnboardingAuthView />} />
          <Route path="/register" element={<OnboardingAuthView />} />
          <Route path="/forgot-password" element={<OnboardingAuthView defaultMode="forgot" />} />
          <Route path="/reset-password" element={<ResetPasswordView />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Frosted Glass Footer */}
      <footer className="relative z-10 pt-10 pb-24 md:pb-10 px-4 sm:px-6 lg:px-8 text-xs text-[#666]">
        <div className="max-w-6xl mx-auto">
          {/* Frosted Glass Footer Container */}
          <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-white/70 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xl font-kanit text-[#8B1D1D]">TU<span className="text-[#F27D26]">lonely</span> 👀</span>
              <span className="text-[11px] text-[#777]">| ไม่ต้องเหงาอีกต่อไป</span>
            </div>

            <p className="text-center sm:text-left text-[11px] text-[#555] flex items-center gap-1">
              สร้างด้วย <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> เพื่อเพื่อนๆ นักศึกษามหาวิทยาลัยธรรมศาสตร์
            </p>

            <div className="flex items-center gap-3 text-[11px] font-medium text-[#444]">
              <Link
                to="/activities"
                className="hover:text-[#8B1D1D] transition-colors cursor-pointer"
              >
                กิจกรรม มธ.
              </Link>
              <span>•</span>
              <Link
                to="/find-friends"
                className="hover:text-[#8B1D1D] transition-colors cursor-pointer"
              >
                หาเพื่อนทั้งหมด
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => openCreateRoomFlow()}
                className="text-[#8B1D1D] font-bold hover:underline cursor-pointer"
              >
                สร้างห้อง +
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-[#888] mt-4 uppercase tracking-[0.18em]">
            Thammasat University Community Portal — Created with ❤️ by Students
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <CreateRoomModal />
      <NotificationDrawer />
      <ReportModal />
      <AuthModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

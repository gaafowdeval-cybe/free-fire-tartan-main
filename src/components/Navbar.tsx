import React, { useState } from 'react';
import { User, Notification } from '../types';
import {
  Trophy,
  Users,
  Tv,
  BookOpen,
  Bell,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenSignUp,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onDeleteNotification,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter notifications for current user or admin
  const userNotifs = notifications.filter((n) => {
    if (currentUser?.role === 'admin') return n.userId === 'admin';
    return n.userId === currentUser?.id || n.userId === 'all';
  });

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-20 bg-[#0c0e16]/90 backdrop-blur-xl border-b border-[#3b494b]/30 shadow-[0_0_15px_rgba(0,219,233,0.1)]">
      {/* Brand Logo */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 font-display text-2xl md:text-3xl text-[#00f0ff] tracking-tighter italic uppercase font-bold text-left cursor-pointer group"
        >
          <Sparkles className="w-6 h-6 text-[#00f0ff] animate-pulse group-hover:rotate-12 transition-transform" />
          <span>TARTAN OMAR SAID FF</span>
        </button>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`font-display text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`font-display text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'tournaments'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`font-display text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'rankings'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            Rankings
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`font-display text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'winners'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            Winners
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`font-display text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`font-display text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'live'
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff] pb-1'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Live Streams
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 text-[#b9cacb] hover:text-[#00f0ff] transition-all rounded-full hover:bg-[#00f0ff]/10 relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 glass-panel rounded-xl shadow-2xl border border-[#3b494b]/50 p-4 z-50 text-left">
                <div className="flex justify-between items-center pb-3 border-b border-[#3b494b]/30">
                  <h4 className="font-display font-bold text-white text-sm">Notifications</h4>
                  <span className="text-xs text-[#00f0ff]">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto my-2 space-y-2 divide-y divide-[#3b494b]/20">
                  {userNotifs.length === 0 ? (
                    <p className="text-xs text-center text-[#b9cacb] py-4">No notifications yet.</p>
                  ) : (
                    userNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`pt-2 flex justify-between items-start gap-2 ${
                          !n.isRead ? 'bg-[#00f0ff]/5 p-2 rounded' : ''
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{n.title}</p>
                          <p className="text-xs text-[#b9cacb] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!n.isRead && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="text-[#00f0ff] hover:text-white p-1"
                              title="Mark as Read"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteNotification(n.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current User Role / Actions & Avatar */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin-dashboard' : 'user-dashboard')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                src={
                  currentUser.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                }
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform"
              />
            </div>

            {currentUser.role === 'admin' ? (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3.5 py-2 rounded-lg text-xs font-display font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-[#00f0ff] text-[#00363a] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-[#282a32] text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('user-dashboard')}
                className={`px-3.5 py-2 rounded-lg text-xs font-display font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'user-dashboard'
                    ? 'bg-[#00f0ff] text-[#00363a] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-[#282a32] text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[#00f0ff]/10'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">My Dashboard</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="p-2 text-[#b9cacb] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex gap-3">
            <button
              onClick={onOpenLogin}
              className="px-5 py-2 bg-transparent text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 transition-all font-display text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onOpenSignUp}
              className="px-5 py-2 bg-[#00f0ff] text-[#00363a] font-display text-xs font-bold uppercase tracking-wider rounded hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              Join Now
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#00f0ff] cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0c0e16]/95 border-b border-[#3b494b]/40 backdrop-blur-2xl p-6 flex flex-col gap-4 z-50">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-[#e2e1ee] hover:text-[#00f0ff] py-2 border-b border-[#3b494b]/20"
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('tournaments');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-[#e2e1ee] hover:text-[#00f0ff] py-2 border-b border-[#3b494b]/20"
          >
            Tournaments
          </button>
          <button
            onClick={() => {
              setActiveTab('rankings');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-[#e2e1ee] hover:text-[#00f0ff] py-2 border-b border-[#3b494b]/20"
          >
            Rankings
          </button>
          <button
            onClick={() => {
              setActiveTab('winners');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-[#e2e1ee] hover:text-[#00f0ff] py-2 border-b border-[#3b494b]/20"
          >
            Winners
          </button>
          <button
            onClick={() => {
              setActiveTab('rules');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-[#e2e1ee] hover:text-[#00f0ff] py-2 border-b border-[#3b494b]/20"
          >
            Rules
          </button>
          <button
            onClick={() => {
              setActiveTab('live');
              setMobileMenuOpen(false);
            }}
            className="text-left font-display font-semibold text-red-400 hover:text-red-300 py-2 border-b border-[#3b494b]/20"
          >
            Live Streams
          </button>

          {!currentUser && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 border border-[#00f0ff] text-[#00f0ff] font-display font-bold text-xs uppercase text-center rounded"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onOpenSignUp();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase text-center rounded"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

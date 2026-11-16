import React, { useState, useEffect } from 'react'
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { driveService } from '../../services/driveService'

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let mounted = true
    async function fetchNotifications() {
      try {
        const notifs = await driveService.getNotifications()
        if (mounted && Array.isArray(notifs)) {
          setNotifications(notifs)
          const unread = notifs.filter((n) => !n.is_read).length
          setUnreadCount(unread)
        }
      } catch (e) {
        // Silent catch for background notification poll
      }
    }

    if (user) {
      fetchNotifications()
    }
    return () => {
      mounted = false
    }
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleName = user?.role ? user.role.replace('_', ' ') : 'USER'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile Toggle & Brand / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>PLACEMENT360</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">{roleName}</span>
        </div>
      </div>

      {/* Right side: Quick Search, Status, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          API Connected
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] font-medium text-slate-500">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Quick Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.email ? user.email.split('@')[0] : 'User'}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

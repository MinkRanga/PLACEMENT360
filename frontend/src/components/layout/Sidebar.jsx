import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  BarChart3,
  Users,
  Layers,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role || 'STUDENT'

  const navConfigs = {
    TPO_ADMIN: [
      {
        section: 'Core Management',
        items: [
          { name: 'Executive Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Placement Drives', path: '/admin/drives', icon: Briefcase },
          { name: 'Student Registry', path: '/admin/students', icon: GraduationCap },
          { name: 'Corporate Partners', path: '/admin/companies', icon: Building2 },
        ],
      },
      {
        section: 'MIS & Analytics',
        items: [
          { name: 'MIS & DSS Reports', path: '/admin/reports', icon: BarChart3 },
        ],
      },
    ],
    STUDENT: [
      {
        section: 'Student Portal',
        items: [
          { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Eligible Drives', path: '/student/drives', icon: Briefcase },
          { name: 'Applications & Status', path: '/student/applications', icon: FileText },
          { name: 'Academic Profile', path: '/student/profile', icon: GraduationCap },
        ],
      },
    ],
    RECRUITER: [
      {
        section: 'Recruitment Hub',
        items: [
          { name: 'Recruiter Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
          { name: 'Placement Drives', path: '/recruiter/drives', icon: Briefcase },
          { name: 'Candidate Funnel', path: '/recruiter/applications', icon: Users },
          { name: 'Company Profile', path: '/recruiter/profile', icon: Building2 },
        ],
      },
    ],
  }

  const sections = navConfigs[role] || navConfigs.STUDENT

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
              PLACEMENT<span className="text-indigo-400">360</span>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-0.5">
              Enterprise MIS
            </span>
          </div>
        </div>

        {/* Role Tag */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Role Context</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase">
            {role.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {sections.map((sec) => (
            <div key={sec.section}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {sec.section}
              </p>
              <nav className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.email || 'Logged In User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

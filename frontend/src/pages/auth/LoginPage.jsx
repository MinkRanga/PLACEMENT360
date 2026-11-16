import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Layers,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building2,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { login } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Pre-configured test accounts for quick demo evaluation
  const demoAccounts = [
    {
      role: 'TPO Administrator',
      email: 'admin@placement360.edu',
      password: 'AdminSecurePass2026!',
      icon: ShieldCheck,
      color: 'hover:border-indigo-500 hover:bg-indigo-50/50',
    },
    {
      role: 'Student Candidate',
      email: 'student@placement360.edu',
      password: 'StudentPass2026!',
      icon: GraduationCap,
      color: 'hover:border-emerald-500 hover:bg-emerald-50/50',
    },
    {
      role: 'Corporate Recruiter',
      email: 'recruiter@techcorp.com',
      password: 'RecruiterPass2026!',
      icon: Building2,
      color: 'hover:border-purple-500 hover:bg-purple-50/50',
    },
  ]

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both your institutional email and password.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg('')
      const user = await login(email, password)
      success(`Welcome back! Logged in as ${user.email}`)

      // Redirect to specific dashboard based on role
      const from = location.state?.from?.pathname
      if (from && from !== '/login') {
        navigate(from, { replace: true })
      } else if (user.role === 'TPO_ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Authentication failed. Please verify your credentials or register a new account.'
      setErrorMsg(detail)
      toastError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-white">
              PLACEMENT<span className="text-indigo-400">360</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Unified Portal
            </span>
          </div>
        </Link>
        <h2 className="mt-6 text-2xl font-black text-white tracking-tight">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter credentials or use the quick demo presets below to test.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-100">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="e.g. user@placement360.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full text-base font-bold shadow-md shadow-indigo-600/20"
                iconRight={ArrowRight}
              >
                Sign In to Placement360
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Demo Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((d) => {
                const Icon = d.icon
                return (
                  <button
                    key={d.role}
                    type="button"
                    onClick={() => handleDemoFill(d.email, d.password)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 transition-all text-center cursor-pointer ${d.color}`}
                  >
                    <Icon className="w-4 h-4 text-indigo-600 mb-1" />
                    <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                      {d.role.split(' ')[0]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Registration Redirects */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don't have an account yet?
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <Link
                to="/register/student"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Student Registration &rarr;
              </Link>
              <span className="text-slate-300">&bull;</span>
              <Link
                to="/register/recruiter"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Recruiter Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

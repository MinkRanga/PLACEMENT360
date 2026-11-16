import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Layers,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Mail,
  Lock,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function RegisterAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminSecret, setAdminSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { registerAdmin } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please specify an official administrator email and password.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg('')
      const payload = {
        email: email.trim().toLowerCase(),
        password: password,
        admin_secret: adminSecret ? adminSecret.trim() : null,
      }

      await registerAdmin(payload)
      success('TPO Administrator profile seeded & logged in successfully.')
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Failed to provision TPO administrator account. Please verify credentials.'
      setErrorMsg(detail)
      toastError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-white">
            PLACEMENT<span className="text-indigo-400">360</span>
          </span>
        </Link>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privileged Provisioning Only</span>
        </div>
        <h2 className="mt-3 text-2xl font-black text-white tracking-tight">
          TPO Administrator Setup
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Configure an authorized placement cell controller or executive account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-100">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="TPO Administrative Email"
              type="email"
              icon={Mail}
              placeholder="admin@placement360.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Master Password (min 6 characters)"
              type="password"
              icon={Lock}
              placeholder="Secure passphrase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Provisioning Secret Key (Optional)"
              type="password"
              icon={KeyRound}
              placeholder="Institutional root key (if configured)"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              helperText="Enables initial bootstrapping of the university placement cell."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
                iconRight={ArrowRight}
                className="w-full text-base font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Seed Administrator
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              &larr; Return to Standard Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Layers,
  ArrowRight,
  AlertCircle,
  Plus,
  Briefcase,
  Mail,
  Lock,
  Phone,
  Globe,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { companyService } from '../../services/companyService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

export default function RegisterRecruiterPage() {
  const [companies, setCompanies] = useState([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Modal to register new company if not in list
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    industry: 'Information Technology',
    tier: 'TIER_1',
    website: 'https://',
    address: 'Bengaluru, India',
  })
  const [creatingCompany, setCreatingCompany] = useState(false)

  const { registerRecruiter } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_id: '',
    designation: 'Talent Acquisition Lead',
    phone: '',
    is_primary_contact: true,
  })

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const data = await companyService.getCompanies()
      setCompanies(data || [])
      if (data && data.length > 0 && !formData.company_id) {
        setFormData((prev) => ({ ...prev, company_id: data[0].id }))
      }
    } catch (err) {
      console.error('Failed to load companies', err)
    } finally {
      setLoadingCompanies(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCreateCompany = async (e) => {
    e.preventDefault()
    if (!newCompanyData.name.trim()) return

    try {
      setCreatingCompany(true)
      const created = await companyService.createCompany(newCompanyData)
      success(`Company "${created.name}" registered successfully!`)
      await loadCompanies()
      setFormData((prev) => ({ ...prev, company_id: created.id }))
      setIsCompanyModalOpen(false)
    } catch (err) {
      toastError(err.response?.data?.detail || 'Failed to create company')
    } finally {
      setCreatingCompany(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.company_id) {
      setErrorMsg('Please select or register your corporate entity.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        company_id: formData.company_id,
        designation: formData.designation.trim() || 'Recruitment Coordinator',
        phone: formData.phone.trim() || null,
        is_primary_contact: Boolean(formData.is_primary_contact),
      }

      await registerRecruiter(payload)
      success('Corporate recruiter access activated. Welcome to Placement360.')
      navigate('/recruiter/dashboard', { replace: true })
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Registration failed. Please check your credentials.'
      setErrorMsg(detail)
      toastError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white">
              PLACEMENT<span className="text-indigo-400">360</span>
            </span>
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
            Corporate Recruiter Registration
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Partner with the University placement ecosystem to post drives and evaluate talent.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Affiliated Organization
                </label>
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Register New Company
                </button>
              </div>

              {companies.length > 0 ? (
                <Select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  options={companies.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.tier.replace('_', ' ')}) - ${c.industry}`,
                  }))}
                  required
                />
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No company records found. Click above to register your organization first.
                </div>
              )}
            </div>

            {/* Recruiter Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Recruiter Account Profile
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Work Email"
                  type="email"
                  name="email"
                  icon={Mail}
                  placeholder="recruiter@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Password (min 6 characters)"
                  type="password"
                  name="password"
                  icon={Lock}
                  placeholder="Choose password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Corporate Designation"
                  name="designation"
                  placeholder="e.g. Lead Talent Scout"
                  value={formData.designation}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="phone"
                  icon={Phone}
                  placeholder="+91 99887 76655"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  name="is_primary_contact"
                  checked={formData.is_primary_contact}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_primary" className="text-xs font-medium text-slate-700">
                  Designate as primary placement coordinator for this enterprise
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Already registered? Sign In &rarr;
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                iconRight={ArrowRight}
                className="w-full sm:w-auto font-bold"
              >
                Activate Recruiter Hub
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal to Register New Company */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Register Enterprise Partner"
        subtitle="Onboard a new corporate entity to PLACEMENT360"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompanyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={creatingCompany}
              onClick={handleCreateCompany}
            >
              Create Company
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Acme Cloud Corp"
            value={newCompanyData.name}
            onChange={(e) =>
              setNewCompanyData((p) => ({ ...p, name: e.target.value }))
            }
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Industry"
              placeholder="e.g. Fintech, SaaS"
              value={newCompanyData.industry}
              onChange={(e) =>
                setNewCompanyData((p) => ({ ...p, industry: e.target.value }))
              }
            />
            <Select
              label="Tier Classification"
              value={newCompanyData.tier}
              onChange={(e) =>
                setNewCompanyData((p) => ({ ...p, tier: e.target.value }))
              }
              options={[
                { value: 'TIER_1', label: 'Tier 1 (Dream / Super Dream)' },
                { value: 'TIER_2', label: 'Tier 2 (Core / Premium)' },
                { value: 'TIER_3', label: 'Tier 3 (Mass / Standard)' },
              ]}
            />
          </div>
          <Input
            label="Corporate Website"
            icon={Globe}
            placeholder="https://acme.com"
            value={newCompanyData.website}
            onChange={(e) =>
              setNewCompanyData((p) => ({ ...p, website: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  )
}

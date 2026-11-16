import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  ArrowRight,
  AlertCircle,
  BookOpen,
  User,
  Mail,
  Lock,
  Phone,
  Hash,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { departmentService } from '../../services/departmentService'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'

export default function RegisterStudentPage() {
  const [departments, setDepartments] = useState([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { registerStudent } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    roll_number: '',
    department_id: '',
    batch_year: 2026,
    gender: 'MALE',
    cgpa: '8.50',
    tenth_percentage: '88.0',
    twelfth_percentage: '85.0',
    active_backlogs: 0,
    history_backlogs: 0,
    phone: '',
    skills_raw: 'Python, SQL, React, Data Structures',
  })

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await departmentService.getDepartments()
        setDepartments(data || [])
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to load departments', err)
      } finally {
        setLoadingDepts(false)
      }
    }
    loadDepts()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.department_id) {
      setErrorMsg('Please select your academic department.')
      return
    }

    try {
      setSubmitting(true)
      const skillsArray = formData.skills_raw
        ? formData.skills_raw.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        roll_number: formData.roll_number.trim().toUpperCase(),
        department_id: formData.department_id,
        batch_year: parseInt(formData.batch_year, 10),
        gender: formData.gender,
        cgpa: parseFloat(formData.cgpa),
        tenth_percentage: formData.tenth_percentage ? parseFloat(formData.tenth_percentage) : null,
        twelfth_percentage: formData.twelfth_percentage ? parseFloat(formData.twelfth_percentage) : null,
        active_backlogs: parseInt(formData.active_backlogs, 10) || 0,
        history_backlogs: parseInt(formData.history_backlogs, 10) || 0,
        phone: formData.phone.trim() || null,
        skills: skillsArray,
      }

      await registerStudent(payload)
      success('Student registration successful! Welcome to Placement360.')
      navigate('/student/dashboard', { replace: true })
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail.map((d) => d.msg).join(', ')
          : 'Registration failed. Please review your entries.')
      setErrorMsg(detail)
      toastError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl mx-auto">
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
            Student Profile Onboarding
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Create your account to unlock automated placement eligibility and drive applications.
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
            {/* Section 1: Credentials */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> Account &amp; Identity
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  placeholder="e.g. Rahul"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  placeholder="e.g. Sharma"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email (Institutional / Primary)"
                  type="email"
                  name="email"
                  icon={Mail}
                  placeholder="rsharma@placement360.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Password (min 6 characters)"
                  type="password"
                  name="password"
                  icon={Lock}
                  placeholder="Choose strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Section 2: Academic Record */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Academic &amp; Institutional Profile
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  label="University Roll No"
                  name="roll_number"
                  icon={Hash}
                  placeholder="e.g. 22CSE045"
                  value={formData.roll_number}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Department"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  options={departments.map((d) => ({
                    value: d.id,
                    label: `${d.code} - ${d.name}`,
                  }))}
                  required
                />
                <Input
                  label="Graduation Batch Year"
                  type="number"
                  name="batch_year"
                  placeholder="2026"
                  value={formData.batch_year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-4 gap-4 mt-4">
                <Input
                  label="Current CGPA (0 - 10)"
                  type="number"
                  step="0.01"
                  name="cgpa"
                  placeholder="8.50"
                  value={formData.cgpa}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="10th Percentage"
                  type="number"
                  step="0.1"
                  name="tenth_percentage"
                  placeholder="85.5"
                  value={formData.tenth_percentage}
                  onChange={handleChange}
                />
                <Input
                  label="12th Percentage"
                  type="number"
                  step="0.1"
                  name="twelfth_percentage"
                  placeholder="88.0"
                  value={formData.twelfth_percentage}
                  onChange={handleChange}
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Active Backlogs"
                  type="number"
                  name="active_backlogs"
                  value={formData.active_backlogs}
                  onChange={handleChange}
                />
                <Input
                  label="History Backlogs"
                  type="number"
                  name="history_backlogs"
                  value={formData.history_backlogs}
                  onChange={handleChange}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Technical Skills (comma-separated)"
                  name="skills_raw"
                  placeholder="Python, Java, React, SQL, Machine Learning"
                  value={formData.skills_raw}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Already have an account? Sign In &rarr;
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                iconRight={ArrowRight}
                className="w-full sm:w-auto font-bold"
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

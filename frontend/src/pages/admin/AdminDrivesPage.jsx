import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Award,
  Building2,
  Eye,
  Edit2,
  RefreshCw,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { companyService } from '../../services/companyService'
import { departmentService } from '../../services/departmentService'
import { useToast } from '../../hooks/useToast'

const DRIVE_STATUSES = [
  'DRAFT',
  'ANNOUNCED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]

const DRIVE_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time (FTE)' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'INTERN_PLUS_FTE', label: 'Intern + FTE' },
]

const GENDER_OPTIONS = [
  { value: 'ALL', label: 'All Candidates' },
  { value: 'MALE_ONLY', label: 'Male Only' },
  { value: 'FEMALE_ONLY', label: 'Female Only' },
]

function getStatusBadgeVariant(status) {
  switch (status) {
    case 'REGISTRATION_OPEN':
    case 'ACTIVE':
      return 'success'
    case 'ANNOUNCED':
    case 'IN_PROGRESS':
      return 'info'
    case 'COMPLETED':
      return 'neutral'
    case 'CANCELLED':
      return 'danger'
    case 'REGISTRATION_CLOSED':
    case 'DRAFT':
    default:
      return 'warning'
  }
}

const emptyFormState = {
  company_id: '',
  title: '',
  job_role: '',
  job_description: '',
  job_location: '',
  package_lpa: '',
  drive_type: 'FULL_TIME',
  status: 'DRAFT',
  registration_start_date: '',
  registration_end_date: '',
  drive_date: '',
  batch_year: 2026,
  allowed_department_ids: [],
  min_cgpa: '0.0',
  min_tenth_percentage: '0.0',
  min_twelfth_percentage: '0.0',
  max_active_backlogs: 0,
  max_history_backlogs: 0,
  gender_allowed: 'ALL',
  allow_already_placed: false,
  required_skills: '',
}

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState([])
  const [companies, setCompanies] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [batchFilter, setBatchFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [packageFilter, setPackageFilter] = useState('ALL')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedDrive, setSelectedDrive] = useState(null)

  // Form State
  const [formData, setFormData] = useState(emptyFormState)
  const [formErrors, setFormErrors] = useState({})

  const { success, error: toastError } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [drivesData, comps, depts] = await Promise.all([
        driveService.getDrives().catch(() => ({ items: [] })),
        companyService.getCompanies().catch(() => []),
        departmentService.getDepartments().catch(() => []),
      ])

      const list = Array.isArray(drivesData?.items)
        ? drivesData.items
        : Array.isArray(drivesData)
          ? drivesData
          : []

      setDrives(list)
      setCompanies(comps || [])
      setDepartments(depts || [])
    } catch (err) {
      console.error('Error fetching drives data:', err)
      toastError('Failed to load placement drives records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      // Search term: title, role, company name
      const q = search.trim().toLowerCase()
      const companyName = d.company?.name || ''
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.job_role.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q)

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' || d.status === statusFilter

      // Batch filter
      const matchesBatch =
        batchFilter === 'ALL' || String(d.batch_year) === String(batchFilter)

      // Department filter
      const matchesDept =
        deptFilter === 'ALL' ||
        (Array.isArray(d.allowed_departments) &&
          d.allowed_departments.some((dept) => dept.id === deptFilter))

      // Package filter
      const pkg = parseFloat(d.package_lpa || 0)
      let matchesPackage = true
      if (packageFilter === 'UNDER_6') {
        matchesPackage = pkg < 6
      } else if (packageFilter === '6_TO_12') {
        matchesPackage = pkg >= 6 && pkg <= 12
      } else if (packageFilter === 'ABOVE_12') {
        matchesPackage = pkg > 12
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBatch &&
        matchesDept &&
        matchesPackage
      )
    })
  }, [drives, search, statusFilter, batchFilter, deptFilter, packageFilter])

  // Extract distinct batch years for filter dropdown
  const batchYears = useMemo(() => {
    const years = new Set(drives.map((d) => d.batch_year).filter(Boolean))
    return Array.from(years).sort((a, b) => b - a)
  }, [drives])

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Handle Department Checkboxes
  const handleDeptToggle = (deptId) => {
    setFormData((prev) => {
      const exists = prev.allowed_department_ids.includes(deptId)
      return {
        ...prev,
        allowed_department_ids: exists
          ? prev.allowed_department_ids.filter((id) => id !== deptId)
          : [...prev.allowed_department_ids, deptId],
      }
    })
  }

  // Form Validation
  const validateForm = () => {
    const errors = {}
    if (!formData.company_id) errors.company_id = 'Please select a company'
    if (!formData.title?.trim()) errors.title = 'Drive title is required'
    if (!formData.job_role?.trim()) errors.job_role = 'Job role is required'
    if (!formData.job_description?.trim())
      errors.job_description = 'Job description is required'
    if (
      !formData.package_lpa ||
      isNaN(formData.package_lpa) ||
      parseFloat(formData.package_lpa) <= 0
    ) {
      errors.package_lpa = 'Valid package (LPA) is required'
    }
    if (!formData.batch_year) errors.batch_year = 'Target batch year is required'

    if (
      formData.registration_start_date &&
      formData.registration_end_date &&
      new Date(formData.registration_end_date) <
        new Date(formData.registration_start_date)
    ) {
      errors.registration_end_date =
        'Registration deadline cannot be earlier than start date'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      ...emptyFormState,
      batch_year: new Date().getFullYear(),
      allowed_department_ids: departments.map((d) => d.id),
    })
    setFormErrors({})
    setCreateModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (drive) => {
    setSelectedDrive(drive)
    const crit = drive.eligibility_criteria || {}
    setFormData({
      company_id: drive.company_id || '',
      title: drive.title || '',
      job_role: drive.job_role || '',
      job_description: drive.job_description || '',
      job_location: drive.job_location || '',
      package_lpa: drive.package_lpa || '',
      drive_type: drive.drive_type || 'FULL_TIME',
      status: drive.status || 'DRAFT',
      registration_start_date: drive.registration_start_date
        ? drive.registration_start_date.slice(0, 10)
        : '',
      registration_end_date: drive.registration_end_date
        ? drive.registration_end_date.slice(0, 10)
        : '',
      drive_date: drive.drive_date ? drive.drive_date.slice(0, 10) : '',
      batch_year: drive.batch_year || 2026,
      allowed_department_ids: Array.isArray(drive.allowed_departments)
        ? drive.allowed_departments.map((d) => d.id)
        : [],
      min_cgpa: crit.min_cgpa ?? '0.0',
      min_tenth_percentage: crit.min_tenth_percentage ?? '0.0',
      min_twelfth_percentage: crit.min_twelfth_percentage ?? '0.0',
      max_active_backlogs: crit.max_active_backlogs ?? 0,
      max_history_backlogs: crit.max_history_backlogs ?? 0,
      gender_allowed: crit.gender_allowed || 'ALL',
      allow_already_placed: Boolean(crit.allow_already_placed),
      required_skills: Array.isArray(crit.required_skills)
        ? crit.required_skills.join(', ')
        : '',
    })
    setFormErrors({})
    setEditModalOpen(true)
  }

  // Open Details Modal
  const handleOpenDetails = (drive) => {
    setSelectedDrive(drive)
    setDetailsModalOpen(true)
  }

  // Submit Create Drive
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      const payload = {
        company_id: formData.company_id,
        title: formData.title.trim(),
        job_role: formData.job_role.trim(),
        job_description: formData.job_description.trim(),
        job_location: formData.job_location?.trim() || null,
        package_lpa: parseFloat(formData.package_lpa),
        drive_type: formData.drive_type,
        status: formData.status,
        registration_start_date: formData.registration_start_date
          ? new Date(formData.registration_start_date).toISOString()
          : null,
        registration_end_date: formData.registration_end_date
          ? new Date(formData.registration_end_date).toISOString()
          : null,
        drive_date: formData.drive_date
          ? new Date(formData.drive_date).toISOString()
          : null,
        batch_year: parseInt(formData.batch_year, 10),
        allowed_department_ids: formData.allowed_department_ids,
        eligibility_criteria: {
          min_cgpa: parseFloat(formData.min_cgpa || 0),
          min_tenth_percentage: parseFloat(formData.min_tenth_percentage || 0),
          min_twelfth_percentage: parseFloat(
            formData.min_twelfth_percentage || 0
          ),
          max_active_backlogs: parseInt(formData.max_active_backlogs || 0, 10),
          max_history_backlogs: parseInt(
            formData.max_history_backlogs || 0,
            10
          ),
          gender_allowed: formData.gender_allowed,
          allow_already_placed: Boolean(formData.allow_already_placed),
          allowed_batch_years: [parseInt(formData.batch_year, 10)],
          required_skills: formData.required_skills
            ? formData.required_skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
      }

      await driveService.createDrive(payload)
      success('Placement drive created successfully!')
      setCreateModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Failed to create drive:', err)
      toastError(
        err.response?.data?.detail ||
          'Failed to create placement drive. Please check all fields.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Edit Drive
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm() || !selectedDrive) return

    try {
      setSubmitting(true)
      const payload = {
        title: formData.title.trim(),
        job_role: formData.job_role.trim(),
        job_description: formData.job_description.trim(),
        job_location: formData.job_location?.trim() || null,
        package_lpa: parseFloat(formData.package_lpa),
        drive_type: formData.drive_type,
        status: formData.status,
        registration_start_date: formData.registration_start_date
          ? new Date(formData.registration_start_date).toISOString()
          : null,
        registration_end_date: formData.registration_end_date
          ? new Date(formData.registration_end_date).toISOString()
          : null,
        drive_date: formData.drive_date
          ? new Date(formData.drive_date).toISOString()
          : null,
        batch_year: parseInt(formData.batch_year, 10),
        allowed_department_ids: formData.allowed_department_ids,
        eligibility_criteria: {
          min_cgpa: parseFloat(formData.min_cgpa || 0),
          min_tenth_percentage: parseFloat(formData.min_tenth_percentage || 0),
          min_twelfth_percentage: parseFloat(
            formData.min_twelfth_percentage || 0
          ),
          max_active_backlogs: parseInt(formData.max_active_backlogs || 0, 10),
          max_history_backlogs: parseInt(
            formData.max_history_backlogs || 0,
            10
          ),
          gender_allowed: formData.gender_allowed,
          allow_already_placed: Boolean(formData.allow_already_placed),
          allowed_batch_years: [parseInt(formData.batch_year, 10)],
          required_skills: formData.required_skills
            ? formData.required_skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
      }

      await driveService.updateDrive(selectedDrive.id, payload)
      success('Placement drive updated successfully!')
      setEditModalOpen(false)
      loadData()
    } catch (err) {
      console.error('Failed to update drive:', err)
      toastError(
        err.response?.data?.detail || 'Failed to update placement drive.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Quick Status Update
  const handleStatusChange = async (driveId, newStatus) => {
    try {
      await driveService.updateDriveStatus(driveId, newStatus)
      success('Drive status updated to ' + newStatus)
      loadData()
      if (selectedDrive && selectedDrive.id === driveId) {
        setSelectedDrive((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      toastError(
        err.response?.data?.detail || 'Failed to update drive status.'
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Placement Drives Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campus hiring drives, eligibility policies, and recruitment timelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            iconLeft={RefreshCw}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconLeft={Plus}
            onClick={handleOpenCreate}
          >
            Create New Drive
          </Button>
        </div>
      </div>

      {/* Drives Table Card */}
      <Card>
        {/* Search & Filter Toolbar */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                icon={Search}
                placeholder="Search by company, title, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {DRIVE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Year Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              >
                <option value="ALL">All Batch Years</option>
                {batchYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Class of {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                value={packageFilter}
                onChange={(e) => setPackageFilter(e.target.value)}
              >
                <option value="ALL">All Package Bands</option>
                <option value="UNDER_6">&lt; 6.0 LPA</option>
                <option value="6_TO_12">6.0 - 12.0 LPA</option>
                <option value="ABOVE_12">&gt; 12.0 LPA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drives Table */}
        {loading ? (
          <LoadingSpinner message="Fetching campus recruitment drives..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Drive &amp; Company</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration End</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching placement drives found. Click &quot;Create New Drive&quot; to post an opening.
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{d.company?.name || 'Partner Company'}</span>
                        </div>
                      </td>

                      {/* Job Role & Type */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div>{d.job_role}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {d.drive_type?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Batch Year */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {d.batch_year}
                      </td>

                      {/* Package */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {d.package_lpa != null ? d.package_lpa + ' LPA' : 'Not specified'}
                      </td>

                      {/* Lifecycle Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          className="text-[11px] font-bold py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={d.status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        >
                          {DRIVE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Deadline Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {d.registration_end_date
                          ? new Date(d.registration_end_date).toLocaleDateString()
                          : 'No deadline'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          iconLeft={Eye}
                          onClick={() => handleOpenDetails(d)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          iconLeft={Edit2}
                          onClick={() => handleOpenEdit(d)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE DRIVE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Campus Placement Drive"
        subtitle="Configure requisition details, target academic batch, and eligibility rules."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs">
          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Participating Company <span className="text-rose-500">*</span>
              </label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
              {formErrors.company_id && (
                <p className="text-rose-500 text-[11px] mt-1">
                  {formErrors.company_id}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive Title <span className="text-rose-500">*</span>
              </label>
              <Input
                name="title"
                placeholder="e.g. Google Software Engineering Campus Drive 2026"
                value={formData.title}
                onChange={handleInputChange}
                error={formErrors.title}
              />
            </div>
          </div>

          {/* Job Role, Location & Drive Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Job Role / Title <span className="text-rose-500">*</span>
              </label>
              <Input
                name="job_role"
                placeholder="e.g. SDE-1, Cloud Engineer"
                value={formData.job_role}
                onChange={handleInputChange}
                error={formErrors.job_role}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Job Location
              </label>
              <Input
                name="job_location"
                placeholder="e.g. Bangalore / Remote"
                value={formData.job_location}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive Type
              </label>
              <select
                name="drive_type"
                value={formData.drive_type}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DRIVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Package, Batch Year & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Package (CTC in LPA) <span className="text-rose-500">*</span>
              </label>
              <Input
                name="package_lpa"
                type="number"
                step="0.1"
                placeholder="e.g. 14.5"
                value={formData.package_lpa}
                onChange={handleInputChange}
                error={formErrors.package_lpa}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Batch Year <span className="text-rose-500">*</span>
              </label>
              <Input
                name="batch_year"
                type="number"
                placeholder="2026"
                value={formData.batch_year}
                onChange={handleInputChange}
                error={formErrors.batch_year}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Drive Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DRIVE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registration Opens
              </label>
              <input
                type="date"
                name="registration_start_date"
                value={formData.registration_start_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registration_end_date"
                value={formData.registration_end_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.registration_end_date && (
                <p className="text-rose-500 text-[11px] mt-1">
                  {formErrors.registration_end_date}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive / Assessment Date
              </label>
              <input
                type="date"
                name="drive_date"
                value={formData.drive_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Job Description &amp; Scope <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="job_description"
              rows={3}
              placeholder="Outline responsibilities, required qualifications, and interview stages..."
              value={formData.job_description}
              onChange={handleInputChange}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formErrors.job_description && (
              <p className="text-rose-500 text-[11px] mt-1">
                {formErrors.job_description}
              </p>
            )}
          </div>

          {/* Allowed Departments Multi-select */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Eligible Departments
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {departments.map((dept) => (
                <label
                  key={dept.id}
                  className="flex items-center gap-2 cursor-pointer text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.allowed_department_ids.includes(dept.id)}
                    onChange={() => handleDeptToggle(dept.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{dept.code}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria Breakdown */}
          <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Automated Eligibility Evaluation Rules</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="min_cgpa"
                  value={formData.min_cgpa}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Max Active Backlogs
                </label>
                <input
                  type="number"
                  name="max_active_backlogs"
                  value={formData.max_active_backlogs}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min 10th %
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="min_tenth_percentage"
                  value={formData.min_tenth_percentage}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min 12th %
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="min_twelfth_percentage"
                  value={formData.min_twelfth_percentage}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Gender Eligibility
                </label>
                <select
                  name="gender_allowed"
                  value={formData.gender_allowed}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="allow_already_placed"
                  name="allow_already_placed"
                  checked={formData.allow_already_placed}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600"
                />
                <label
                  htmlFor="allow_already_placed"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Allow already placed students to apply (Dream Offer)
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Required Technical Skills (comma-separated)
              </label>
              <input
                type="text"
                name="required_skills"
                placeholder="e.g. Python, React, SQL, Cloud Computing"
                value={formData.required_skills}
                onChange={handleInputChange}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={submitting}
            >
              Create Placement Drive
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT DRIVE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Placement Drive"
        subtitle="Update drive requisitions, schedule, or eligibility criteria."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5 text-xs">
          {/* Title & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive Title <span className="text-rose-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={formErrors.title}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Job Role / Designation <span className="text-rose-500">*</span>
              </label>
              <Input
                name="job_role"
                value={formData.job_role}
                onChange={handleInputChange}
                error={formErrors.job_role}
              />
            </div>
          </div>

          {/* Package, Location, Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Package (LPA) <span className="text-rose-500">*</span>
              </label>
              <Input
                name="package_lpa"
                type="number"
                step="0.1"
                value={formData.package_lpa}
                onChange={handleInputChange}
                error={formErrors.package_lpa}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Location
              </label>
              <Input
                name="job_location"
                value={formData.job_location}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive Type
              </label>
              <select
                name="drive_type"
                value={formData.drive_type}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl"
              >
                {DRIVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold"
              >
                {DRIVE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Year
              </label>
              <Input
                name="batch_year"
                type="number"
                value={formData.batch_year}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reg. Start Date
              </label>
              <input
                type="date"
                name="registration_start_date"
                value={formData.registration_start_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reg. Deadline
              </label>
              <input
                type="date"
                name="registration_end_date"
                value={formData.registration_end_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drive Date
              </label>
              <input
                type="date"
                name="drive_date"
                value={formData.drive_date}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Job Description
            </label>
            <textarea
              name="job_description"
              rows={3}
              value={formData.job_description}
              onChange={handleInputChange}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs"
            />
          </div>

          {/* Departments */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Eligible Departments
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {departments.map((dept) => (
                <label
                  key={dept.id}
                  className="flex items-center gap-2 cursor-pointer text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.allowed_department_ids.includes(dept.id)}
                    onChange={() => handleDeptToggle(dept.id)}
                    className="rounded text-indigo-600"
                  />
                  <span>{dept.code}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Eligibility Rules */}
          <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Eligibility Rules</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Min CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="min_cgpa"
                  value={formData.min_cgpa}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Max Backlogs
                </label>
                <input
                  type="number"
                  name="max_active_backlogs"
                  value={formData.max_active_backlogs}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  name="gender_allowed"
                  value={formData.gender_allowed}
                  onChange={handleInputChange}
                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="edit_allow_placed"
                  name="allow_already_placed"
                  checked={formData.allow_already_placed}
                  onChange={handleInputChange}
                  className="rounded text-indigo-600"
                />
                <label
                  htmlFor="edit_allow_placed"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Dream Offer (Allow Placed)
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={submitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedDrive?.title || 'Drive Details'}
        subtitle="Complete campus placement drive specification and candidate criteria"
        maxWidth="max-w-2xl"
      >
        {selectedDrive && (
          <div className="space-y-5 text-xs">
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{selectedDrive.company?.name || 'Company Requisition'}</span>
                  <Badge variant="info">{selectedDrive.company?.tier || 'Corporate'}</Badge>
                </div>
                <div className="text-slate-500 flex items-center gap-2 mt-1">
                  <span>Role: <strong>{selectedDrive.job_role}</strong></span>
                  <span>&bull;</span>
                  <span>Type: <strong>{selectedDrive.drive_type?.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-600">
                  {selectedDrive.package_lpa != null ? selectedDrive.package_lpa + ' LPA' : 'N/A'}
                </div>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(selectedDrive.status)}>
                    {selectedDrive.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Lifecycle Action Bar */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between gap-3">
              <span className="font-semibold text-indigo-900">
                Update Drive Lifecycle Status:
              </span>
              <div className="flex items-center gap-2">
                <select
                  className="text-xs font-bold py-1 px-3 bg-white border border-indigo-200 rounded-lg text-indigo-950 focus:outline-none"
                  value={selectedDrive.status}
                  onChange={(e) => handleStatusChange(selectedDrive.id, e.target.value)}
                >
                  {DRIVE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                Role &amp; Opportunity Description
              </h4>
              <p className="text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                {selectedDrive.job_description || 'No description provided.'}
              </p>
            </div>

            {/* Timeline & Location Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                <span className="font-semibold text-slate-800">
                  {selectedDrive.job_location || 'Campus / Multiple'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Batch Year</span>
                <span className="font-semibold text-slate-800">
                  Class of {selectedDrive.batch_year}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Registration Closes</span>
                <span className="font-semibold text-slate-800">
                  {selectedDrive.registration_end_date
                    ? new Date(selectedDrive.registration_end_date).toLocaleDateString()
                    : 'Open'}
                </span>
              </div>
            </div>

            {/* Eligible Departments */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                Allowed Departments
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedDrive.allowed_departments) &&
                selectedDrive.allowed_departments.length > 0 ? (
                  selectedDrive.allowed_departments.map((d) => (
                    <span
                      key={d.id}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100"
                    >
                      {d.code} - {d.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">All departments eligible</span>
                )}
              </div>
            </div>

            {/* Eligibility Breakdown */}
            {selectedDrive.eligibility_criteria && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Automated Candidate Screening Criteria
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min CGPA</span>
                    <span className="font-bold text-slate-800">
                      {selectedDrive.eligibility_criteria.min_cgpa ?? '0.0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Max Backlogs</span>
                    <span className="font-bold text-slate-800">
                      {selectedDrive.eligibility_criteria.max_active_backlogs ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min 10th %</span>
                    <span className="font-bold text-slate-800">
                      {selectedDrive.eligibility_criteria.min_tenth_percentage ?? '0.0'}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min 12th %</span>
                    <span className="font-bold text-slate-800">
                      {selectedDrive.eligibility_criteria.min_twelfth_percentage ?? '0.0'}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

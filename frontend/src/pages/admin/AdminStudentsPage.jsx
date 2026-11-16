import React, { useState, useEffect } from 'react'
import { Search, Eye, ExternalLink, Edit2, Award, RotateCcw } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { departmentService } from '../../services/departmentService'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function AdminStudentsPage() {
  const { user } = useAuth()
  const isTpoAdmin = user?.role === 'TPO_ADMIN'

  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filter States
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [batchYearFilter, setBatchYearFilter] = useState('ALL')
  const [minCgpaFilter, setMinCgpaFilter] = useState('ALL')
  const [maxBacklogsFilter, setMaxBacklogsFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // View Details Modal State
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [fetchingDetails, setFetchingDetails] = useState(false)

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department_id: '',
    batch_year: 2026,
    cgpa: '',
    active_backlogs: 0,
    placement_status: 'UNPLACED',
    current_package_lpa: '',
  })

  // Placement Status Modal State
  const [placementStudent, setPlacementStudent] = useState(null)
  const [placementModalOpen, setPlacementModalOpen] = useState(false)
  const [updatingPlacement, setUpdatingPlacement] = useState(false)
  const [placementData, setPlacementData] = useState({
    placement_status: 'UNPLACED',
    current_package_lpa: '',
  })

  const { success, error: toastError } = useToast()

  const hasActiveFilters = Boolean(
    search.trim() ||
    departmentFilter !== 'ALL' ||
    batchYearFilter !== 'ALL' ||
    minCgpaFilter !== 'ALL' ||
    maxBacklogsFilter !== 'ALL' ||
    statusFilter !== 'ALL'
  )

  const handleClearFilters = () => {
    setSearch('')
    setDepartmentFilter('ALL')
    setBatchYearFilter('ALL')
    setMinCgpaFilter('ALL')
    setMaxBacklogsFilter('ALL')
    setStatusFilter('ALL')
  }

  const load = async () => {
    try {
      setLoading(true)
      const params = { limit: 100 }
      if (search.trim()) params.search = search.trim()
      if (departmentFilter !== 'ALL') params.department_id = departmentFilter
      if (batchYearFilter !== 'ALL') params.batch_year = parseInt(batchYearFilter, 10)
      if (minCgpaFilter !== 'ALL') params.min_cgpa = parseFloat(minCgpaFilter)
      if (maxBacklogsFilter !== 'ALL') params.max_active_backlogs = parseInt(maxBacklogsFilter, 10)
      if (statusFilter !== 'ALL') {
        params.placement_status = statusFilter
      }

      const [studentsData, deptsData] = await Promise.all([
        studentService.getStudents(params).catch(() => []),
        departments.length === 0
          ? departmentService.getDepartments().catch(() => [])
          : Promise.resolve(departments),
      ])
      setStudents(Array.isArray(studentsData) ? studentsData : (studentsData?.items || []))
      if (departments.length === 0 && Array.isArray(deptsData) && deptsData.length > 0) {
        setDepartments(deptsData)
      }
    } catch (err) {
      toastError('Failed to fetch student registry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [search, departmentFilter, batchYearFilter, minCgpaFilter, maxBacklogsFilter, statusFilter])

  const handleViewDetails = async (student) => {
    setDetailsModalOpen(true)
    setFetchingDetails(true)
    setSelectedStudent(student)
    try {
      const profile = await studentService.getStudent(student.id)
      setSelectedStudent(profile)
    } catch (err) {
      console.error('Error fetching student details:', err)
      toastError('Failed to fetch complete student profile.')
    } finally {
      setFetchingDetails(false)
    }
  }

  const handleOpenEdit = (student) => {
    setEditingStudent(student)
    setEditFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      phone: student.phone || '',
      department_id: student.department_id || student.department?.id || '',
      batch_year: student.batch_year || 2026,
      cgpa: student.cgpa != null ? String(student.cgpa) : '',
      active_backlogs: student.active_backlogs ?? 0,
      placement_status: student.placement_status || (student.is_placed ? 'PLACED' : 'UNPLACED'),
      current_package_lpa: student.current_package_lpa != null ? String(student.current_package_lpa) : '',
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingStudent) return

    if (!editFormData.first_name?.trim() || !editFormData.last_name?.trim()) {
      toastError('First and last names are required.')
      return
    }

    const cgpaVal = parseFloat(editFormData.cgpa)
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      toastError('CGPA must be a valid number between 0.0 and 10.0.')
      return
    }

    const backlogsVal = parseInt(editFormData.active_backlogs, 10)
    if (isNaN(backlogsVal) || backlogsVal < 0) {
      toastError('Active backlogs must be 0 or greater.')
      return
    }

    const batchVal = parseInt(editFormData.batch_year, 10)
    if (isNaN(batchVal) || batchVal < 2020 || batchVal > 2040) {
      toastError('Batch year must be between 2020 and 2040.')
      return
    }

    try {
      setSaving(true)

      const updatePayload = {
        first_name: editFormData.first_name.trim(),
        last_name: editFormData.last_name.trim(),
        department_id: editFormData.department_id || undefined,
        batch_year: batchVal,
        cgpa: cgpaVal,
        active_backlogs: backlogsVal,
        phone: editFormData.phone?.trim() || null,
      }

      await studentService.updateStudentAdmin(editingStudent.id, updatePayload)

      const isPlaced = editFormData.placement_status === 'PLACED'
      const pkgVal = editFormData.current_package_lpa ? parseFloat(editFormData.current_package_lpa) : null
      await studentService.updatePlacementStatus(editingStudent.id, {
        is_placed: isPlaced,
        placement_status: editFormData.placement_status,
        current_package_lpa: isPlaced ? pkgVal : null,
      })

      success('Student record updated successfully!')
      setEditModalOpen(false)
      setEditingStudent(null)

      // Refresh list
      await load()

      // If view details modal is currently viewing this student, update it
      if (selectedStudent && selectedStudent.id === editingStudent.id) {
        const freshDetails = await studentService.getStudent(editingStudent.id)
        setSelectedStudent(freshDetails)
      }
    } catch (err) {
      console.error('Failed to update student:', err)
      toastError(
        err.response?.data?.detail || 'Failed to update student record.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleOpenPlacementModal = (student) => {
    setPlacementStudent(student)
    setPlacementData({
      placement_status: student.placement_status || (student.is_placed ? 'PLACED' : 'UNPLACED'),
      current_package_lpa: student.current_package_lpa != null ? String(student.current_package_lpa) : '',
    })
    setPlacementModalOpen(true)
  }

  const handlePlacementSubmit = async (e) => {
    e.preventDefault()
    if (!placementStudent) return

    const isPlaced = placementData.placement_status === 'PLACED'
    let pkgVal = null
    if (isPlaced) {
      if (placementData.current_package_lpa) {
        pkgVal = parseFloat(placementData.current_package_lpa)
        if (isNaN(pkgVal) || pkgVal < 0) {
          toastError('Package must be a valid positive number in LPA.')
          return
        }
      }
    }

    try {
      setUpdatingPlacement(true)
      await studentService.updatePlacementStatus(placementStudent.id, {
        is_placed: isPlaced,
        placement_status: placementData.placement_status,
        current_package_lpa: isPlaced ? pkgVal : null,
      })

      success('Placement status updated successfully!')
      setPlacementModalOpen(false)
      setPlacementStudent(null)

      // Refresh student list
      await load()

      // If view details modal is open for this student, refresh details
      if (selectedStudent && selectedStudent.id === placementStudent.id) {
        const freshDetails = await studentService.getStudent(placementStudent.id)
        setSelectedStudent(freshDetails)
      }
    } catch (err) {
      console.error('Failed to update placement status:', err)
      toastError(
        err.response?.data?.detail || 'Failed to update placement status.'
      )
    } finally {
      setUpdatingPlacement(false)
    }
  }

  const filtered = Array.isArray(students)
  ? students.filter((s) => {
      const query = search.trim().toLowerCase()

      const fullName = `${s.first_name ?? ''} ${s.last_name ?? ''}`.toLowerCase()
      const rollNumber = String(s.roll_number ?? '').toLowerCase()

      return fullName.includes(query) || rollNumber.includes(query)
    })
  : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Academic &amp; Placement Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Master student database with real-time academic records, CGPA, and placement tracking.
        </p>
      </div>

      <Card>
        {/* Search & Filter Toolbar */}
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Input
                icon={Search}
                placeholder="Search by name or roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Year Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={batchYearFilter}
                onChange={(e) => setBatchYearFilter(e.target.value)}
              >
                <option value="ALL">All Batches</option>
                <option value="2024">Class of 2024</option>
                <option value="2025">Class of 2025</option>
                <option value="2026">Class of 2026</option>
                <option value="2027">Class of 2027</option>
              </select>
            </div>

            {/* Minimum CGPA Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={minCgpaFilter}
                onChange={(e) => setMinCgpaFilter(e.target.value)}
              >
                <option value="ALL">All CGPA</option>
                <option value="6.0">≥ 6.0 CGPA</option>
                <option value="7.0">≥ 7.0 CGPA</option>
                <option value="8.0">≥ 8.0 CGPA</option>
                <option value="9.0">≥ 9.0 CGPA</option>
              </select>
            </div>

            {/* Placement Status Filter */}
            <div>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="UNPLACED">UNPLACED</option>
                <option value="PLACED">PLACED</option>
                <option value="OPTED_OUT">OPTED_OUT</option>
              </select>
            </div>
          </div>

          {/* Sub-row: Backlogs Filter & Clear Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Max Active Backlogs:</span>
              <select
                className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={maxBacklogsFilter}
                onChange={(e) => setMaxBacklogsFilter(e.target.value)}
              >
                <option value="ALL">Any Backlogs</option>
                <option value="0">0 (Clean Record)</option>
                <option value="1">≤ 1 Backlog</option>
                <option value="2">≤ 2 Backlogs</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                iconLeft={RotateCcw}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Querying student profiles..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Backlogs</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {s.roll_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{s.batch_year}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {s.cgpa}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {s.active_backlogs ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={s.is_placed ? 'success' : 'neutral'}>
                          {s.placement_status || (s.is_placed ? 'PLACED' : 'UNPLACED')}
                        </Badge>
                        {s.current_package_lpa != null && (
                          <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                            {s.current_package_lpa + ' LPA'}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          iconLeft={Eye}
                          onClick={() => handleViewDetails(s)}
                        >
                          View Details
                        </Button>
                        {isTpoAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              iconLeft={Award}
                              onClick={() => handleOpenPlacementModal(s)}
                            >
                              Status
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              iconLeft={Edit2}
                              onClick={() => handleOpenEdit(s)}
                            >
                              Edit
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false)
          setSelectedStudent(null)
        }}
        title="Student Profile & Placement Details"
        subtitle="Complete academic dossier and campus recruitment records"
        maxWidth="max-w-2xl"
      >
        {fetchingDetails ? (
          <div className="py-12">
            <LoadingSpinner message="Fetching comprehensive student dossier..." />
          </div>
        ) : selectedStudent ? (
          <div className="space-y-5 text-xs">
            {/* Header Identity Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{selectedStudent.first_name} {selectedStudent.last_name}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                    {selectedStudent.roll_number}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-2 mt-1">
                  <span>Dept: <strong>{selectedStudent.department?.name || selectedStudent.department?.code || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Batch: <strong>Class of {selectedStudent.batch_year}</strong></span>
                  {selectedStudent.gender && (
                    <>
                      <span>•</span>
                      <span>Gender: <strong>{selectedStudent.gender}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <Badge variant={selectedStudent.is_placed ? 'success' : 'neutral'}>
                  {selectedStudent.placement_status || (selectedStudent.is_placed ? 'PLACED' : 'UNPLACED')}
                </Badge>
                {selectedStudent.current_package_lpa != null && (
                  <div className="text-sm font-extrabold text-emerald-600 mt-1">
                    {selectedStudent.current_package_lpa + ' LPA'}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Placement Action Bar */}
            {isTpoAdmin && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between gap-3">
                <span className="font-semibold text-indigo-900">
                  Manage Placement Status:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  iconLeft={Award}
                  onClick={() => handleOpenPlacementModal(selectedStudent)}
                >
                  Update Placement Status
                </Button>
              </div>
            )}

            {/* Academic Credentials */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                Academic Performance
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">Current CGPA</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedStudent.cgpa}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">Active Backlogs</span>
                  <span className={'text-base font-bold font-mono ' + ((selectedStudent.active_backlogs || 0) > 0 ? 'text-rose-600' : 'text-slate-900')}>
                    {selectedStudent.active_backlogs ?? 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">10th Percentage</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedStudent.tenth_percentage != null ? selectedStudent.tenth_percentage + '%' : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">12th Percentage</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {selectedStudent.twelfth_percentage != null ? selectedStudent.twelfth_percentage + '%' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Contact Email</span>
                <span className="font-medium text-slate-800 truncate block">
                  {selectedStudent.email || selectedStudent.user?.email || 'N/A'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Contact Phone</span>
                <span className="font-medium text-slate-800 block">
                  {selectedStudent.phone || 'N/A'}
                </span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1.5">
                Technical Skills &amp; Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(selectedStudent.skills) && selectedStudent.skills.length > 0 ? (
                  selectedStudent.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No skills listed</span>
                )}
              </div>
            </div>

            {/* Resume Link */}
            {selectedStudent.resume_url && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Candidate Resume</span>
                  <span className="text-xs text-slate-700 font-medium truncate">
                    {selectedStudent.resume_url}
                  </span>
                </div>
                <a
                  href={selectedStudent.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Resume</span>
                </a>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailsModalOpen(false)
                  setSelectedStudent(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          if (!saving) {
            setEditModalOpen(false)
            setEditingStudent(null)
          }
        }}
        title="Edit Student Record"
        subtitle={'Updating academic and placement records for ' + (editingStudent?.roll_number || 'student')}
        maxWidth="max-w-xl"
      >
        {editingStudent && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="first_name"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  name="last_name"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  value={editFormData.department_id}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, department_id: e.target.value }))}
                  required
                >
                  <option value="">Select Department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Graduation Batch Year <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  name="batch_year"
                  min="2020"
                  max="2040"
                  value={editFormData.batch_year}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, batch_year: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CGPA (0 - 10) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={editFormData.cgpa}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, cgpa: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Active Backlogs <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  name="active_backlogs"
                  value={editFormData.active_backlogs}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, active_backlogs: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Placement Status <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  value={editFormData.placement_status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, placement_status: e.target.value }))}
                >
                  <option value="UNPLACED">UNPLACED</option>
                  <option value="PLACED">PLACED</option>
                  <option value="OPTED_OUT">OPTED_OUT</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Package (LPA)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="current_package_lpa"
                  value={editFormData.current_package_lpa}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, current_package_lpa: e.target.value }))}
                  placeholder="e.g. 12.5"
                  disabled={editFormData.placement_status !== 'PLACED'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditModalOpen(false)
                  setEditingStudent(null)
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Placement Status Modal */}
      <Modal
        isOpen={placementModalOpen}
        onClose={() => {
          if (!updatingPlacement) {
            setPlacementModalOpen(false)
            setPlacementStudent(null)
          }
        }}
        title="Update Placement Status"
        subtitle={'Placement status override for ' + (placementStudent?.first_name || '') + ' ' + (placementStudent?.last_name || '') + ' (' + (placementStudent?.roll_number || '') + ')'}
        maxWidth="max-w-md"
      >
        {placementStudent && (
          <form onSubmit={handlePlacementSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                <span className="font-semibold text-slate-800">
                  {placementStudent.placement_status || (placementStudent.is_placed ? 'PLACED' : 'UNPLACED')}
                </span>
              </div>
              {placementStudent.current_package_lpa != null && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Package</span>
                  <span className="font-bold text-emerald-600">
                    {placementStudent.current_package_lpa + ' LPA'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Placement Status <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                value={placementData.placement_status}
                onChange={(e) => {
                  const newStatus = e.target.value
                  setPlacementData(prev => ({
                    ...prev,
                    placement_status: newStatus,
                    current_package_lpa: newStatus !== 'PLACED' ? '' : prev.current_package_lpa,
                  }))
                }}
              >
                <option value="UNPLACED">UNPLACED — Seeking placement</option>
                <option value="PLACED">PLACED — Offer received/accepted</option>
                <option value="OPTED_OUT">OPTED_OUT — Higher studies / off-campus</option>
              </select>
            </div>

            {placementData.placement_status === 'PLACED' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Salary Package in LPA (Cost to Company)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="current_package_lpa"
                  value={placementData.current_package_lpa}
                  onChange={(e) => setPlacementData(prev => ({ ...prev, current_package_lpa: e.target.value }))}
                  placeholder="e.g. 14.50"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter final accepted CTC in Lakhs Per Annum.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPlacementModalOpen(false)
                  setPlacementStudent(null)
                }}
                disabled={updatingPlacement}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={updatingPlacement}
              >
                Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

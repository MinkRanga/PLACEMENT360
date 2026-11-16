import React, { useState, useEffect } from 'react'
import { Users, Edit3 } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { applicationService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function RecruiterApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [updateForm, setUpdateForm] = useState({
    status: 'SHORTLISTED',
    current_round_order: 1,
    notes: '',
    rejection_reason: '',
  })

  const { error: toastError, success: toastSuccess } = useToast()

  const loadApplications = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter

      const data = await applicationService.getApplications(params)
      const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
      setApplications(list)
    } catch (err) {
      console.error('Failed to load applications', err)
      toastError('Could not retrieve candidate applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [statusFilter])

  const openEvaluationModal = (app) => {
    setSelectedApp(app)
    setUpdateForm({
      status: app.status || 'SHORTLISTED',
      current_round_order: app.current_round_order || 1,
      notes: app.notes || '',
      rejection_reason: app.rejection_reason || '',
    })
    setModalOpen(true)
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!selectedApp) return

    try {
      setUpdating(true)
      const payload = {
        status: updateForm.status,
        current_round_order: parseInt(updateForm.current_round_order, 10) || 1,
        notes: updateForm.notes || null,
        rejection_reason: updateForm.status === 'REJECTED' ? updateForm.rejection_reason || null : null,
      }

      await applicationService.updateApplicationStatus(selectedApp.id, payload)
      toastSuccess(`Application updated to ${updateForm.status}!`)
      setModalOpen(false)
      await loadApplications()
    } catch (err) {
      toastError(err.response?.data?.detail || 'Failed to update candidate status.')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'SELECTED':
      case 'ACCEPTED':
      case 'OFFERED':
        return 'success'
      case 'SHORTLISTED':
        return 'info'
      case 'IN_PROCESS':
        return 'warning'
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Applicant Funnel &amp; Evaluation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applied candidates, manage selection rounds, and advance applicant statuses.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Application Statuses' },
              { value: 'APPLIED', label: 'Applied (Initial)' },
              { value: 'SHORTLISTED', label: 'Shortlisted' },
              { value: 'IN_PROCESS', label: 'In Process' },
              { value: 'SELECTED', label: 'Selected / Finalist' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      <Card
        title="Candidate Screening Pipeline"
        subtitle="Manage applicants across technical assessments and interview rounds"
        icon={Users}
      >
        {loading ? (
          <LoadingSpinner message="Fetching candidate submissions..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Target Drive</th>
                  <th className="py-3 px-4">Dept &amp; CGPA</th>
                  <th className="py-3 px-4">Current Round</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No candidate applications match the selected status filter.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => {
                    const studentName = app.student
                      ? `${app.student.first_name || ''} ${app.student.last_name || ''}`.trim() || 'Candidate'
                      : 'Candidate'
                    const rollNo = app.student?.roll_number || 'N/A'
                    const deptName = app.student?.department?.code || app.student?.department?.name || 'ENG'
                    const cgpa = app.student?.cgpa ?? 'N/A'

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{rollNo}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{app.drive?.title || 'Drive'}</div>
                          <div className="text-[11px] text-slate-500">{app.drive?.job_role}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">{deptName}</span>
                          <span className="text-slate-400 mx-1">&bull;</span>
                          <span className="font-mono font-bold text-indigo-600">{cgpa} CGPA</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {app.current_round ? `Round: ${app.current_round}` : `Round ${app.current_round_order || 1}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getStatusBadgeVariant(app.status)}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            iconLeft={Edit3}
                            onClick={() => openEvaluationModal(app)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Evaluation & Status Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Candidate Round & Status Evaluation"
        subtitle={
          selectedApp
            ? `${selectedApp.student?.first_name || 'Candidate'} ${selectedApp.student?.last_name || ''} — ${selectedApp.drive?.title || ''}`
            : ''
        }
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="Evaluation Decision / Status"
            value={updateForm.status}
            onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
            options={[
              { value: 'APPLIED', label: 'APPLIED — Under Initial Screening' },
              { value: 'SHORTLISTED', label: 'SHORTLISTED — Cleared Screening' },
              { value: 'IN_PROCESS', label: 'IN_PROCESS — Interview Round Ongoing' },
              { value: 'SELECTED', label: 'SELECTED — Qualified for Offer' },
              { value: 'REJECTED', label: 'REJECTED — Did Not Meet Criteria' },
            ]}
          />

          <Input
            label="Current Interview / Assessment Round (1-10)"
            type="number"
            min="1"
            max="10"
            value={updateForm.current_round_order}
            onChange={(e) => setUpdateForm({ ...updateForm, current_round_order: e.target.value })}
            helperText="Advance the round order as candidate moves forward in the hiring pipeline"
          />

          <Input
            label="Interviewer Remarks / Feedback"
            placeholder="e.g. Cleared technical coding assessment. Moving to System Design round."
            value={updateForm.notes}
            onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
          />

          {updateForm.status === 'REJECTED' && (
            <Input
              label="Rejection Reason"
              placeholder="e.g. Scored below cutoff in technical test"
              value={updateForm.rejection_reason}
              onChange={(e) => setUpdateForm({ ...updateForm, rejection_reason: e.target.value })}
            />
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updating}
            >
              Save Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

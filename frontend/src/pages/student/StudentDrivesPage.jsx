import React, { useState, useEffect } from 'react'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState(null)
  const [eligibleOnly, setEligibleOnly] = useState(false)
  const { success, error: toastError } = useToast()

  const loadDrives = async () => {
    try {
      setLoading(true)
      const params = eligibleOnly ? { eligible_only: true } : {}
      const data = await driveService.getDrives(params)
      const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
      setDrives(list)
    } catch (err) {
      toastError('Could not fetch active drives.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrives()
  }, [eligibleOnly])

  const handleApply = async (driveId) => {
    try {
      setApplyingId(driveId)
      const elig = await driveService.checkEligibility(driveId)
      if (!elig.is_eligible) {
        toastError(`Eligibility criteria not met: ${elig.reasons?.join(', ')}`)
        return
      }
      await driveService.applyToDrive(driveId)
      success('Application submitted successfully!')
      loadDrives()
    } catch (err) {
      toastError(err.response?.data?.detail || 'Application failed.')
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Placement Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore open corporate opportunities and submit applications with automated eligibility screening.
          </p>
        </div>

        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setEligibleOnly(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !eligibleOnly
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Open Drives
          </button>
          <button
            type="button"
            onClick={() => setEligibleOnly(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              eligibleOnly
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Eligible Drives Only
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Checking drive eligibility against your academic profile..." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {drives.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No active campus drives found.
            </div>
          ) : (
            drives.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="info">{d.job_role}</Badge>
                      {d.status && (
                        <Badge variant={d.status === 'REGISTRATION_OPEN' ? 'success' : 'neutral'}>
                          {d.status.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {d.package_details || (d.package_lpa != null ? `${d.package_lpa} LPA` : 'N/A')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {d.company?.name ? `${d.company.name} — ${d.title}` : d.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                    {d.job_description || 'Full-time graduate recruitment opportunity for eligible engineering batches.'}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min CGPA:</span>
                      <span className="font-semibold text-slate-800">
                        {d.eligibility_criteria?.min_cgpa ?? d.min_cgpa ?? 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Active Backlogs:</span>
                      <span className="font-semibold text-slate-800">
                        {d.eligibility_criteria?.max_active_backlogs ?? d.max_active_backlogs ?? 0}
                      </span>
                    </div>
                    {(d.registration_end_date || d.application_deadline) && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deadline:</span>
                        <span className="font-semibold text-rose-600">
                          {new Date(d.registration_end_date || d.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {d.status === 'REGISTRATION_CLOSED' || d.status === 'COMPLETED' ? (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    className="w-full font-bold opacity-60 cursor-not-allowed"
                  >
                    {d.status === 'COMPLETED' ? 'Drive Completed' : 'Registration Closed'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    loading={applyingId === d.id}
                    onClick={() => handleApply(d.id)}
                    className="w-full font-bold"
                  >
                    Verify &amp; Apply
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

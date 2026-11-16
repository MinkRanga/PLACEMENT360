import React, { useState, useEffect } from 'react'
import { Briefcase, CheckCircle2, AlertCircle, Building2, Calendar } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState(null)
  const { success, error: toastError } = useToast()

  const loadDrives = async () => {
    try {
      setLoading(true)
      const data = await driveService.getDrives({ status: 'ACTIVE' })
      setDrives(data || [])
    } catch (err) {
      toastError('Could not fetch active drives.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDrives()
  }, [])

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
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Eligible Campus Placement Drives
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore open corporate opportunities and submit applications with automated eligibility screening.
        </p>
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
                    <Badge variant="info">{d.job_role}</Badge>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {d.package_details || `${d.package_lpa || '8.5'} LPA`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{d.title}</h3>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                    {d.job_description || 'Full-time graduate recruitment opportunity for eligible engineering batches.'}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min CGPA:</span>
                      <span className="font-semibold text-slate-800">{d.min_cgpa ?? 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Active Backlogs:</span>
                      <span className="font-semibold text-slate-800">{d.max_active_backlogs ?? 0}</span>
                    </div>
                    {d.application_deadline && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deadline:</span>
                        <span className="font-semibold text-rose-600">
                          {new Date(d.application_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  loading={applyingId === d.id}
                  onClick={() => handleApply(d.id)}
                  className="w-full font-bold"
                >
                  Verify &amp; Apply
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

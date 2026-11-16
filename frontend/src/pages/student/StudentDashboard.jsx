import React, { useState, useEffect } from 'react'
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  Sparkles,
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [drives, setDrives] = useState([])
  const [applications, setApplications] = useState([])
  const [applyingDriveId, setApplyingDriveId] = useState(null)

  const { success, error: toastError } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [profData, activeDrives, myApps] = await Promise.all([
        studentService.getMyProfile().catch(() => null),
        driveService.getDrives().catch(() => []),
        driveService.getMyApplications().catch(() => []),
      ])

      // Normalize drives response (handles both array and paginated { items: [...] } formats)
      let normalizedDrives = []
      if (Array.isArray(activeDrives)) {
        normalizedDrives = activeDrives
      } else if (Array.isArray(activeDrives?.items)) {
        normalizedDrives = activeDrives.items
      } else {
        console.error('Unexpected drives API response structure:', activeDrives)
        normalizedDrives = []
      }

      // Normalize applications response
      let normalizedApps = []
      if (Array.isArray(myApps)) {
        normalizedApps = myApps
      } else if (Array.isArray(myApps?.items)) {
        normalizedApps = myApps.items
      } else {
        console.error('Unexpected applications API response structure:', myApps)
        normalizedApps = []
      }

      setProfile(profData)
      setDrives(normalizedDrives)
      setApplications(normalizedApps)
    } catch (err) {
      console.error('Error loading student dashboard', err)
      toastError('Could not sync student records from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApply = async (driveId) => {
    try {
      setApplyingDriveId(driveId)
      // Check eligibility first
      const elig = await driveService.checkEligibility(driveId)
      if (!elig.is_eligible) {
        toastError(`Eligibility check failed: ${elig.reasons?.join(', ')}`)
        return
      }

      await driveService.applyToDrive(driveId)
      success('Application submitted successfully!')
      await loadData()
    } catch (err) {
      toastError(err.response?.data?.detail || 'Application could not be processed.')
    } finally {
      setApplyingDriveId(null)
    }
  }

  if (loading && !profile) {
    return <LoadingSpinner size="lg" message="Loading your student credentials and drives..." />
  }

  const appliedDriveIds = new Set(
    (Array.isArray(applications) ? applications : []).map((a) => a.drive_id)
  )

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student TPS Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {profile?.first_name || 'Student'} {profile?.last_name || ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Roll Number: <span className="font-mono font-bold text-white">{profile?.roll_number || '22CSE001'}</span> &bull; 
            Department: <span className="font-bold text-white">{profile?.department?.name || 'Computer Science'}</span> &bull; 
            Class of <span className="font-bold text-white">{profile?.batch_year || 2026}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right">
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider block">
              Placement Status
            </span>
            <span
              className={`text-sm font-extrabold uppercase ${
                profile?.is_placed ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {profile?.is_placed ? 'Placed' : 'In Process'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current CGPA"
          value={profile?.cgpa || '8.50'}
          change="Eligible for Tier-1 & Tier-2"
          changeType="positive"
          icon={Award}
          color="indigo"
        />

        <StatCard
          title="Active Backlogs"
          value={profile?.active_backlogs ?? 0}
          change={profile?.active_backlogs === 0 ? 'Clear Academic Record' : 'Attention needed'}
          changeType={profile?.active_backlogs === 0 ? 'positive' : 'negative'}
          icon={AlertCircle}
          color={profile?.active_backlogs === 0 ? 'emerald' : 'rose'}
        />

        <StatCard
          title="My Applications"
          value={Array.isArray(applications) ? applications.length : 0}
          change="Submitted drive applications"
          changeType="neutral"
          icon={FileText}
          color="blue"
        />

        <StatCard
          title="Campus Drives Open"
          value={Array.isArray(drives) ? drives.length : 0}
          change="Currently accepting profiles"
          changeType="neutral"
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Live Campus Drives */}
      <Card
        title="Active Campus Placement Drives"
        subtitle="Opportunities tailored to your academic batch and department"
        icon={Briefcase}
      >
        <div className="space-y-3">
          {!Array.isArray(drives) || drives.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No active placement drives currently open. Check back periodically.
            </div>
          ) : (
            drives.map((drive) => {
              const hasApplied = appliedDriveIds.has(drive.id)
              return (
                <div
                  key={drive.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{drive.title}</h4>
                      <Badge variant="info">{drive.job_role}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Min CGPA: <strong className="text-slate-700">{drive.eligibility_criteria?.min_cgpa ?? drive.min_cgpa ?? 'None'}</strong> &bull; 
                      Max Backlogs: <strong className="text-slate-700">{drive.eligibility_criteria?.max_active_backlogs ?? drive.max_active_backlogs ?? 0}</strong> &bull; 
                      Package: <strong className="text-emerald-700">{drive.package_details || (drive.package_lpa != null ? `${drive.package_lpa} LPA` : 'N/A')}</strong>
                    </p>
                  </div>

                  <div>
                    {hasApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={applyingDriveId === drive.id}
                        onClick={() => handleApply(drive.id)}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* My Applications Progress Tracker */}
      <Card
        title="Application Status &amp; Interview Pipeline"
        subtitle="Track your submissions through shortlisting and interview rounds"
        icon={FileText}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Drive Title</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4">Interview Schedule</th>
                <th className="py-3 px-4 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {!Array.isArray(applications) || applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    You have not submitted any applications yet. Review open drives above to apply.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {app.drive?.title || 'Campus Placement Drive'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {app.applied_at || app.created_at
                        ? new Date(app.applied_at || app.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === 'OFFERED' || app.status === 'ACCEPTED'
                            ? 'success'
                            : app.status === 'SHORTLISTED'
                            ? 'info'
                            : app.status === 'REJECTED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.current_round
                        ? `Round: ${app.current_round}`
                        : app.current_round_order
                        ? `Round: ${app.current_round_order}`
                        : 'Pending review'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {app.notes || app.rejection_reason || app.feedback || 'In process'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

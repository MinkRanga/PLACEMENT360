
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Award,
  Plus,
  RefreshCw,
} from 'lucide-react'

import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [drives, setDrives] = useState([])
  const { error: toastError } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)

      const drivesData = await driveService.getDrives()

      // Backend returns a paginated response containing items
      const driveList = Array.isArray(drivesData?.items)
        ? drivesData.items
        : []

      setDrives(driveList)
    } catch (err) {
      console.error('Failed to load recruiter data:', err)
      setDrives([])
      toastError('Could not sync recruiter workspace.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Loading enterprise recruitment portal..."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Recruiter Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Campus Hiring Management
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your company's campus recruitment drives, review candidate
            profiles, schedule technical rounds, and extend job offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outlineDark"
            size="sm"
            onClick={loadData}
            iconLeft={RefreshCw}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            iconLeft={Plus}
            onClick={() => navigate('/recruiter/drives')}
          >
            Post Recruitment Drive
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Drives"
          value={drives.filter((d) =>
            ['ANNOUNCED', 'REGISTRATION_OPEN'].includes(d.status)
          ).length}
          change="Campus drives currently open"
          changeType="neutral"
          icon={Briefcase}
          color="indigo"
        />

        <StatCard
          title="Total Drives"
          value={drives.length}
          change="Your company's hiring programs"
          changeType="neutral"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Interviews Conducted"
          value="18"
          change="Technical & HR Rounds"
          changeType="positive"
          icon={Calendar}
          color="purple"
        />

        <StatCard
          title="Offers Rolled"
          value="12"
          change="Final placement offers"
          changeType="positive"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Placement Drives */}
      <Card
        title="Enterprise Placement Drives"
        subtitle="Active and scheduled hiring sessions with university candidates"
        icon={Briefcase}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Drive Name</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Min CGPA</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {drives.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No placement drives found for your company. Click "Post
                    Recruitment Drive" above to create one.
                  </td>
                </tr>
              ) : (
                drives.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.title}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {d.job_role || 'Not specified'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {d.eligibility_criteria?.min_cgpa ?? d.min_cgpa != null
                        ? `${d.eligibility_criteria?.min_cgpa ?? d.min_cgpa} CGPA`
                        : 'Any'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {d.package_details ||
                        (d.package_lpa != null
                          ? `${d.package_lpa} LPA`
                          : 'Not specified')}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          d.status === 'REGISTRATION_OPEN'
                            ? 'success'
                            : d.status === 'COMPLETED'
                              ? 'neutral'
                              : 'warning'
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/recruiter/applications"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Review Applicants &rarr;
                      </Link>
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

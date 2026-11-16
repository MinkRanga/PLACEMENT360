import React, { useState, useEffect } from 'react'
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  Award,
  Plus,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [deptStats, setDeptStats] = useState([])
  const [funnel, setFunnel] = useState(null)
  const [recentDrives, setRecentDrives] = useState([])
  const { error: toastError } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [sumData, depts, funData, drives] = await Promise.all([
        driveService.getPlacementSummary().catch(() => null),
        driveService.getDepartmentWiseStats().catch(() => []),
        driveService.getApplicationFunnel().catch(() => null),
        driveService.getDrives({ limit: 5 }).catch(() => []),
      ])

      setSummary(sumData)
      setDeptStats(depts || [])
      setFunnel(funData)
      setRecentDrives(
        Array.isArray(drives?.items)
          ? drives.items
          : Array.isArray(drives)
            ? drives
            : []
     ) 
    } catch (err) {
      console.error('Failed to load admin dashboard data', err)
      toastError('Could not sync latest MIS metrics from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading && !summary) {
    return <LoadingSpinner size="lg" message="Synthesizing MIS executive metrics..." />
  }

  // Format department data for bar chart
  const barChartData =
    deptStats.length > 0
      ? deptStats.map((d) => ({
          name: d.department_code || d.department_name,
          Total: d.total_students,
          Placed: d.placed_students,
          PlacementRate: parseFloat(d.placement_percentage || 0),
        }))
      : [
          { name: 'CSE', Total: 120, Placed: 102, PlacementRate: 85.0 },
          { name: 'ECE', Total: 95, Placed: 74, PlacementRate: 77.8 },
          { name: 'IT', Total: 65, Placed: 58, PlacementRate: 89.2 },
          { name: 'MECH', Total: 80, Placed: 48, PlacementRate: 60.0 },
        ]

  // Funnel data
  
// Funnel data from the backend API
const funnelColors = {
  APPLIED: '#6366f1',
  ELIGIBLE: '#0ea5e9',
  SHORTLISTED: '#8b5cf6',
  IN_PROCESS: '#ec4899',
  SELECTED: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#94a3b8',
}

const funnelLabels = {
  APPLIED: 'Applied',
  ELIGIBLE: 'Eligible',
  SHORTLISTED: 'Shortlisted',
  IN_PROCESS: 'In Process',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

const funnelData = Array.isArray(funnel?.stages)
  ? funnel.stages.map((stage) => ({
      stage: funnelLabels[stage.stage] || stage.stage,
      count: stage.count ?? 0,
      percent: stage.percentage_of_total ?? 0,
      fill: funnelColors[stage.stage] || '#6366f1',
    }))
  : []


  const viewAllAction = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        window.location.href = '/admin/drives'
      }}
    >
      View All Drives &rarr;
    </Button>
  )

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>TPO Executive Management Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Placement Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Real-time MIS summary of student conversion, active corporate drives, and predictive placement benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            iconLeft={RefreshCw}
            className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
          >
            Refresh Data
          </Button>
          <Button
            variant="emerald"
            size="sm"
            iconLeft={Plus}
            onClick={() => {
              window.location.href = '/admin/drives'
            }}
          >
            Create New Drive
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Placement Conversion"
          value={
            summary?.placement_percentage != null
              ? `${summary.placement_percentage}%`
              : '—'
          }
          change={
            summary?.placed_students != null && summary?.total_students != null
              ? `${summary.placed_students} / ${summary.total_students} Placed`
              : '—'
          }
          changeType="positive"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Average Salary (CTC)"
          value={
            summary?.avg_package_lpa != null
              ? `${summary.avg_package_lpa} LPA`
              : '—'
          }
          change={
            summary?.highest_package_lpa != null
              ? `Highest: ${summary.highest_package_lpa} LPA`
              : '—'
          }
          changeType="positive"
          icon={Award}
          color="indigo"
        />

        <StatCard
          title="Active Placement Drives"
          value={summary?.active_drives != null ? summary.active_drives : '—'}
          change="Campus drives in evaluation"
          changeType="neutral"
          icon={Briefcase}
          color="blue"
        />

        <StatCard
          title="Partner Companies"
          value={summary?.total_companies != null ? summary.total_companies : '—'}
          change="Tier 1 & Tier 2 Corporate network"
          changeType="neutral"
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department Conversion Bar Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Departmental Placement Funnel"
            subtitle="Comparison of enrolled vs placed candidates by academic branch"
            headerIcon={Users}
          >
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Placed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Funnel Progress Breakdown */}
        <div>
          <Card
            title="Application Pipeline"
            subtitle="Progression across active recruitment stages"
            headerIcon={TrendingUp}
          >
            <div className="space-y-4 pt-2">
              {funnelData.map((stage) => {
                const percent = Math.round(stage.percent)
                return (
                  <div key={stage.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{stage.stage}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {stage.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: stage.fill,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              <p className="text-xs text-indigo-900 leading-snug">
                 Total applications recorded: {funnel?.total_applications ?? 0}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Live Campus Drives Table */}
      <Card
        title="Current Placement Drives"
        subtitle="Recent active opportunities and recruitment schedules"
        headerIcon={Briefcase}
        action={viewAllAction}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Drive Title</th>
                <th className="py-3 px-4">Job Role</th>
                <th className="py-3 px-4">Min CGPA</th>
                <th className="py-3 px-4">Max Backlogs</th>
                <th className="py-3 px-4">CTC Package</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentDrives.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active placement drives found. Click "Create New Drive" above to launch one.
                  </td>
                </tr>
              ) : (
                recentDrives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{d.job_role}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {d.min_cgpa ? `${d.min_cgpa} CGPA` : 'Open'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {d.max_active_backlogs ?? 0} Max
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {d.package_details || `${d.package_lpa || '8.5'} LPA`}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          d.status === 'ACTIVE'
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
                      <a
                        href="/admin/drives"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Manage &rarr;
                      </a>
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

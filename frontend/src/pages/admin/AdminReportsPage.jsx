import React, { useState, useEffect } from 'react'
import { BarChart3, AlertTriangle, Download } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

const escapeCsv = (val) => {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export default function AdminReportsPage() {
  const [deptStats, setDeptStats] = useState([])
  const [unplaced, setUnplaced] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: toastError, success } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [depts, unplacedData] = await Promise.all([
          driveService.getDepartmentWiseStats().catch(() => []),
          driveService.getUnplacedStudents().catch(() => []),
        ])
        setDeptStats(depts || [])
        setUnplaced(unplacedData || [])
      } catch (err) {
        toastError('Failed to fetch MIS reporting metrics.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExport = () => {
    if ((!deptStats || deptStats.length === 0) && (!unplaced || unplaced.length === 0)) {
      toastError('No report data available to export.')
      return
    }

    const lines = []

    // Section 1: Departmental Placement Performance
    lines.push('--- DEPARTMENTAL PLACEMENT PERFORMANCE ---')
    lines.push(
      [
        'Department Code',
        'Department Name',
        'Enrolled Students',
        'Placed Students',
        'Unplaced Students',
        'Placement Rate (%)',
        'Average CTC (LPA)',
        'Highest CTC (LPA)',
      ]
        .map(escapeCsv)
        .join(',')
    )

    if (deptStats && deptStats.length > 0) {
      deptStats.forEach((d) => {
        lines.push(
          [
            d.department_code,
            d.department_name,
            d.total_students,
            d.placed_students,
            d.unplaced_students,
            d.placement_percentage,
            d.avg_package_lpa != null ? d.avg_package_lpa : 'N/A',
            d.highest_package_lpa != null ? d.highest_package_lpa : 'N/A',
          ]
            .map(escapeCsv)
            .join(',')
        )
      })
    } else {
      lines.push('No departmental statistics recorded.')
    }

    lines.push('') // Blank row between sections

    // Section 2: Unplaced Student Exception Report
    lines.push('--- UNPLACED STUDENT EXCEPTION REPORT ---')
    lines.push(
      [
        'Roll Number',
        'Student Name',
        'Department',
        'Batch Year',
        'CGPA',
        'Active Backlogs',
        'Email',
        'Phone',
      ]
        .map(escapeCsv)
        .join(',')
    )

    if (unplaced && unplaced.length > 0) {
      unplaced.forEach((u) => {
        lines.push(
          [
            u.roll_number,
            u.name,
            u.department_code,
            u.batch_year,
            u.cgpa,
            u.active_backlogs ?? 0,
            u.email,
            u.phone || 'N/A',
          ]
            .map(escapeCsv)
            .join(',')
        )
      })
    } else {
      lines.push('No unplaced students found.')
    }

    const csvContent = lines.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'PLACEMENT360_MIS_Report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    success('MIS Summary Report exported to CSV format.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            MIS Reporting &amp; Decision Support (DSS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental placement performance, batch conversion analytics, and exception queues.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          iconLeft={Download}
          onClick={handleExport}
        >
          Export MIS Package
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating departmental aggregates..." />
      ) : (
        <>
          {/* Department Placement Summary Table */}
          <Card
            title="Department-Wise Placement Performance"
            subtitle="Aggregated conversion ratios and compensation averages"
            icon={BarChart3}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Placed Students</th>
                    <th className="py-3 px-4">Conversion Rate</th>
                    <th className="py-3 px-4">Average CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {deptStats.map((d) => (
                    <tr key={d.department_id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {d.department_code} - {d.department_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{d.total_students}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                        {d.placed_students}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            parseFloat(d.placement_percentage || 0) >= 75
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {d.placement_percentage}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {d.avg_package_lpa != null ? d.avg_package_lpa + ' LPA' : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Unplaced Student Exception Report */}
          <Card
            title="Unplaced Student Exception Report"
            subtitle="Students currently unplaced across all departments and batches"
            icon={AlertTriangle}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Active Backlogs</th>
                    <th className="py-3 px-4">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {unplaced.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        Zero unplaced student exceptions found. All students are actively placed.
                      </td>
                    </tr>
                  ) : (
                    unplaced.map((u) => (
                      <tr key={u.student_id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {u.roll_number}
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          {u.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono">{u.cgpa}</td>
                        <td className="py-3.5 px-4 font-mono">{u.active_backlogs ?? 0}</td>
                        <td className="py-3.5 px-4 text-indigo-600 font-semibold cursor-pointer">
                          Schedule Training →
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

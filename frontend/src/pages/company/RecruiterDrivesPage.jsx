import React, { useState, useEffect } from 'react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function RecruiterDrivesPage() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await driveService.getDrives()
        setDrives(data || [])
      } catch (error) {
        toastError('Failed to load corporate drives.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toastError])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Corporate Hiring Drives
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee company placement drives, update criteria, and track applicant pools.
          </p>
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner message="Fetching campus hiring records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Drive Title</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Min CGPA</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {drives.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No recruitment drives active.
                    </td>
                  </tr>
                ) : (
                  drives.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{d.job_role}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {d.min_cgpa ? `${d.min_cgpa} CGPA` : 'Open'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {d.package_details || (d.package_lpa != null ? `${d.package_lpa} LPA` : 'Not specified')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={d.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

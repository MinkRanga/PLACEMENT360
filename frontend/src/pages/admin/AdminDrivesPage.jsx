import React, { useState, useEffect } from 'react'
import { Briefcase, Plus, Search, Filter, Calendar, Award } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await driveService.getDrives()
        setDrives(data || [])
      } catch (err) {
        toastError('Failed to load placement drives.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredDrives = drives.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.job_role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Placement Drives Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure campus hiring drives, eligibility policies, and recruitment timelines.
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Input
              icon={Search}
              placeholder="Search by title or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching campus recruitment drives..." />
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
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching drives found.
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{d.job_role}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {d.min_cgpa ? `${d.min_cgpa} CGPA` : 'Open'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {d.package_details || `${d.package_lpa || '8.0'} LPA`}
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
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(d.created_at).toLocaleDateString()}
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

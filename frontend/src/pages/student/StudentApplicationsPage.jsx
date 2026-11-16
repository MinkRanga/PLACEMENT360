import React, { useState, useEffect } from 'react'
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { driveService } from '../../services/driveService'
import { useToast } from '../../hooks/useToast'

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await driveService.getMyApplications()
        setApplications(data || [])
      } catch (err) {
        toastError('Failed to fetch your applications.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Placement Applications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of all corporate applications, shortlisting states, and interview progression.
        </p>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner message="Fetching your submissions..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Drive Title</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Active Round</th>
                  <th className="py-3 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {a.drive?.title || 'Campus Placement Drive'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            a.status === 'ACCEPTED' || a.status === 'OFFERED'
                              ? 'success'
                              : a.status === 'SHORTLISTED'
                              ? 'info'
                              : a.status === 'REJECTED'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {a.current_round ? `Round: ${a.current_round}` : 'Under initial review'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {a.feedback || 'In process'}
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

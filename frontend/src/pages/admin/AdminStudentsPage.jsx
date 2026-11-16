import React, { useState, useEffect } from 'react'
import { GraduationCap, Search, Filter, CheckCircle2, XCircle } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { useToast } from '../../hooks/useToast'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await studentService.getStudents()
        setStudents(data || [])
      } catch (err) {
        toastError('Failed to fetch student registry.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = students.filter(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Academic &amp; Placement Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Master student database with real-time academic records, CGPA, and placement tracking.
        </p>
      </div>

      <Card>
        <div className="mb-4 w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search by name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Querying student profiles..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Backlogs</th>
                  <th className="py-3 px-4">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {s.roll_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{s.batch_year}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {s.cgpa}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {s.active_backlogs ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={s.is_placed ? 'success' : 'neutral'}>
                          {s.is_placed ? 'PLACED' : 'UNPLACED'}
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

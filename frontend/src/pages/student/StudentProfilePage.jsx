
import React, { useState, useEffect } from 'react'
import { GraduationCap, Award } from 'lucide-react'
import Card from '../../components/common/Card'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { useToast } from '../../hooks/useToast'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await studentService.getMyProfile()
        setProfile(data)
      } catch (error) {
        toastError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [toastError])

  if (loading && !profile) {
    return <LoadingSpinner message="Loading academic portfolio..." />
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Candidate Academic Portfolio
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified academic metrics, institutional records, and readiness benchmarks.
        </p>
      </div>

      <Card
        title="Student Identification &amp; Contact"
        subtitle="Institutional registration and verification details"
        icon={GraduationCap}
      >
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Full Name</span>
            <span className="font-bold text-slate-900 text-sm">
              {profile?.first_name} {profile?.last_name}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">University Roll Number</span>
            <span className="font-mono font-bold text-indigo-700 text-sm">
              {profile?.roll_number}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Department</span>
            <span className="font-semibold text-slate-800">
              {profile?.department?.name || 'Computer Science & Engineering'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Graduation Class</span>
            <span className="font-semibold text-slate-800">
              Batch of {profile?.batch_year || 2026}
            </span>
          </div>
        </div>
      </Card>

      <Card
        title="Academic Performance &amp; Eligibility Records"
        subtitle="Used by automated rule engine for placement drive filtering"
        icon={Award}
      >
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
            <span className="text-slate-500 block mb-1">Cumulative CGPA</span>
            <span className="text-2xl font-black text-indigo-700 font-mono">
              {profile?.cgpa || '8.50'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Scale of 10.0</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
            <span className="text-slate-500 block mb-1">Active Backlogs</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {profile?.active_backlogs ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              {profile?.active_backlogs === 0 ? 'Clear Record' : 'Pending Backlog'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
            <span className="text-slate-500 block mb-1">Placement Status</span>
            <span className="text-lg font-black text-purple-700 uppercase">
              {profile?.is_placed ? 'Placed' : 'In Process'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              University Verified
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

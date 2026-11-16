import React from 'react'
import { Building2 } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../hooks/useAuth'

export default function RecruiterProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Enterprise Recruiter Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Corporate account settings, placement cell authorization, and recruiter details.
        </p>
      </div>

      <Card
        title="Account Details"
        subtitle="Authorized corporate representative information"
        icon={Building2}
      >
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block mb-0.5">Corporate Email</span>
              <span className="font-bold text-slate-900">{user?.email || 'recruiter@company.com'}</span>
            </div>
            <Badge variant="success">Verified Recruiter</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Authorization Role</span>
            <span className="font-semibold text-slate-800 uppercase">{user?.role || 'RECRUITER'}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

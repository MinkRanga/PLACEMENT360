import React from 'react'
import { Users } from 'lucide-react'
import Card from '../../components/common/Card'

export default function RecruiterApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Applicant Funnel &amp; Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review applied candidates, manage round shortlists, and submit interview evaluation scorecards.
        </p>
      </div>

      <Card
        title="Candidate Screening Pipeline"
        subtitle="Manage applicants across technical tests, coding assessments, and interview panels"
        icon={Users}
      >
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          Select a placement drive to inspect active candidate funnels and scorecards.
        </div>
      </Card>
    </div>
  )
}

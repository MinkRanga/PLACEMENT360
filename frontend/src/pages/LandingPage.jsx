import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Layers,
  ArrowRight,
  Cpu,
  Sparkles,
} from 'lucide-react'
import Button from '../components/common/Button'

export default function LandingPage() {
  const roleCards = [
    {
      title: 'TPO Administrator',
      role: 'TPO_ADMIN',
      desc: 'Centralized placement office command center. Configure policies, monitor eligibility pipelines, execute drives, and generate executive MIS & DSS insights.',
      icon: ShieldCheck,
      badge: 'Admin & Operations',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      actionText: 'TPO Portal Access',
      link: '/login?role=TPO_ADMIN',
    },
    {
      title: 'Student Candidate',
      role: 'STUDENT',
      desc: 'Individual placement career workstation. Automated eligibility verification, one-click drive applications, interview tracking, and offer acceptance.',
      icon: GraduationCap,
      badge: 'Student TPS',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionText: 'Student Portal',
      link: '/login?role=STUDENT',
    },
    {
      title: 'Company Recruiter',
      role: 'RECRUITER',
      desc: 'Enterprise corporate talent engagement. Post opportunities, screen eligible talent pools, conduct multi-round interviews, and roll out digital offers.',
      icon: Building2,
      badge: 'Corporate Recruiter',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionText: 'Recruiter Hub',
      link: '/login?role=RECRUITER',
    },
  ]

  const misPillars = [
    {
      level: 'Operational Level',
      acronym: 'TPS',
      title: 'Transaction Processing System',
      description:
        'Real-time student applications, dynamic backlog & CGPA verification, slot booking, multi-round interview scoring, and automated offer letters.',
      highlights: ['Automated Eligibility Rule Engine', 'One-Click Drive Applications', 'Multi-Stage Interview Scheduling'],
    },
    {
      level: 'Tactical Level',
      acronym: 'MIS',
      title: 'Management Information System',
      description:
        'Periodic and on-demand summaries for Head of Department and Placement Deans. Conversion funnels, branch-wise statistics, and salary quartile tracking.',
      highlights: ['Department-wise Placement Reports', 'Recruiter Conversion Funnels', 'Periodic Batch Progress Tracking'],
    },
    {
      level: 'Strategic Level',
      acronym: 'DSS',
      title: 'Decision Support System',
      description:
        'Analytical models to determine corporate partner tiering, curriculum skill gap analysis, salary benchmarks, and forecasting placement saturation.',
      highlights: ['Recruiter Tiering Analysis', 'Package Benchmark Models', 'Placement Saturation Forecasts'],
    },
    {
      level: 'Control Level',
      acronym: 'EXC',
      title: 'Exception & KPI Monitoring',
      description:
        'Drift identification and priority intervention queues. Real-time flags for unplaced students, low-conversion departments, and pending evaluations.',
      highlights: ['Unplaced Candidate Exception Queues', 'Application Drop-off Alerts', 'Pending Evaluation Notifications'],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                PLACEMENT<span className="text-indigo-400">360</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Enterprise Academic MIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://127.0.0.1:8000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              API Docs
            </a>
            <Link to="/login">
              <Button variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen University Career Management Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Unified Placement Operations &amp; <br />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              Decision Support Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            PLACEMENT360 bridges high-velocity Transaction Processing (TPS), multi-departmental Management Information Systems (MIS), and strategic Decision Support (DSS) for University Placement Cells.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/login">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Enter Placement Portal
              </Button>
            </Link>
            <Link to="/register/student">
              <Button variant="outline" size="lg" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                Register as Student
              </Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Recruiter Registration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Navigation Cards */}
      <section className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Dedicated Role Portals</h2>
          <p className="text-xs text-slate-400 mt-1">Select your administrative or operational persona to continue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roleCards.map((rc) => {
            const Icon = rc.icon
            return (
              <div
                key={rc.title}
                className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {rc.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{rc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{rc.desc}</p>
                </div>

                <Link to={rc.link}>
                  <Button variant="secondary" size="md" className="w-full justify-between group-hover:bg-indigo-600" iconRight={ArrowRight}>
                    {rc.actionText}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Enterprise MIS Pillars Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="bg-slate-950/90 rounded-3xl border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                <BarChart3 className="w-4 h-4" /> Management Information Framework
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Architectural Pyramid of Information Processing
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 w-fit">
              100% Academic Standard Compliant
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {misPillars.map((p) => (
              <div key={p.title} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {p.level}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {p.acronym}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{p.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.description}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  {p.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PLACEMENT360</span>
            <span>&bull;</span>
            <span>University Student Placement MIS</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/register/admin" className="hover:text-indigo-400 transition-colors">
              Admin Provisioning
            </Link>
            <span>&bull;</span>
            <a
              href="http://127.0.0.1:8000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              Swagger REST API
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

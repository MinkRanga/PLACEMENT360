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
      iconColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      capabilities: [
        'Policy Configuration & Drive Engine',
        'Real-Time MIS & DSS Analytics',
        'Student Registry & Eligibility Verification',
      ],
    },
    {
      title: 'Student Candidate',
      role: 'STUDENT',
      desc: 'Individual placement career workstation. Automated eligibility verification, one-click drive applications, interview tracking, and offer acceptance.',
      icon: GraduationCap,
      badge: 'Student TPS',
      iconColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      capabilities: [
        'Automated Criteria Matching',
        'One-Click Campus Drive Applications',
        'Selection Round & Offer Tracking',
      ],
    },
    {
      title: 'Company Recruiter',
      role: 'RECRUITER',
      desc: 'Enterprise corporate talent engagement. Post opportunities, screen eligible talent pools, conduct multi-round interviews, and roll out digital offers.',
      icon: Building2,
      badge: 'Corporate Recruiter',
      iconColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      capabilities: [
        'Placement Drive Publishing',
        'Candidate Funnel & Shortlisting',
        'Round Evaluation & Status Advancements',
      ],
    },
  ]

  const misPillars = [
    {
      level: 'Operational Level',
      acronym: 'TPS',
      title: 'Transaction Processing System',
      description:
        'Real-time student applications, dynamic backlog & CGPA verification, slot booking, multi-round interview scoring, and automated offer letters.',
      highlights: [
        'Automated Eligibility Rule Engine',
        'One-Click Drive Applications',
        'Multi-Stage Interview Scheduling',
      ],
    },
    {
      level: 'Tactical Level',
      acronym: 'MIS',
      title: 'Management Information System',
      description:
        'Periodic and on-demand summaries for Head of Department and Placement Deans. Conversion funnels, branch-wise statistics, and salary quartile tracking.',
      highlights: [
        'Department-wise Placement Reports',
        'Recruiter Conversion Funnels',
        'Periodic Batch Progress Tracking',
      ],
    },
    {
      level: 'Strategic Level',
      acronym: 'DSS',
      title: 'Decision Support System',
      description:
        'Analytical models to determine corporate partner tiering, curriculum skill gap analysis, salary benchmarks, and forecasting placement saturation.',
      highlights: [
        'Recruiter Tiering Analysis',
        'Package Benchmark Models',
        'Placement Saturation Forecasts',
      ],
    },
    {
      level: 'Control Level',
      acronym: 'EXC',
      title: 'Exception & KPI Monitoring',
      description:
        'Drift identification and priority intervention queues. Real-time flags for unplaced students, low-conversion departments, and pending evaluations.',
      highlights: [
        'Unplaced Candidate Exception Queues',
        'Application Drop-off Alerts',
        'Pending Evaluation Notifications',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                PLACEMENT<span className="text-indigo-400">360</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider -mt-0.5">
                Enterprise Academic MIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="http://127.0.0.1:8000/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Swagger API</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[340px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 mb-6 shadow-inner backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen University Career Management Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] mb-6">
            Unified Placement Operations &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-300 bg-clip-text text-transparent">
              Decision Support Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            PLACEMENT360 bridges high-velocity Transaction Processing (TPS), multi-departmental Management Information Systems (MIS), and strategic Decision Support (DSS) for University Placement Cells.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <Link to="/login">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Sign In to Placement360
              </Button>
            </Link>

            <Link to="/register/student">
              <Button variant="outlineDark" size="lg">
                Register as Student
              </Button>
            </Link>

            <Link to="/register/recruiter">
              <Button variant="ghostDark" size="lg">
                Recruiter Registration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Dedicated Role Portals
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engineered for all key stakeholders across the campus placement lifecycle
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roleCards.map((rc) => {
            const Icon = rc.icon
            return (
              <div
                key={rc.title}
                className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-6 sm:p-7 flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-200 group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${rc.iconColor}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${rc.badgeColor}`}
                    >
                      {rc.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{rc.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {rc.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Key Capabilities
                  </span>
                  {rc.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Enterprise MIS Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800/90 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                <BarChart3 className="w-4 h-4" /> Management Information Framework
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Architectural Pyramid of Information Processing
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 w-fit">
              100% Academic Standard Compliant
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {misPillars.map((p) => (
              <div
                key={p.title}
                className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
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
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3.5 border-t border-slate-800/80">
                  {p.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
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

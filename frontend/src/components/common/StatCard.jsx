import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // { positive: true, text: "+12% vs last year" }
  iconColor = 'text-indigo-600 bg-indigo-50 border-indigo-100',
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 block">
            {value}
          </span>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend.positive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.positive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  trend = null, // { positive: true, text: "+12% vs last year" }
  color = 'indigo',
  iconColor,
  className = '',
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
  }

  const chosenColor = colorMap[color] || colorMap.indigo
  const computedIconColor = iconColor || `${chosenColor.text} ${chosenColor.bg} ${chosenColor.border}`

  const effectiveChangeText = change || subtitle || trend?.text
  const isPositive = changeType === 'positive' || trend?.positive === true
  const isNegative = changeType === 'negative' || trend?.positive === false

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 block font-mono">
            {value}
          </span>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${computedIconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {effectiveChangeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div
            className={`inline-flex items-center gap-1.5 font-medium ${
              isPositive
                ? 'text-emerald-700'
                : isNegative
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            ) : isNegative ? (
              <TrendingDown className="w-3.5 h-3.5 shrink-0 text-rose-600" />
            ) : (
              <Minus className="w-3 h-3 shrink-0 text-slate-400" />
            )}
            <span className="truncate">{effectiveChangeText}</span>
          </div>
        </div>
      )}
    </div>
  )
}

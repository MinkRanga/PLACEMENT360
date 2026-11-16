import React from 'react'

export default function Badge({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    error: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
  }

  const dotColors = {
    slate: 'bg-slate-500',
    neutral: 'bg-slate-500',
    indigo: 'bg-indigo-500',
    info: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    success: 'bg-emerald-500',
    amber: 'bg-amber-500',
    warning: 'bg-amber-500',
    rose: 'bg-rose-500',
    danger: 'bg-rose-500',
    error: 'bg-rose-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  }

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 font-semibold',
    lg: 'text-sm px-3 py-1 font-semibold',
  }

  const variantClass = variants[variant] || variants.slate
  const dotColorClass = dotColors[variant] || dotColors.slate
  const sizeClass = sizes[size] || sizes.md

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${variantClass} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass} shrink-0`} />}
      <span>{children}</span>
    </span>
  )
}

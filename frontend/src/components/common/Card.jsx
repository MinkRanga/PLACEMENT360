import React from 'react'

export default function Card({
  children,
  title,
  subtitle,
  action,
  headerIcon: HeaderIcon = null,
  className = '',
  bodyClassName = '',
  footer = null,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action || HeaderIcon) && (
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {HeaderIcon && (
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <HeaderIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl">{footer}</div>}
    </div>
  )
}

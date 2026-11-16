import React from 'react'

export default function Card({
  children,
  title,
  subtitle,
  action,
  headerIcon: HeaderIconProp = null,
  icon: IconProp = null,
  className = '',
  bodyClassName = '',
  footer = null,
  ...props
}) {
  const HeaderIcon = HeaderIconProp || IconProp

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || action || HeaderIcon) && (
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {HeaderIcon && (
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0">
                <HeaderIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  )
}

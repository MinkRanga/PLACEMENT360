import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  fullPage = false,
  className = '',
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-indigo-600`} />
      {message && <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/80 backdrop-blur-xs">
        {spinner}
      </div>
    )
  }

  return (
    <div className="py-12 flex items-center justify-center w-full">
      {spinner}
    </div>
  )
}

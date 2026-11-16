import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft: IconLeft = null,
  iconRight: IconRight = null,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'

  const variants = {
    // Primary CTA: Purple/Indigo background with clean white text
    primary:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 hover:shadow-md hover:shadow-indigo-600/20 focus-visible:ring-indigo-500 border border-transparent',

    // Secondary CTA: Dark sleek surface for dark themes or strong contrast
    secondary:
      'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xs border border-slate-700/80 focus-visible:ring-slate-500',

    // Outline for Light surfaces
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 focus-visible:ring-indigo-500 shadow-2xs',

    // Outline for Dark surfaces (e.g. Landing Page, Dark Banners)
    outlineDark:
      'bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 focus-visible:ring-indigo-400 shadow-sm',
    'outline-dark':
      'bg-slate-900/90 hover:bg-slate-800 active:bg-slate-950 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 focus-visible:ring-indigo-400 shadow-sm',

    // Subtle Light background with visible text
    subtle:
      'bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200/80 text-indigo-700 border border-indigo-200/70 focus-visible:ring-indigo-500',

    // Subtle Dark background (semi-transparent glassmorphism)
    subtleDark:
      'bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/15 backdrop-blur-sm focus-visible:ring-white/30',
    'subtle-dark':
      'bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/15 backdrop-blur-sm focus-visible:ring-white/30',

    // Ghost for light surfaces
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent focus-visible:ring-slate-400',

    // Ghost for dark surfaces
    ghostDark:
      'bg-transparent hover:bg-slate-800 active:bg-slate-850 text-slate-300 hover:text-white border border-transparent focus-visible:ring-slate-500',
    'ghost-dark':
      'bg-transparent hover:bg-slate-800 active:bg-slate-850 text-slate-300 hover:text-white border border-transparent focus-visible:ring-slate-500',

    // Destructive Actions
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs hover:shadow focus-visible:ring-rose-500 border border-transparent',

    // Success Actions
    emerald:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs hover:shadow focus-visible:ring-emerald-500 border border-transparent',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  }

  const variantClass = variants[variant] || variants.primary
  const sizeClass = sizes[size] || sizes.md

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : IconLeft ? (
        <IconLeft className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  )
}

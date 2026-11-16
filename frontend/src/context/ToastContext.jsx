import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast])
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast])
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast])
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-800'
          let Icon = Info
          let iconColor = 'text-blue-400'

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-950 text-emerald-100 border-emerald-800'
            Icon = CheckCircle2
            iconColor = 'text-emerald-400'
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-950 text-rose-100 border-rose-800'
            Icon = AlertCircle
            iconColor = 'text-rose-400'
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-950 text-amber-100 border-amber-800'
            Icon = AlertTriangle
            iconColor = 'text-amber-400'
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white shrink-0 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

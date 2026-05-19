'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'flex items-start gap-3 rounded-xl p-4 shadow-lg border max-w-sm animate-slide-up',
            t.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
            t.type === 'error' && 'bg-red-50 border-red-200 text-red-800',
            t.type === 'info' && 'bg-brand-50 border-brand-200 text-brand-800',
          )}>
            {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

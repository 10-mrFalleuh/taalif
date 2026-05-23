'use client'
// Système de notifications Toast minimal
// Compatible avec le hook useToast

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TypeToast = 'succes' | 'erreur' | 'info'

export interface Toast {
  id: string
  message: string
  type: TypeToast
}

// Store global simple (pas de Context pour garder ça léger)
let toasts: Toast[] = []
let abonnés: ((t: Toast[]) => void)[] = []

function notifier() {
  abonnés.forEach((fn) => fn([...toasts]))
}

export function afficherToast(message: string, type: TypeToast = 'info') {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, type }]
  notifier()
  // Auto-suppression après 4s
  setTimeout(() => supprimerToast(id), 4000)
}

function supprimerToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notifier()
}

// Composant Toaster à placer dans le layout
export function Toaster() {
  const [liste, setListe] = useState<Toast[]>([])

  useEffect(() => {
    abonnés.push(setListe)
    return () => {
      abonnés = abonnés.filter((fn) => fn !== setListe)
    }
  }, [])

  if (liste.length === 0) return null

  const icones = {
    succes: <CheckCircle2 className="w-5 h-5 text-vert-500 flex-shrink-0" />,
    erreur: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  }

  const styles = {
    succes: 'border-vert-200 bg-vert-50',
    erreur: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {liste.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-entree',
            styles[toast.type]
          )}
        >
          {icones[toast.type]}
          <p className="flex-1 text-sm text-gray-800 leading-snug">{toast.message}</p>
          <button
            onClick={() => supprimerToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

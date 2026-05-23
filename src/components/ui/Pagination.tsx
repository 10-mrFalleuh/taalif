// Composant Pagination réutilisable
// Génère les liens de pagination avec les searchParams existants

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropsPagination {
  page: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | undefined>
}

export function Pagination({ page, totalPages, baseUrl, searchParams = {} }: PropsPagination) {
  // Construit l'URL en conservant les filtres existants
  const creerUrl = (p: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v)
    })
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `${baseUrl}${qs ? `?${qs}` : ''}`
  }

  // Pages à afficher (avec ellipses si besoin)
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Précédent */}
      {page > 1 ? (
        <Link href={creerUrl(page - 1)} className="pagination-btn" aria-label="Page précédente">
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <span className="pagination-btn opacity-30 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </span>
      )}

      {/* Numéros */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={creerUrl(p as number)}
            className={cn('pagination-btn', p === page && 'pagination-btn-active')}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Suivant */}
      {page < totalPages ? (
        <Link href={creerUrl(page + 1)} className="pagination-btn" aria-label="Page suivante">
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="pagination-btn opacity-30 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}

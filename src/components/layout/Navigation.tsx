'use client'
// Navigation principale de l'application
// Barre de navigation responsive avec menu mobile

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, BookOpen, Newspaper, Home, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'

// Liens de navigation principale
const liensNav = [
  { label: 'Accueil', href: '/', icone: Home },
  { label: 'Taalifs', href: '/taalifs', icone: BookOpen },
  { label: 'Actualités', href: '/actualites', icone: Newspaper },
]

export function Navigation() {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-vert-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo TAALIF */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-vert flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
              ط
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif font-bold text-vert-800 text-lg tracking-wide">TAALIF</span>
              <span className="text-xs text-vert-500 tracking-widest hidden sm:block">POÈMES SPIRITUELS</span>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {liensNav.map((lien) => {
              const Icone = lien.icone
              const actif = pathname === lien.href || 
                (lien.href !== '/' && pathname.startsWith(lien.href))
              
              return (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    actif
                      ? 'bg-vert-100 text-vert-800 font-semibold'
                      : 'text-gray-600 hover:bg-vert-50 hover:text-vert-700'
                  )}
                >
                  <Icone className="w-4 h-4" />
                  {lien.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions utilisateur */}
          <div className="hidden md:flex items-center gap-2">
            {session?.user ? (
              <div className="flex items-center gap-2">
                {/* Lien admin si administrateur */}
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname.startsWith('/admin')
                        ? 'bg-vert-700 text-white'
                        : 'bg-vert-100 text-vert-700 hover:bg-vert-200'
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                
                {/* Menu utilisateur */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                    <div className="w-7 h-7 rounded-full bg-vert-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 max-w-[120px] truncate">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-vert-700 hover:bg-vert-50 rounded-lg transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-vert-600 hover:bg-vert-700 rounded-lg transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label="Menu"
          >
            {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden border-t border-vert-100 bg-white px-4 py-3 space-y-1 animate-entree">
          {liensNav.map((lien) => {
            const Icone = lien.icone
            const actif = pathname === lien.href || 
              (lien.href !== '/' && pathname.startsWith(lien.href))
            
            return (
              <Link
                key={lien.href}
                href={lien.href}
                onClick={() => setMenuOuvert(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                  actif
                    ? 'bg-vert-100 text-vert-800'
                    : 'text-gray-600 hover:bg-vert-50 hover:text-vert-700'
                )}
              >
                <Icone className="w-5 h-5" />
                {lien.label}
              </Link>
            )
          })}

          {/* Séparateur */}
          <div className="border-t border-gray-100 pt-2 mt-2">
            {session?.user ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOuvert(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-vert-700 hover:bg-vert-50 w-full"
                  >
                    <Settings className="w-5 h-5" />
                    Administration
                  </Link>
                )}
                <div className="px-4 py-2 text-sm text-gray-500">
                  Connecté : {session.user.name}
                </div>
                <button
                  onClick={() => {
                    setMenuOuvert(false)
                    signOut({ callbackUrl: '/login' })
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOuvert(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-vert-300 text-vert-700"
                >
                  <User className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOuvert(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium bg-vert-600 text-white"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

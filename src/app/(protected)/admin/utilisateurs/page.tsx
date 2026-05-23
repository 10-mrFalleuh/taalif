// Admin – Gestion des Utilisateurs

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BoutonRoleUtilisateur } from '@/components/admin/BoutonRoleUtilisateur'
import { Users, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

export default async function PageAdminUtilisateurs() {
  const utilisateurs = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, nom: true, email: true, role: true,
      emailVerifie: true, createdAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link href="/admin" className="hover:text-vert-600 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Admin</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Utilisateurs</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-vert-600" />
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Utilisateurs <span className="text-gray-400 font-normal text-lg">({utilisateurs.length})</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email vérifié</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Rôle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Inscrit le</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-vert-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {u.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.nom}</div>
                          <div className="text-xs text-gray-400 hidden sm:block">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {u.emailVerifie
                        ? <CheckCircle2 className="w-4 h-4 text-vert-500" />
                        : <XCircle className="w-4 h-4 text-gray-300" />}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-vert-100 text-vert-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                      {formatDate(u.createdAt, { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <BoutonRoleUtilisateur id={u.id} roleActuel={u.role} nom={u.nom} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Globe, Search } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { companyService } from '../../services/companyService'
import { useToast } from '../../hooks/useToast'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { error: toastError } = useToast()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await companyService.getCompanies()
        setCompanies(data || [])
      } catch (err) {
        toastError('Failed to load corporate partners.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = companies.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Corporate Partners &amp; Recruiters
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Industry directory with company tiering, recruitment history, and authorized recruiters.
        </p>
      </div>

      <Card>
        <div className="mb-4 w-full sm:w-72">
          <Input
            icon={Search}
            placeholder="Search company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <LoadingSpinner message="Loading corporate partners..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Industry Sector</th>
                  <th className="py-3 px-4">Tier Category</th>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No corporate partners registered.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.industry}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="info">{c.tier ? c.tier.replace('_', ' ') : 'STANDARD'}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {c.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                          >
                            <Globe className="w-3.5 h-3.5" /> Visit Site
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={c.is_verified ? 'success' : 'warning'}>
                          {c.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

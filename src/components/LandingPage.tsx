import { Rocket, Plus, Building2, Users, Zap, ChevronRight, Trash2 } from 'lucide-react'
import type { Company } from './CarbonclipApp'

interface LandingPageProps {
  companies: Company[]
  onSelectCompany: (id: string) => void
  onCreateNew: () => void
}

const INDUSTRY_COLORS: Record<string, string> = {
  'Design / Creative Studio': 'from-pink-500 to-purple-600',
  'Video / Animation': 'from-red-500 to-orange-500',
  'SaaS / Tech Startup': 'from-blue-500 to-cyan-500',
  'E-commerce': 'from-green-500 to-emerald-500',
  'Marketing Agency': 'from-amber-500 to-yellow-500',
  'Content Creation': 'from-violet-500 to-fuchsia-500',
  'Restaurant / F&B': 'from-orange-500 to-red-500',
  'Law Firm': 'from-slate-500 to-zinc-600',
  'Construction / Real Estate': 'from-amber-600 to-orange-600',
  'Manufacturing': 'from-blue-600 to-indigo-600',
  'Consulting': 'from-teal-500 to-cyan-600',
  'Education': 'from-indigo-500 to-blue-500',
  'Healthcare': 'from-emerald-500 to-teal-500',
  'Personal Brand': 'from-fuchsia-500 to-pink-500',
  'Event Management': 'from-rose-500 to-pink-500',
  'Other': 'from-zinc-500 to-zinc-600',
}

export function LandingPage({ companies, onSelectCompany, onCreateNew }: LandingPageProps) {
  const handleDelete = async (e: React.MouseEvent, companyId: string) => {
    e.stopPropagation()
    if (!confirm('Delete this company? This cannot be undone.')) return
    await fetch(`/api/company/${companyId}`, { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-violet-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Carbonclip</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Launch. Create. Grow.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10">
            Your AI Business Operating System. Create companies and run them with AI Agents that behave like real employees inside a real organization.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Create New Company
            </button>
            {companies.length > 0 && (
              <a
                href="#companies"
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 text-white border border-zinc-700/50 rounded-xl transition-all duration-200"
              >
                View Existing Companies
                <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
            <div>
              <div className="text-3xl font-bold text-emerald-400">16</div>
              <div className="text-sm text-zinc-500">Industries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-400">80+</div>
              <div className="text-sm text-zinc-500">AI Agent Types</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">∞</div>
              <div className="text-sm text-zinc-500">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies */}
      {companies.length > 0 && (
        <div id="companies" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6 text-zinc-400" />
            <h2 className="text-2xl font-bold">Your Companies</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-zinc-800 rounded-full text-xs text-zinc-400">{companies.length}</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const gradient = INDUSTRY_COLORS[company.industry] || 'from-zinc-500 to-zinc-600'
              return (
                <button
                  key={company.id}
                  onClick={() => onSelectCompany(company.id)}
                  className="group relative text-left bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 hover:bg-zinc-900/80 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-emerald-400 transition-colors">{company.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{company.industry}</p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {company._count?.agents || company.agents?.length || 0} agents
                    </span>
                    <span>{company._count?.departments || company.departments?.length || 0} depts</span>
                    <span>{company._count?.tasks || company.tasks?.length || 0} tasks</span>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDelete(e, company.id)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/50 text-zinc-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              )
            })}

            {/* Create new card */}
            <button
              onClick={onCreateNew}
              className="text-left bg-zinc-900/30 border border-dashed border-zinc-700/50 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-500/10">
                <Plus className="w-6 h-6 text-zinc-500" />
              </div>
              <span className="text-sm text-zinc-500">Create New Company</span>
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🏭', title: 'Create Your Company', desc: 'Select an industry and watch as AI generates your entire organizational structure with departments and specialized agents.' },
            { icon: '🤖', title: 'AI Agents as Employees', desc: 'Each agent has a role, personality, skills, and memory. They collaborate like real team members.' },
            { icon: '🧠', title: 'Company Brain', desc: 'Central intelligence that monitors everything, generates insights, and helps you make strategic decisions.' },
          ].map((feature, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-zinc-500">Carbonclip — AI Business Operating System</span>
          </div>
          <span className="text-xs text-zinc-600">Launch. Create. Grow.</span>
        </div>
      </div>
    </div>
  )
}

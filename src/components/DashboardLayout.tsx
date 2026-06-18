import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Zap, LayoutDashboard, Brain, Users, ListTodo, BarChart3, Workflow, Settings, Activity, ChevronRight } from 'lucide-react'
import type { Company } from './CarbonclipApp'
import { CompanyBrain } from './CompanyBrain'
import { TeamView } from './TeamView'
import { TaskManager } from './TaskManager'
import { AnalyticsView } from './AnalyticsView'
import { ActivityFeed } from './ActivityFeed'

interface DashboardLayoutProps {
  companyId: string
  onBack: () => void
}

type Tab = 'overview' | 'brain' | 'team' | 'tasks' | 'analytics' | 'activities'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'brain', label: 'Company Brain', icon: Brain },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activities', label: 'Activity', icon: Activity },
]

export function DashboardLayout({ companyId, onBack }: DashboardLayoutProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  const fetchCompany = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${companyId}/full`)
      const data = await res.json()
      setCompany(data.company)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => { fetchCompany() }, [fetchCompany])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading company...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Company not found</p>
          <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 text-sm">← Back to home</button>
        </div>
      </div>
    )
  }

  const agentCount = company.agents?.length || 0
  const deptCount = company.departments?.length || 0
  const taskCount = company.tasks?.length || 0
  const completedTasks = company.tasks?.filter(t => t.status === 'completed').length || 0
  const pendingTasks = company.tasks?.filter(t => t.status === 'pending').length || 0
  const inProgressTasks = company.tasks?.filter(t => t.status === 'in_progress').length || 0

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800/50 flex flex-col shrink-0">
        {/* Company Header */}
        <div className="p-4 border-b border-zinc-800/50">
          <button onClick={onBack} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs mb-3">
            <ArrowLeft className="w-3 h-3" />
            All Companies
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{company.name}</h2>
              <p className="text-xs text-zinc-500 truncate">{company.industry}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  tab === t.id
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </nav>

        {/* Stats */}
        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Agents</span>
            <span className="text-zinc-300 font-medium">{agentCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Departments</span>
            <span className="text-zinc-300 font-medium">{deptCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Tasks</span>
            <span className="text-zinc-300 font-medium">{taskCount}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {tab === 'overview' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Welcome to {company.name}</h1>
                <p className="text-zinc-400 text-sm mt-1">Here's your company overview</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTab('brain')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors">
                  <Brain className="w-4 h-4" />
                  Talk to Brain
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="AI Agents" value={agentCount} color="emerald" />
              <StatCard label="Departments" value={deptCount} color="violet" />
              <StatCard label="Completed" value={completedTasks} color="blue" />
              <StatCard label="In Progress" value={inProgressTasks} color="amber" />
            </div>

            {/* Departments Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Departments</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {company.departments?.map(dept => (
                  <button
                    key={dept.id}
                    onClick={() => setTab('team')}
                    className="text-left bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700/50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm group-hover:text-emerald-400 transition-colors">{dept.name}</h3>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{dept.description}</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-500">{dept.agents?.length || 0} agents</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-2">
                {company.activities?.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 bg-zinc-900/30 rounded-lg px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-300">{activity.message}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {(!company.activities || company.activities.length === 0) && (
                  <p className="text-sm text-zinc-500">No activity yet. Start by chatting with your Company Brain!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'brain' && <CompanyBrain companyId={companyId} company={company} />}
        {tab === 'team' && <TeamView companyId={companyId} company={company} onRefresh={fetchCompany} />}
        {tab === 'tasks' && <TaskManager companyId={companyId} company={company} onRefresh={fetchCompany} />}
        {tab === 'analytics' && <AnalyticsView companyId={companyId} />}
        {tab === 'activities' && <ActivityFeed companyId={companyId} activities={company.activities || []} />}
      </main>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  }
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
      <div className={`text-3xl font-bold ${colorMap[color]?.split(' ')[0] || 'text-white'}`}>{value}</div>
      <div className="text-sm text-zinc-500 mt-1">{label}</div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, ListTodo, Building2, CheckCircle2, Loader2 } from 'lucide-react'

interface AnalyticsViewProps {
  companyId: string
}

interface AnalyticsData {
  stats: {
    agentCount: number
    taskCount: number
    completedTasks: number
    departmentCount: number
    completionRate: number
  }
  agentsByDepartment: { name: string; count: number }[]
  tasksByStatus: { status: string; count: number }[]
  tasksByPriority: { priority: string; count: number }[]
  recentActivities: any[]
}

export function AnalyticsView({ companyId }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/company/${companyId}/analytics`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [companyId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-zinc-500">Failed to load analytics data.</p>
      </div>
    )
  }

  const maxDeptAgents = Math.max(...data.agentsByDepartment.map(d => d.count), 1)
  const maxTaskStatus = Math.max(...data.tasksByStatus.map(s => s.count), 1)

  const statusColors: Record<string, string> = {
    pending: 'bg-zinc-500',
    in_progress: 'bg-amber-500',
    completed: 'bg-emerald-500',
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
    urgent: 'bg-red-600',
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-zinc-400" />
        <h1 className="text-xl font-bold">Analytics</h1>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total Agents" value={data.stats.agentCount} color="emerald" />
        <StatCard icon={Building2} label="Departments" value={data.stats.departmentCount} color="violet" />
        <StatCard icon={ListTodo} label="Total Tasks" value={data.stats.taskCount} color="blue" />
        <StatCard icon={CheckCircle2} label="Completed" value={data.stats.completedTasks} color="emerald" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${data.stats.completionRate}%`} color="amber" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agents by Department */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Agents by Department</h3>
          <div className="space-y-3">
            {data.agentsByDepartment.map((dept) => (
              <div key={dept.name} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-32 truncate">{dept.name}</span>
                <div className="flex-1 h-6 bg-zinc-800/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-end px-2 transition-all duration-500"
                    style={{ width: `${(dept.count / maxDeptAgents) * 100}%`, minWidth: dept.count > 0 ? '32px' : '0' }}
                  >
                    <span className="text-[10px] text-white font-medium">{dept.count}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.agentsByDepartment.length === 0 && (
              <p className="text-xs text-zinc-600">No department data yet.</p>
            )}
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Tasks by Status</h3>
          <div className="space-y-3">
            {data.tasksByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-24 capitalize">{item.status.replace('_', ' ')}</span>
                <div className="flex-1 h-6 bg-zinc-800/50 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${statusColors[item.status] || 'bg-zinc-500'} rounded-lg flex items-center justify-end px-2 transition-all duration-500`}
                    style={{ width: `${(item.count / maxTaskStatus) * 100}%`, minWidth: item.count > 0 ? '32px' : '0' }}
                  >
                    <span className="text-[10px] text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
            {data.tasksByStatus.length === 0 && (
              <p className="text-xs text-zinc-600">No task data yet. Create tasks to see analytics.</p>
            )}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {data.tasksByPriority.map((item) => {
              const total = data.tasksByPriority.reduce((s, p) => s + p.count, 0) || 1
              return (
                <div key={item.priority} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-24 capitalize">{item.priority}</span>
                  <div className="flex-1 h-6 bg-zinc-800/50 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${priorityColors[item.priority] || 'bg-zinc-500'} rounded-lg flex items-center justify-end px-2 transition-all duration-500`}
                      style={{ width: `${(item.count / total) * 100}%`, minWidth: item.count > 0 ? '32px' : '0' }}
                    >
                      <span className="text-[10px] text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {data.tasksByPriority.length === 0 && (
              <p className="text-xs text-zinc-600">No task data yet.</p>
            )}
          </div>
        </div>

        {/* Score Distribution Visual */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Workforce Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">{data.stats.agentCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Active Agents</div>
            </div>
            <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-violet-400">{data.stats.departmentCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Departments</div>
            </div>
            <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{data.stats.taskCount}</div>
              <div className="text-xs text-zinc-500 mt-1">Total Tasks</div>
            </div>
            <div className="bg-zinc-800/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{data.stats.completionRate}%</div>
              <div className="text-xs text-zinc-500 mt-1">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400',
    violet: 'bg-violet-500/10 text-violet-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
  }
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colorMap[color] || ''} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}

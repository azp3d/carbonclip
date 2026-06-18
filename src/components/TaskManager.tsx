import { useState } from 'react'
import { ListTodo, Plus, Clock, CheckCircle2, AlertCircle, Circle, Loader2, X, Filter } from 'lucide-react'
import type { Company, Task } from './CarbonclipApp'

interface TaskManagerProps {
  companyId: string
  company: Company
  onRefresh: () => void
}

const STATUS_CONFIG: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: 'text-zinc-400', label: 'Pending' },
  in_progress: { icon: Loader2, color: 'text-amber-400', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Completed' },
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10' },
  urgent: { color: 'text-red-500', bg: 'bg-red-500/20' },
}

export function TaskManager({ companyId, company, onRefresh }: TaskManagerProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [tasks, setTasks] = useState<Task[]>(company.tasks || [])
  const [loading, setLoading] = useState(false)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    departmentId: '',
  })

  const refreshTasks = async () => {
    try {
      const res = await fetch(`/api/company/${companyId}/full`)
      const data = await res.json()
      setTasks(data.company?.tasks || [])
      onRefresh()
    } catch { /* ignore */ }
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return
    setLoading(true)
    try {
      await fetch(`/api/company/${companyId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      })
      await refreshTasks()
      setShowCreate(false)
      setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', departmentId: '' })
    } catch { /* ignore */ }
    setLoading(false)
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await refreshTasks()
    } catch { /* ignore */ }
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListTodo className="w-5 h-5 text-zinc-400" />
          <h1 className="text-xl font-bold">Task Manager</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', count: tasks.length, color: 'text-white' },
          { label: 'Pending', count: pendingCount, color: 'text-zinc-400' },
          { label: 'In Progress', count: inProgressCount, color: 'text-amber-400' },
          { label: 'Completed', count: completedCount, color: 'text-emerald-400' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setFilter(s.label === 'Total' ? 'all' : s.label === 'Pending' ? 'pending' : s.label === 'In Progress' ? 'in_progress' : 'completed')}
            className={`bg-zinc-900/50 border rounded-xl p-3 text-left transition-all ${
              (filter === 'all' && s.label === 'Total') || filter === s.label.toLowerCase().replace(' ', '_')
                ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800/50'
            }`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-zinc-500">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              {filter === 'all' ? 'No tasks yet. Create your first task!' : `No ${filter} tasks.`}
            </p>
          </div>
        )}

        {filteredTasks.map(task => {
          const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending
          const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
          const StatusIcon = status.icon

          return (
            <div key={task.id} className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 py-3 group hover:border-zinc-700/50 transition-all">
              <button
                onClick={() => {
                  const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending'
                  updateTaskStatus(task.id, nextStatus)
                }}
                className={`shrink-0 ${status.color}`}
              >
                <StatusIcon className={`w-5 h-5 ${task.status === 'in_progress' ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{task.description}</p>
                )}
              </div>

              {task.assignee && (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                    {task.assignee.name.charAt(0)}
                  </div>
                  <span className="text-xs text-zinc-500 hidden md:inline">{task.assignee.name}</span>
                </div>
              )}

              <span className={`text-[10px] px-2 py-0.5 rounded-full ${priority.bg} ${priority.color} shrink-0`}>
                {task.priority}
              </span>

              <span className={`text-xs ${status.color} shrink-0 hidden md:inline`}>
                {status.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800/50 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5">Title *</label>
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="What needs to be done?"
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Assign To</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask(p => ({ ...p, assigneeId: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">Unassigned</option>
                    {company.agents?.map(a => (
                      <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1.5">Department</label>
                <select
                  value={newTask.departmentId}
                  onChange={(e) => setNewTask(p => ({ ...p, departmentId: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">No department</option>
                  {company.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={!newTask.title.trim() || loading}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium text-sm rounded-xl transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

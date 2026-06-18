import { Activity, Bot, MessageCircle, CheckCircle2, Plus, Zap } from 'lucide-react'
import type { Activity as ActivityType } from './CarbonclipApp'

interface ActivityFeedProps {
  companyId: string
  activities: ActivityType[]
}

const ACTIVITY_ICONS: Record<string, { icon: typeof Activity; color: string }> = {
  company_created: { icon: Zap, color: 'text-emerald-400 bg-emerald-500/10' },
  agent_chat: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10' },
  task_assigned: { icon: Plus, color: 'text-amber-400 bg-amber-500/10' },
  task_completed: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  brain_response: { icon: Bot, color: 'text-violet-400 bg-violet-500/10' },
}

export function ActivityFeed({ companyId, activities }: ActivityFeedProps) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-5 h-5 text-zinc-400" />
        <h1 className="text-xl font-bold">Activity Feed</h1>
        <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs text-zinc-400">{activities.length}</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No activity yet. Start using your company to generate activity.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800/50" />

          <div className="space-y-4">
            {activities.map((activity) => {
              const config = ACTIVITY_ICONS[activity.type] || { icon: Activity, color: 'text-zinc-400 bg-zinc-800' }
              const Icon = config.icon

              return (
                <div key={activity.id} className="flex items-start gap-4 pl-1">
                  <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center shrink-0 relative z-10`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-4 py-3 flex-1">
                    <p className="text-sm text-zinc-300">{activity.message}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {activity.agentName && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Bot className="w-2.5 h-2.5" />
                          {activity.agentName}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

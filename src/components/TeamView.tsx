import { useState } from 'react'
import { Users, MessageCircle, Star, Send, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Company, Agent, AgentMessage } from './CarbonclipApp'

interface TeamViewProps {
  companyId: string
  company: Company
  onRefresh: () => void
}

export function TeamView({ companyId, company, onRefresh }: TeamViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [chatMessages, setChatMessages] = useState<AgentMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(company.departments?.map(d => d.id) || []))

  const toggleDept = (id: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAgentChat = async (agent: Agent) => {
    setSelectedAgent(agent)
    try {
      const res = await fetch(`/api/agent/${agent.id}/messages`)
      const data = await res.json()
      setChatMessages(data.messages || [])
    } catch {
      setChatMessages([])
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedAgent || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    const userMsg: AgentMessage = {
      id: `temp-${Date.now()}`,
      content: msg,
      role: 'user',
      agentId: selectedAgent.id,
      createdAt: new Date().toISOString(),
    }
    setChatMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch(`/api/agent/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      const agentMsg: AgentMessage = {
        id: `resp-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        agentId: selectedAgent.id,
        createdAt: new Date().toISOString(),
      }
      setChatMessages(prev => [...prev, agentMsg])
    } catch {
      setChatMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        content: 'Sorry, I encountered an error.',
        role: 'assistant',
        agentId: selectedAgent.id,
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setChatLoading(false)
    }
  }

  const getExpColor = (level: string) => {
    if (level === 'senior') return 'text-amber-400 bg-amber-500/10'
    if (level === 'junior') return 'text-blue-400 bg-blue-500/10'
    return 'text-zinc-400 bg-zinc-800'
  }

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-zinc-400" />
          <h1 className="text-xl font-bold">Your Team</h1>
          <span className="px-2 py-0.5 bg-zinc-800 rounded-full text-xs text-zinc-400">
            {company.agents?.length || 0} agents
          </span>
        </div>

        <div className="space-y-4">
          {company.departments?.map(dept => {
            const expanded = expandedDepts.has(dept.id)
            return (
              <div key={dept.id} className="bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
                <button
                  onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-sm">{dept.name}</h3>
                      <p className="text-xs text-zinc-500">{dept.agents?.length || 0} agents</p>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 grid md:grid-cols-2 gap-2">
                    {dept.agents?.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => openAgentChat(agent)}
                        className="text-left bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                            {agent.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{agent.name}</h4>
                              <MessageCircle className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                            </div>
                            <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getExpColor(agent.experienceLevel)}`}>
                                {agent.experienceLevel}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                <span className="text-[10px] text-zinc-500">{agent.performanceScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat Panel */}
      {selectedAgent && (
        <div className="w-96 border-l border-zinc-800/50 flex flex-col bg-zinc-950/50">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                {selectedAgent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{selectedAgent.name}</h3>
                <p className="text-xs text-zinc-500">{selectedAgent.role}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Agent Info Bar */}
          {selectedAgent.personality && (
            <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800/50 text-xs text-zinc-500">
              <span className="text-zinc-400">Personality:</span> {selectedAgent.personality}
            </div>
          )}

          {/* Skills */}
          {selectedAgent.skills && (
            <div className="px-4 py-2 flex flex-wrap gap-1 border-b border-zinc-800/50">
              {selectedAgent.skills.split(',').map((skill, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-sm text-zinc-500">Start a conversation with {selectedAgent.name}</p>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/10 text-emerald-50 border border-emerald-500/20'
                    : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800/50'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-xs text-zinc-400">{selectedAgent.name} is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${selectedAgent.name}...`}
                className="flex-1 px-3 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-xl transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

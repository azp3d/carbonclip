import { useState, useEffect, useRef } from 'react'
import { Brain, Send, Loader2, Lightbulb, BarChart3, Users, Target, Sparkles } from 'lucide-react'
import type { Company } from './CarbonclipApp'

interface BrainMessage {
  role: 'user' | 'assistant'
  content: string
}

interface BrainInsight {
  type: string
  title: string
  description: string
  action?: string
}

interface CompanyBrainProps {
  companyId: string
  company: Company
}

export function CompanyBrain({ companyId, company }: CompanyBrainProps) {
  const [messages, setMessages] = useState<BrainMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<BrainInsight[]>([])
  const [showInsights, setShowInsights] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetch(`/api/company/${companyId}/brain/insights`)
      .then(r => r.json())
      .then(d => setInsights(d.insights || []))
      .catch(() => {})
  }, [companyId])

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: BrainMessage = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`/api/company/${companyId}/brain/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: 'Company Status', message: 'Give me a company status overview', icon: BarChart3 },
    { label: 'Team Overview', message: 'Show me the team and agents', icon: Users },
    { label: 'Suggestions', message: 'What improvements do you suggest?', icon: Lightbulb },
    { label: 'Strategy', message: 'Help me create a strategy', icon: Target },
  ]

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Company Brain</h1>
            <p className="text-xs text-zinc-500">Central intelligence for {company.name}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${showInsights ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Insights ({insights.length})
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Company Brain</h2>
                <p className="text-sm text-zinc-400 max-w-md mb-8">
                  I have full awareness of your company structure, team performance, and business metrics.
                  Ask me anything about your organization.
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-md w-full">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleSend(action.message)}
                        className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-left hover:border-violet-500/30 hover:bg-zinc-900/80 transition-all group"
                      >
                        <Icon className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-200">{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/10 text-emerald-50 border border-emerald-500/20'
                    : 'bg-zinc-900/50 text-zinc-300 border border-zinc-800/50'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="whitespace-pre-wrap">{renderMarkdown(msg.content)}</div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  <span className="text-sm text-zinc-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/50">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask the Company Brain anything..."
                className="flex-1 px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-3 bg-violet-500 hover:bg-violet-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        {showInsights && (
          <div className="w-72 border-l border-zinc-800/50 bg-zinc-950/50 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className={`rounded-xl p-3 border ${
                  insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                  insight.type === 'suggestion' ? 'bg-violet-500/5 border-violet-500/20' :
                  'bg-zinc-900/50 border-zinc-800/50'
                }`}>
                  <h4 className="text-xs font-medium mb-1">{insight.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{insight.description}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-xs text-zinc-600">No insights yet. Start using your company to generate insights.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(text: string) {
  // Simple markdown rendering for bold, headers, and bullet points
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="font-semibold text-white mt-2">{line.replace(/\*\*/g, '')}</div>
      }
      if (line.startsWith('• ')) {
        return <div key={i} className="pl-2 text-zinc-400">• {line.slice(2)}</div>
      }
      if (line.match(/^\d+\./)) {
        return <div key={i} className="pl-2 text-zinc-400">{line}</div>
      }
      return <div key={i}>{line}</div>
    })
}

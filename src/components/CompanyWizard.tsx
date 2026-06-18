import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Zap, Building2, FileText, Target, Users, Sparkles, Loader2 } from 'lucide-react'
import type { Industry } from './CarbonclipApp'

interface CompanyWizardProps {
  onBack: () => void
  onComplete: (companyId: string) => void
}

const STEPS = [
  { id: 'industry', label: 'Industry', icon: Building2 },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'review', label: 'Review', icon: Check },
]

export function CompanyWizard({ onBack, onComplete }: CompanyWizardProps) {
  const [step, setStep] = useState(0)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    goals: '',
    services: '',
    targetAudience: '',
    brandInfo: '',
    ownerEmail: '',
  })

  useEffect(() => {
    fetch('/api/industries')
      .then(r => r.json())
      .then(d => { setIndustries(d.industries || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))
  const selectedIndustry = industries.find(i => i.name === formData.industry)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.company) {
        onComplete(data.company.id)
      }
    } catch {
      alert('Failed to create company. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const canNext = () => {
    if (step === 0) return !!formData.industry
    if (step === 1) return !!formData.name.trim()
    return true
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <span className="font-bold">Carbonclip</span>
          </div>
          <div className="w-20" />
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                i < step ? 'bg-emerald-500 text-black' :
                i === step ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                'bg-zinc-800 text-zinc-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i === step ? 'text-white' : 'text-zinc-500'}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Your Industry</h2>
              <p className="text-zinc-400 mb-8">Choose the industry for your company. We'll auto-generate the perfect team structure.</p>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => update('industry', industry.name)}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        formData.industry === industry.name
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{industry.name}</div>
                      <div className="text-xs text-zinc-500">
                        {industry.departmentCount} depts · {industry.agentCount} agents
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Company Details</h2>
                <p className="text-zinc-400">Tell us about your company.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="What does your company do?"
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Services / Products</label>
                  <input
                    value={formData.services}
                    onChange={(e) => update('services', e.target.value)}
                    placeholder="What services or products do you offer?"
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Information</label>
                  <input
                    value={formData.brandInfo}
                    onChange={(e) => update('brandInfo', e.target.value)}
                    placeholder="Brand values, tone, style..."
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Goals & Audience</h2>
                <p className="text-zinc-400">Help your AI team understand your vision.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Goals</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => update('goals', e.target.value)}
                    placeholder="What are your main business goals? (e.g., launch MVP in 3 months, reach 10K users...)"
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => update('targetAudience', e.target.value)}
                    placeholder="Who is your target audience? (e.g., small businesses, tech enthusiasts, millennials...)"
                    rows={3}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email (Optional)</label>
                  <input
                    value={formData.ownerEmail}
                    onChange={(e) => update('ownerEmail', e.target.value)}
                    placeholder="owner@company.com"
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Launch</h2>
                <p className="text-zinc-400">Your AI team is ready to be created.</p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{formData.name || 'Untitled Company'}</h3>
                    <p className="text-sm text-zinc-400">{formData.industry}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Description</span>
                    <p className="text-zinc-300">{formData.description || '—'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Goals</span>
                    <p className="text-zinc-300">{formData.goals || '—'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Services</span>
                    <p className="text-zinc-300">{formData.services || '—'}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Target Audience</span>
                    <p className="text-zinc-300">{formData.targetAudience || '—'}</p>
                  </div>
                </div>

                {selectedIndustry && (
                  <div className="pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium">Auto-Generated Team</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedIndustry && (
                        <div className="text-sm">
                          <span className="text-zinc-500">{selectedIndustry.departmentCount}</span> <span className="text-zinc-400">Departments</span>
                        </div>
                      )}
                      {selectedIndustry && (
                        <div className="text-sm">
                          <span className="text-zinc-500">{selectedIndustry.agentCount}</span> <span className="text-zinc-400">AI Agents</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-zinc-500">1</span> <span className="text-zinc-400">Company Brain</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between py-8 border-t border-zinc-800/50 mt-8">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onBack()}
            className="flex items-center gap-2 px-5 py-2.5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext() && setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:from-zinc-800 disabled:to-zinc-800 text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Company...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Launch Company
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

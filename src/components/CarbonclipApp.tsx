import { useState, useEffect, useCallback } from 'react'
import { LandingPage } from './LandingPage'
import { CompanyWizard } from './CompanyWizard'
import { DashboardLayout } from './DashboardLayout'

export type Page = 'landing' | 'wizard' | 'dashboard'

export interface Company {
  id: string
  name: string
  industry: string
  description?: string
  goals?: string
  services?: string
  targetAudience?: string
  brandInfo?: string
  status: string
  ownerEmail?: string
  createdAt: string
  departments?: Department[]
  agents?: Agent[]
  tasks?: Task[]
  brainMemories?: BrainMemory[]
  workflows?: Workflow[]
  activities?: Activity[]
  _count?: { agents: number; departments: number; tasks: number }
}

export interface Department {
  id: string
  name: string
  description?: string
  icon?: string
  companyId: string
  agents?: Agent[]
  tasks?: Task[]
  _count?: { agents: number }
}

export interface Agent {
  id: string
  name: string
  role: string
  personality?: string
  skills?: string
  experienceLevel: string
  performanceScore: number
  status: string
  systemPrompt?: string
  avatar?: string
  departmentId?: string
  department?: Department
  companyId: string
  tasks?: Task[]
  messages?: AgentMessage[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assigneeId?: string
  assignee?: Agent
  companyId: string
  departmentId?: string
  department?: Department
  dueDate?: string
  output?: string
  createdAt: string
}

export interface AgentMessage {
  id: string
  content: string
  role: string
  agentId: string
  createdAt: string
}

export interface BrainMemory {
  id: string
  content: string
  category: string
  companyId: string
  createdAt: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  steps?: string
  status: string
  companyId: string
}

export interface Activity {
  id: string
  type: string
  message: string
  agentName?: string
  companyId: string
  createdAt: string
}

export interface Industry {
  id: string
  name: string
  departmentCount: number
  agentCount: number
}

export function CarbonclipApp() {
  const [page, setPage] = useState<Page>('landing')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/companies')
      const data = await res.json()
      setCompanies(data.companies || [])
    } catch {
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  const handleCompanyCreated = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setPage('dashboard')
    fetchCompanies()
  }

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setPage('dashboard')
  }

  const handleBackToLanding = () => {
    setSelectedCompanyId(null)
    setPage('landing')
    fetchCompanies()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading Carbonclip...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {page === 'landing' && (
        <LandingPage
          companies={companies}
          onSelectCompany={handleSelectCompany}
          onCreateNew={() => setPage('wizard')}
        />
      )}
      {page === 'wizard' && (
        <CompanyWizard
          onBack={() => setPage('landing')}
          onComplete={handleCompanyCreated}
        />
      )}
      {page === 'dashboard' && selectedCompanyId && (
        <DashboardLayout
          companyId={selectedCompanyId}
          onBack={handleBackToLanding}
        />
      )}
    </div>
  )
}

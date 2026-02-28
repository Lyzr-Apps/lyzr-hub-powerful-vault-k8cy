'use client'

import React, { useState, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  HiOutlineBellAlert,
  HiOutlineCreditCard,
  HiOutlineChartBarSquare,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import { Loader2 } from 'lucide-react'

import Sidebar, { type NavSection } from './sections/Sidebar'
import DashboardSection from './sections/DashboardSection'
import AnalyticsSection from './sections/AnalyticsSection'
import AccountManagementSection from './sections/AccountManagementSection'
import SettingsSection from './sections/SettingsSection'

const CREDIT_MONITOR_AGENT = '69a2915e27b2efe3a887db3a'
const USAGE_ANALYTICS_AGENT = '69a2915f7feec6663e53dac3'
const ACCOUNT_ADVISOR_AGENT = '69a29172e72641e0c6070b7f'

const THEME_VARS: React.CSSProperties & Record<string, string> = {
  '--background': '220 15% 97%',
  '--foreground': '220 20% 15%',
  '--card': '0 0% 100%',
  '--card-foreground': '220 20% 15%',
  '--primary': '220 75% 50%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '220 12% 92%',
  '--secondary-foreground': '220 20% 15%',
  '--accent': '160 65% 40%',
  '--accent-foreground': '0 0% 100%',
  '--destructive': '0 70% 50%',
  '--destructive-foreground': '0 0% 100%',
  '--muted': '220 10% 90%',
  '--muted-foreground': '220 12% 50%',
  '--border': '220 15% 88%',
  '--input': '220 15% 88%',
  '--ring': '220 75% 50%',
  '--radius': '0.125rem',
  '--sidebar-background': '220 14% 95%',
  '--sidebar-primary': '220 75% 50%',
}

const DEFAULT_ACCOUNTS = [
  { id: 'acc-001', name: 'Production Main', apiKey: '------7f3a', status: 'active', credits: { allocated: 50000, used: 32500, remaining: 17500 }, lastSync: '2026-02-28T10:30:00Z' },
  { id: 'acc-002', name: 'Development Team', apiKey: '------2b1c', status: 'active', credits: { allocated: 25000, used: 18750, remaining: 6250 }, lastSync: '2026-02-28T10:28:00Z' },
  { id: 'acc-003', name: 'Staging Environment', apiKey: '------9d4e', status: 'active', credits: { allocated: 10000, used: 2500, remaining: 7500 }, lastSync: '2026-02-28T10:25:00Z' },
  { id: 'acc-004', name: 'Research Lab', apiKey: '------5k8m', status: 'active', credits: { allocated: 15000, used: 14200, remaining: 800 }, lastSync: '2026-02-28T09:15:00Z' },
]

const SAMPLE_MONITOR = {
  overall_status: 'Warning: 1 account approaching credit limit',
  total_credits: { allocated: 100000, used: 67950, remaining: 32050, usage_percentage: 68 },
  account_summaries: [
    { account_name: 'Production Main', account_id: 'acc-001', allocated: 50000, used: 32500, remaining: 17500, usage_percentage: 65, status: 'healthy' },
    { account_name: 'Development Team', account_id: 'acc-002', allocated: 25000, used: 18750, remaining: 6250, usage_percentage: 75, status: 'warning' },
    { account_name: 'Staging Environment', account_id: 'acc-003', allocated: 10000, used: 2500, remaining: 7500, usage_percentage: 25, status: 'healthy' },
    { account_name: 'Research Lab', account_id: 'acc-004', allocated: 15000, used: 14200, remaining: 800, usage_percentage: 95, status: 'critical' },
  ],
  alerts: [
    { severity: 'critical', account_name: 'Research Lab', message: 'Credit balance critically low - only 800 credits remaining (5.3% of allocation)', threshold: 10 },
    { severity: 'warning', account_name: 'Development Team', message: 'Usage approaching 75% threshold - consider rebalancing credits', threshold: 25 },
  ],
  last_updated: '2026-02-28T10:30:00Z',
}

const SAMPLE_ANALYTICS = {
  trend_summary: 'Overall credit consumption has increased by 12% over the past 30 days. Research Lab shows the highest burn rate while Staging Environment remains significantly underutilized.',
  period: 'Last 30 days',
  account_analytics: [
    { account_name: 'Production Main', total_consumed: 32500, avg_daily_usage: 1083, trend: 'stable', efficiency_score: 82, utilization_rate: 65 },
    { account_name: 'Development Team', total_consumed: 18750, avg_daily_usage: 625, trend: 'increasing', efficiency_score: 71, utilization_rate: 75 },
    { account_name: 'Staging Environment', total_consumed: 2500, avg_daily_usage: 83, trend: 'stable', efficiency_score: 45, utilization_rate: 25 },
    { account_name: 'Research Lab', total_consumed: 14200, avg_daily_usage: 473, trend: 'increasing', efficiency_score: 88, utilization_rate: 95 },
  ],
  time_series_data: [
    { date: 'Feb 22', total_usage: 1850, by_account: { details: 'Prod: 900, Dev: 500, Staging: 100, Research: 350' } },
    { date: 'Feb 23', total_usage: 2100, by_account: { details: 'Prod: 1000, Dev: 550, Staging: 80, Research: 470' } },
    { date: 'Feb 24', total_usage: 1900, by_account: { details: 'Prod: 950, Dev: 480, Staging: 90, Research: 380' } },
    { date: 'Feb 25', total_usage: 2300, by_account: { details: 'Prod: 1100, Dev: 600, Staging: 120, Research: 480' } },
    { date: 'Feb 26', total_usage: 2450, by_account: { details: 'Prod: 1150, Dev: 650, Staging: 85, Research: 565' } },
    { date: 'Feb 27', total_usage: 2200, by_account: { details: 'Prod: 1050, Dev: 580, Staging: 95, Research: 475' } },
    { date: 'Feb 28', total_usage: 2400, by_account: { details: 'Prod: 1100, Dev: 620, Staging: 110, Research: 570' } },
  ],
  recommendations: [
    { title: 'Rebalance Research Lab', description: 'Transfer 3000 credits from Staging Environment to Research Lab to prevent service disruption.', impact: 'Prevents potential downtime', priority: 'high' },
    { title: 'Optimize Dev Team Usage', description: 'Development Team efficiency score is below target. Review workflow patterns to reduce waste.', impact: 'Save 15% on Dev credits', priority: 'medium' },
    { title: 'Right-size Staging', description: 'Staging Environment is underutilized at 25%. Consider reducing allocation and redistributing.', impact: 'Free up 5000 credits', priority: 'low' },
  ],
  total_consumption: 67950,
}

const SAMPLE_ADVISOR = {
  assessment_summary: 'Account portfolio health is moderate. The Research Lab account requires immediate attention due to near-depletion. Staging Environment has significant unused capacity that should be redistributed. Overall credit efficiency can be improved by 18% through recommended rebalancing.',
  health_score: 72,
  rebalancing_recommendations: [
    { from_account: 'Staging Environment', to_account: 'Research Lab', amount: 3000, reason: 'Research Lab at 95% utilization with only 800 credits remaining. Staging has 7500 unused credits.', risk_level: 'low', priority: 'high' },
    { from_account: 'Production Main', to_account: 'Development Team', amount: 2000, reason: 'Dev Team approaching 75% threshold. Production has comfortable buffer.', risk_level: 'medium', priority: 'medium' },
  ],
  consolidation_suggestions: [
    { suggestion: 'Merge Staging and Development environments under a shared credit pool', accounts_affected: 'Staging Environment, Development Team', estimated_savings: '2500 credits/month', implementation_effort: 'medium' },
    { suggestion: 'Set up automated credit alerts at 80% threshold for all accounts', accounts_affected: 'All accounts', estimated_savings: 'Prevents overages', implementation_effort: 'low' },
  ],
  action_items: [
    { action: 'Transfer 3000 credits from Staging to Research Lab immediately', priority: 'high', estimated_impact: 'Prevents Research Lab service disruption', timeline: 'Immediate' },
    { action: 'Review Development Team usage patterns and optimize workflows', priority: 'medium', estimated_impact: 'Save 15% on monthly Dev consumption', timeline: '1-2 weeks' },
    { action: 'Implement shared credit pool for non-production accounts', priority: 'low', estimated_impact: 'Reduce overall idle credits by 20%', timeline: '1 month' },
  ],
}

const AGENTS = [
  { id: CREDIT_MONITOR_AGENT, name: 'Credit Monitor', purpose: 'Analyzes credit balances and generates alerts', icon: <HiOutlineCreditCard className="h-3 w-3" /> },
  { id: USAGE_ANALYTICS_AGENT, name: 'Usage Analytics', purpose: 'Analyzes consumption trends and optimization', icon: <HiOutlineChartBarSquare className="h-3 w-3" /> },
  { id: ACCOUNT_ADVISOR_AGENT, name: 'Account Advisor', purpose: 'Recommends rebalancing and consolidation', icon: <HiOutlineUserGroup className="h-3 w-3" /> },
]

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showSampleData, setShowSampleData] = useState(false)
  const [accounts] = useState(DEFAULT_ACCOUNTS)

  const [monitorData, setMonitorData] = useState<Record<string, any> | null>(null)
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [monitorError, setMonitorError] = useState<string | null>(null)

  const [analyticsData, setAnalyticsData] = useState<Record<string, any> | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const [advisorData, setAdvisorData] = useState<Record<string, any> | null>(null)
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorError, setAdvisorError] = useState<string | null>(null)

  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  const accountContext = accounts.map(a => `- ${a.name} (${a.id}): Allocated ${a.credits.allocated}, Used ${a.credits.used}, Remaining ${a.credits.remaining}`).join('\n')

  const handleRefreshCredits = useCallback(async () => {
    if (showSampleData) { setMonitorData(SAMPLE_MONITOR); return }
    setMonitorLoading(true)
    setMonitorError(null)
    setActiveAgentId(CREDIT_MONITOR_AGENT)
    try {
      const result = await callAIAgent(`Analyze the following connected Lyzr accounts and provide credit status:\n${accountContext}`, CREDIT_MONITOR_AGENT)
      if (result.success) {
        setMonitorData(result?.response?.result ?? null)
      } else {
        setMonitorError(result?.error ?? 'Failed to fetch credit data')
      }
    } catch {
      setMonitorError('Network error')
    } finally {
      setMonitorLoading(false)
      setActiveAgentId(null)
    }
  }, [accountContext, showSampleData])

  const handleGenerateInsights = useCallback(async () => {
    if (showSampleData) { setAnalyticsData(SAMPLE_ANALYTICS); return }
    setAnalyticsLoading(true)
    setAnalyticsError(null)
    setActiveAgentId(USAGE_ANALYTICS_AGENT)
    try {
      const result = await callAIAgent(`Analyze usage trends and provide optimization insights for these accounts:\n${accountContext}`, USAGE_ANALYTICS_AGENT)
      if (result.success) {
        setAnalyticsData(result?.response?.result ?? null)
      } else {
        setAnalyticsError(result?.error ?? 'Failed to generate insights')
      }
    } catch {
      setAnalyticsError('Network error')
    } finally {
      setAnalyticsLoading(false)
      setActiveAgentId(null)
    }
  }, [accountContext, showSampleData])

  const handleGetRecommendations = useCallback(async () => {
    if (showSampleData) { setAdvisorData(SAMPLE_ADVISOR); return }
    setAdvisorLoading(true)
    setAdvisorError(null)
    setActiveAgentId(ACCOUNT_ADVISOR_AGENT)
    try {
      const result = await callAIAgent(`Review account configurations and recommend rebalancing strategies:\n${accountContext}`, ACCOUNT_ADVISOR_AGENT)
      if (result.success) {
        setAdvisorData(result?.response?.result ?? null)
      } else {
        setAdvisorError(result?.error ?? 'Failed to get recommendations')
      }
    } catch {
      setAdvisorError('Network error')
    } finally {
      setAdvisorLoading(false)
      setActiveAgentId(null)
    }
  }, [accountContext, showSampleData])

  const handleSampleToggle = (on: boolean) => {
    setShowSampleData(on)
    if (on) {
      setMonitorData(SAMPLE_MONITOR)
      setAnalyticsData(SAMPLE_ANALYTICS)
      setAdvisorData(SAMPLE_ADVISOR)
      setMonitorError(null)
      setAnalyticsError(null)
      setAdvisorError(null)
    } else {
      setMonitorData(null)
      setAnalyticsData(null)
      setAdvisorData(null)
    }
  }

  const alertCount = showSampleData ? (SAMPLE_MONITOR.alerts?.length ?? 0) : (Array.isArray(monitorData?.alerts) ? monitorData.alerts.length : 0)

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-[hsl(220,15%,97%)] text-[hsl(220,20%,15%)] font-sans">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            alertCount={alertCount}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(p => !p)}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-10 border-b border-[hsl(220,15%,88%)] bg-white flex items-center justify-between px-4 flex-shrink-0">
              <h1 className="text-sm font-semibold tracking-tight text-[hsl(220,20%,15%)]">Multi-Account Credit Hub</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="sample-toggle" className="text-[10px] text-[hsl(220,12%,50%)] font-medium">Sample Data</Label>
                  <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={handleSampleToggle} className="scale-75" />
                </div>
                <div className="relative">
                  <HiOutlineBellAlert className="h-4 w-4 text-[hsl(220,12%,50%)]" />
                  {alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[hsl(0,70%,50%)] text-white text-[8px] flex items-center justify-center font-semibold">{alertCount}</span>
                  )}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto p-3">
              {activeSection === 'dashboard' && (
                <DashboardSection
                  accounts={accounts}
                  monitorData={monitorData}
                  loading={monitorLoading}
                  error={monitorError}
                  onRefresh={handleRefreshCredits}
                />
              )}
              {activeSection === 'analytics' && (
                <AnalyticsSection
                  accounts={accounts}
                  analyticsData={analyticsData}
                  loading={analyticsLoading}
                  error={analyticsError}
                  onGenerate={handleGenerateInsights}
                />
              )}
              {activeSection === 'accounts' && (
                <AccountManagementSection
                  accounts={accounts}
                  advisorData={advisorData}
                  loading={advisorLoading}
                  error={advisorError}
                  onGetRecommendations={handleGetRecommendations}
                />
              )}
              {activeSection === 'settings' && (
                <SettingsSection accounts={accounts} />
              )}

              <Card className="mt-4 rounded-sm border border-[hsl(220,15%,88%)] shadow-none bg-white">
                <CardContent className="py-2 px-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-[10px] font-medium text-[hsl(220,12%,50%)] uppercase tracking-wider">Agents</span>
                    <Separator orientation="vertical" className="h-4 bg-[hsl(220,15%,88%)]" />
                    {AGENTS.map(agent => (
                      <div key={agent.id} className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${activeAgentId === agent.id ? 'bg-[hsl(160,65%,40%)] animate-pulse' : 'bg-[hsl(220,10%,80%)]'}`} />
                        {agent.icon}
                        <span className="text-[10px] text-[hsl(220,20%,15%)] font-medium">{agent.name}</span>
                        {activeAgentId === agent.id && <Loader2 className="h-2.5 w-2.5 animate-spin text-[hsl(220,75%,50%)]" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

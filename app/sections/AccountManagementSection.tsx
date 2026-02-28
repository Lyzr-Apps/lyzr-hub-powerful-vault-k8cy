'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineArrowsRightLeft,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentCheck,
} from 'react-icons/hi2'
import { Loader2 } from 'lucide-react'

interface AccountData {
  id: string
  name: string
  apiKey: string
  status: string
  credits: { allocated: number; used: number; remaining: number }
  lastSync: string
}

interface AdvisorResponse {
  assessment_summary?: string
  health_score?: number
  rebalancing_recommendations?: { from_account?: string; to_account?: string; amount?: number; reason?: string; risk_level?: string; priority?: string }[]
  consolidation_suggestions?: { suggestion?: string; accounts_affected?: string; estimated_savings?: string; implementation_effort?: string }[]
  action_items?: { action?: string; priority?: string; estimated_impact?: string; timeline?: string }[]
}

interface AccountManagementSectionProps {
  accounts: AccountData[]
  advisorData: AdvisorResponse | null
  loading: boolean
  error: string | null
  onGetRecommendations: () => void
}

function riskColor(r?: string): string {
  const s = (r ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return 'bg-[hsl(0,70%,50%)] text-white'
  if (s === 'medium') return 'bg-[hsl(35,80%,50%)] text-white'
  return 'bg-[hsl(160,65%,40%)] text-white'
}

function priorityColor(p?: string): string {
  const s = (p ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return 'bg-[hsl(0,70%,50%)] text-white'
  if (s === 'medium') return 'bg-[hsl(35,80%,50%)] text-white'
  return 'bg-[hsl(220,75%,50%)] text-white'
}

function effortBadge(e?: string) {
  const s = (e ?? '').toLowerCase()
  if (s === 'high') return <Badge variant="outline" className="rounded-sm text-[10px] border-[hsl(0,70%,50%)] text-[hsl(0,70%,50%)]">{e}</Badge>
  if (s === 'medium') return <Badge variant="outline" className="rounded-sm text-[10px] border-[hsl(35,80%,50%)] text-[hsl(35,80%,50%)]">{e}</Badge>
  return <Badge variant="outline" className="rounded-sm text-[10px] border-[hsl(160,65%,40%)] text-[hsl(160,65%,40%)]">{e ?? 'low'}</Badge>
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-xs mt-2 mb-0.5">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-sm mt-2 mb-0.5">{line.slice(3)}</h3>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-3 list-disc text-xs">{line.slice(2)}</li>
        if (!line.trim()) return <div key={i} className="h-0.5" />
        return <p key={i} className="text-xs">{line}</p>
      })}
    </div>
  )
}

export default function AccountManagementSection({ accounts, advisorData, loading, error, onGetRecommendations }: AccountManagementSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rebalancing = Array.isArray(advisorData?.rebalancing_recommendations) ? advisorData.rebalancing_recommendations : []
  const consolidation = Array.isArray(advisorData?.consolidation_suggestions) ? advisorData.consolidation_suggestions : []
  const actionItems = Array.isArray(advisorData?.action_items) ? advisorData.action_items : []
  const hasData = advisorData !== null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[hsl(220,20%,15%)]">Account Management</h2>
          {advisorData?.assessment_summary && (
            <p className="text-xs text-[hsl(220,12%,50%)] mt-0.5 max-w-lg truncate">{advisorData.assessment_summary}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {advisorData?.health_score !== undefined && advisorData.health_score !== null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-[hsl(220,12%,50%)]">Health</span>
              <div className="flex items-center gap-1">
                <Progress value={advisorData.health_score} className="h-1.5 w-12 rounded-sm" />
                <span className="text-xs font-semibold text-[hsl(220,20%,15%)] tabular-nums">{advisorData.health_score}%</span>
              </div>
            </div>
          )}
          <Button size="sm" onClick={onGetRecommendations} disabled={loading} className="h-7 text-xs rounded-sm bg-[hsl(220,75%,50%)] hover:bg-[hsl(220,75%,45%)]">
            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <HiOutlineClipboardDocumentCheck className="h-3 w-3 mr-1" />}
            Get Recommendations
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border border-[hsl(0,70%,90%)] bg-[hsl(0,70%,97%)] rounded-sm shadow-none">
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <p className="text-xs text-[hsl(0,70%,40%)]">{error}</p>
            <Button variant="outline" size="sm" onClick={onGetRecommendations} className="ml-auto h-6 text-[10px] rounded-sm">Retry</Button>
          </CardContent>
        </Card>
      )}

      {advisorData?.assessment_summary && advisorData.assessment_summary.length > 80 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardContent className="py-2 px-3">
            <div className="text-xs text-[hsl(220,20%,15%)]">{renderMarkdown(advisorData.assessment_summary)}</div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-semibold tracking-tight">All Accounts</CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <ScrollArea className="max-h-[320px]">
            <table className="w-full text-xs">
              <thead className="bg-[hsl(220,14%,95%)]">
                <tr>
                  <th className="w-6"></th>
                  <th className="text-left py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Account Name</th>
                  <th className="text-center py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">API Status</th>
                  <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Balance</th>
                  <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Last Sync</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-[hsl(220,15%,88%)]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-1.5 px-3"><Skeleton className="h-3 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : (
                  accounts.map((acc) => {
                    const pct = acc.credits.allocated > 0 ? Math.round((acc.credits.used / acc.credits.allocated) * 100) : 0
                    const isExpanded = expandedId === acc.id
                    return (
                      <React.Fragment key={acc.id}>
                        <tr
                          className="border-t border-[hsl(220,15%,88%)] hover:bg-[hsl(220,14%,97%)] cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : acc.id)}
                        >
                          <td className="py-1.5 px-2 text-center">
                            {isExpanded ? <HiOutlineChevronUp className="h-3 w-3 text-[hsl(220,12%,50%)]" /> : <HiOutlineChevronDown className="h-3 w-3 text-[hsl(220,12%,50%)]" />}
                          </td>
                          <td className="py-1.5 px-3 font-medium text-[hsl(220,20%,15%)]">{acc.name}</td>
                          <td className="py-1.5 px-3 text-center">
                            <Badge className="rounded-sm text-[10px] bg-[hsl(160,65%,40%)] text-white hover:bg-[hsl(160,65%,35%)]">{acc.status}</Badge>
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <span className="tabular-nums">{acc.credits.remaining.toLocaleString()}</span>
                              <span className="text-[hsl(220,10%,70%)]">/</span>
                              <span className="tabular-nums text-[hsl(220,12%,50%)]">{acc.credits.allocated.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-3 text-right text-[hsl(220,12%,50%)]">
                            {new Date(acc.lastSync).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[hsl(220,14%,97%)]">
                            <td colSpan={5} className="px-6 py-2">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <p className="text-[10px] text-[hsl(220,12%,50%)] uppercase">Allocated</p>
                                  <p className="text-sm font-semibold tabular-nums text-[hsl(220,20%,15%)]">{acc.credits.allocated.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[hsl(220,12%,50%)] uppercase">Used</p>
                                  <p className="text-sm font-semibold tabular-nums text-[hsl(220,20%,15%)]">{acc.credits.used.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[hsl(220,12%,50%)] uppercase">Remaining</p>
                                  <p className="text-sm font-semibold tabular-nums text-[hsl(220,20%,15%)]">{acc.credits.remaining.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={pct} className="h-1.5 flex-1 rounded-sm" />
                                <span className="text-[10px] text-[hsl(220,12%,50%)] tabular-nums">{pct}% used</span>
                              </div>
                              <p className="text-[10px] text-[hsl(220,10%,70%)] mt-1">API Key: {acc.apiKey}</p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {rebalancing.length > 0 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineArrowsRightLeft className="h-3 w-3" /> Rebalancing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3">
            <div className="space-y-1.5">
              {rebalancing.map((rec, i) => (
                <div key={i} className="border border-[hsl(220,15%,88%)] rounded-sm p-2">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-xs font-medium text-[hsl(220,20%,15%)]">{rec.from_account ?? '?'}</span>
                    <HiOutlineArrowsRightLeft className="h-3 w-3 text-[hsl(220,12%,50%)]" />
                    <span className="text-xs font-medium text-[hsl(220,20%,15%)]">{rec.to_account ?? '?'}</span>
                    <Badge className="rounded-sm text-[10px] h-4 px-1 bg-[hsl(220,75%,50%)] text-white hover:bg-[hsl(220,75%,45%)]">{(rec.amount ?? 0).toLocaleString()} credits</Badge>
                    <Badge className={`ml-auto rounded-sm text-[10px] h-4 px-1 ${riskColor(rec.risk_level)}`}>{rec.risk_level ?? 'low'}</Badge>
                    <Badge className={`rounded-sm text-[10px] h-4 px-1 ${priorityColor(rec.priority)}`}>{rec.priority ?? 'low'}</Badge>
                  </div>
                  <p className="text-[10px] text-[hsl(220,12%,50%)] leading-tight">{rec.reason ?? ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {consolidation.length > 0 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineDocumentText className="h-3 w-3" /> Consolidation Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3">
            <div className="space-y-1.5">
              {consolidation.map((cs, i) => (
                <div key={i} className="border border-[hsl(220,15%,88%)] rounded-sm p-2">
                  <p className="text-xs font-medium text-[hsl(220,20%,15%)] mb-0.5">{cs.suggestion ?? ''}</p>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-[hsl(220,12%,50%)]">
                    {cs.accounts_affected && <span>Accounts: {cs.accounts_affected}</span>}
                    {cs.estimated_savings && <span className="text-[hsl(160,65%,40%)]">Savings: {cs.estimated_savings}</span>}
                    {cs.implementation_effort && <span>Effort: {effortBadge(cs.implementation_effort)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {actionItems.length > 0 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight">Action Items</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3">
            <div className="space-y-1.5">
              {actionItems.map((ai, i) => (
                <div key={i} className="flex items-start gap-2 border border-[hsl(220,15%,88%)] rounded-sm p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[hsl(220,20%,15%)]">{ai.action ?? ''}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[hsl(220,12%,50%)]">
                      {ai.estimated_impact && <span>Impact: {ai.estimated_impact}</span>}
                      {ai.timeline && <span>Timeline: {ai.timeline}</span>}
                    </div>
                  </div>
                  <Badge className={`rounded-sm text-[10px] h-4 px-1 flex-shrink-0 ${priorityColor(ai.priority)}`}>{ai.priority ?? 'low'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasData && !loading && (
        <div className="text-center py-8">
          <HiOutlineClipboardDocumentCheck className="h-8 w-8 text-[hsl(220,10%,85%)] mx-auto mb-2" />
          <p className="text-xs text-[hsl(220,12%,50%)]">Click "Get Recommendations" to receive AI-powered advice on credit rebalancing and account consolidation.</p>
        </div>
      )}
    </div>
  )
}

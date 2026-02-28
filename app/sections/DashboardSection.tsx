'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  HiOutlineCreditCard,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineBuildingOffice2,
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

interface CreditMonitorResponse {
  overall_status?: string
  total_credits?: { allocated?: number; used?: number; remaining?: number; usage_percentage?: number }
  account_summaries?: { account_name?: string; account_id?: string; allocated?: number; used?: number; remaining?: number; usage_percentage?: number; status?: string }[]
  alerts?: { severity?: string; account_name?: string; message?: string; threshold?: number }[]
  last_updated?: string
}

interface DashboardSectionProps {
  accounts: AccountData[]
  monitorData: CreditMonitorResponse | null
  loading: boolean
  error: string | null
  onRefresh: () => void
}

function formatNum(n: number | undefined): string {
  if (n === undefined || n === null) return '0'
  return n.toLocaleString()
}

function severityColor(severity?: string): string {
  const s = (severity ?? '').toLowerCase()
  if (s === 'critical' || s === 'high') return 'bg-[hsl(0,70%,50%)] text-white'
  if (s === 'warning' || s === 'medium') return 'bg-[hsl(35,80%,50%)] text-white'
  return 'bg-[hsl(220,75%,50%)] text-white'
}

function statusBadge(status?: string) {
  const s = (status ?? '').toLowerCase()
  if (s === 'critical' || s === 'over_limit') return <Badge className="rounded-sm text-[10px] bg-[hsl(0,70%,50%)] text-white hover:bg-[hsl(0,70%,45%)]">{status}</Badge>
  if (s === 'warning' || s === 'low') return <Badge className="rounded-sm text-[10px] bg-[hsl(35,80%,50%)] text-white hover:bg-[hsl(35,80%,45%)]">{status}</Badge>
  return <Badge className="rounded-sm text-[10px] bg-[hsl(160,65%,40%)] text-white hover:bg-[hsl(160,65%,35%)]">{status ?? 'active'}</Badge>
}

export default function DashboardSection({ accounts, monitorData, loading, error, onRefresh }: DashboardSectionProps) {
  const tc = monitorData?.total_credits
  const summaries = Array.isArray(monitorData?.account_summaries) ? monitorData.account_summaries : []
  const alerts = Array.isArray(monitorData?.alerts) ? monitorData.alerts : []
  const hasData = monitorData !== null

  const totalAllocated = hasData ? (tc?.allocated ?? 0) : accounts.reduce((s, a) => s + a.credits.allocated, 0)
  const totalUsed = hasData ? (tc?.used ?? 0) : accounts.reduce((s, a) => s + a.credits.used, 0)
  const totalRemaining = hasData ? (tc?.remaining ?? 0) : accounts.reduce((s, a) => s + a.credits.remaining, 0)
  const usagePct = hasData ? (tc?.usage_percentage ?? 0) : (totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0)

  const statCards = [
    { label: 'Total Credits', value: formatNum(totalAllocated), icon: <HiOutlineCreditCard className="h-4 w-4" />, color: 'text-[hsl(220,75%,50%)]' },
    { label: 'Credits Used', value: formatNum(totalUsed), icon: <HiOutlineArrowTrendingUp className="h-4 w-4" />, color: 'text-[hsl(35,80%,50%)]' },
    { label: 'Credits Remaining', value: formatNum(totalRemaining), icon: <HiOutlineArrowTrendingDown className="h-4 w-4" />, color: 'text-[hsl(160,65%,40%)]' },
    { label: 'Accounts', value: String(accounts.length), icon: <HiOutlineBuildingOffice2 className="h-4 w-4" />, color: 'text-[hsl(280,55%,55%)]' },
  ]

  const displayAccounts = summaries.length > 0
    ? summaries.map(s => ({
        name: s.account_name ?? '',
        id: s.account_id ?? '',
        allocated: s.allocated ?? 0,
        used: s.used ?? 0,
        remaining: s.remaining ?? 0,
        pct: s.usage_percentage ?? 0,
        status: s.status ?? 'active',
      }))
    : accounts.map(a => ({
        name: a.name,
        id: a.id,
        allocated: a.credits.allocated,
        used: a.credits.used,
        remaining: a.credits.remaining,
        pct: a.credits.allocated > 0 ? Math.round((a.credits.used / a.credits.allocated) * 100) : 0,
        status: a.status,
      }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[hsl(220,20%,15%)]">Architect Credit Overview</h2>
          {monitorData?.overall_status && (
            <p className="text-xs text-[hsl(220,12%,50%)] mt-0.5">{monitorData.overall_status}</p>
          )}
          {monitorData?.last_updated && (
            <p className="text-[10px] text-[hsl(220,10%,70%)]">Last updated: {monitorData.last_updated}</p>
          )}
        </div>
        <Button size="sm" onClick={onRefresh} disabled={loading} className="h-7 text-xs rounded-sm bg-[hsl(220,75%,50%)] hover:bg-[hsl(220,75%,45%)]">
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <HiOutlineArrowPath className="h-3 w-3 mr-1" />}
          Refresh Credits
        </Button>
      </div>

      {error && (
        <Card className="border border-[hsl(0,70%,90%)] bg-[hsl(0,70%,97%)] rounded-sm shadow-none">
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <HiOutlineExclamationTriangle className="h-4 w-4 text-[hsl(0,70%,50%)]" />
            <p className="text-xs text-[hsl(0,70%,40%)]">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="ml-auto h-6 text-[10px] rounded-sm">Retry</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {statCards.map((sc) => (
          <Card key={sc.label} className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
            <CardContent className="py-2.5 px-3">
              {loading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium text-[hsl(220,12%,50%)] tracking-tight uppercase">{sc.label}</p>
                    <span className={sc.color}>{sc.icon}</span>
                  </div>
                  <p className="text-lg font-semibold tracking-tight text-[hsl(220,20%,15%)] mt-0.5">{sc.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Progress value={usagePct} className="h-1.5 flex-1 rounded-sm" />
        <span className="text-[10px] font-medium text-[hsl(220,12%,50%)]">{usagePct}% used</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <Card className="lg:col-span-2 rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight">Account Credit Table</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <ScrollArea className="max-h-[280px]">
              <table className="w-full text-xs">
                <thead className="bg-[hsl(220,14%,95%)]">
                  <tr>
                    <th className="text-left py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Account</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Allocated</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Used</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Remaining</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Usage</th>
                    <th className="text-center py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-t border-[hsl(220,15%,88%)]">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="py-1.5 px-3"><Skeleton className="h-3 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    displayAccounts.map((acc) => (
                      <tr key={acc.id} className="border-t border-[hsl(220,15%,88%)] hover:bg-[hsl(220,14%,97%)]">
                        <td className="py-1.5 px-3 font-medium text-[hsl(220,20%,15%)]">{acc.name}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums">{formatNum(acc.allocated)}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums">{formatNum(acc.used)}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums">{formatNum(acc.remaining)}</td>
                        <td className="py-1.5 px-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Progress value={acc.pct} className="h-1 w-10 rounded-sm" />
                            <span className="tabular-nums">{acc.pct}%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-center">{statusBadge(acc.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineExclamationTriangle className="h-3 w-3" /> Alert Feed
              {alerts.length > 0 && <Badge className="ml-1 rounded-sm text-[10px] h-4 px-1 bg-[hsl(0,70%,50%)] text-white hover:bg-[hsl(0,70%,45%)]">{alerts.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0">
            <ScrollArea className="max-h-[240px]">
              {loading ? (
                <div className="space-y-2 pb-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <HiOutlineCheckCircle className="h-6 w-6 text-[hsl(160,65%,40%)] mb-1" />
                  <p className="text-xs text-[hsl(220,12%,50%)]">No alerts. All accounts healthy.</p>
                </div>
              ) : (
                <div className="space-y-1.5 pb-3">
                  {alerts.map((alert, i) => (
                    <div key={i} className="border border-[hsl(220,15%,88%)] rounded-sm p-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge className={`rounded-sm text-[10px] h-4 px-1 ${severityColor(alert.severity)}`}>
                          {alert.severity ?? 'info'}
                        </Badge>
                        <span className="text-[10px] font-medium text-[hsl(220,20%,15%)] truncate">{alert.account_name ?? 'Unknown'}</span>
                      </div>
                      <p className="text-[10px] text-[hsl(220,12%,50%)] leading-tight">{alert.message ?? ''}</p>
                      {alert.threshold !== undefined && alert.threshold !== null && (
                        <p className="text-[10px] text-[hsl(220,10%,70%)] mt-0.5">Threshold: {alert.threshold}%</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

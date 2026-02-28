'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  HiOutlineChartBarSquare,
  HiOutlineLightBulb,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import { Loader2 } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface AccountData {
  id: string
  name: string
  apiKey: string
  status: string
  credits: { allocated: number; used: number; remaining: number }
  lastSync: string
}

interface AnalyticsResponse {
  trend_summary?: string
  period?: string
  account_analytics?: { account_name?: string; total_consumed?: number; avg_daily_usage?: number; trend?: string; efficiency_score?: number; utilization_rate?: number }[]
  time_series_data?: { date?: string; total_usage?: number; by_account?: { details?: string } }[]
  recommendations?: { title?: string; description?: string; impact?: string; priority?: string }[]
  total_consumption?: number
}

interface AnalyticsSectionProps {
  accounts: AccountData[]
  analyticsData: AnalyticsResponse | null
  loading: boolean
  error: string | null
  onGenerate: () => void
}

const CHART_COLORS = [
  'hsl(220,75%,50%)', 'hsl(160,65%,40%)', 'hsl(280,55%,55%)', 'hsl(35,80%,50%)', 'hsl(0,70%,50%)',
]

function priorityColor(p?: string): string {
  const s = (p ?? '').toLowerCase()
  if (s === 'high' || s === 'critical') return 'bg-[hsl(0,70%,50%)] text-white'
  if (s === 'medium') return 'bg-[hsl(35,80%,50%)] text-white'
  return 'bg-[hsl(220,75%,50%)] text-white'
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-xs mt-2 mb-0.5">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-sm mt-2 mb-0.5">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-3 list-disc text-xs">{line.slice(2)}</li>
        if (!line.trim()) return <div key={i} className="h-0.5" />
        return <p key={i} className="text-xs">{line}</p>
      })}
    </div>
  )
}

export default function AnalyticsSection({ accounts, analyticsData, loading, error, onGenerate }: AnalyticsSectionProps) {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedAccount, setSelectedAccount] = useState('all')

  const accountAnalytics = Array.isArray(analyticsData?.account_analytics) ? analyticsData.account_analytics : []
  const timeSeries = Array.isArray(analyticsData?.time_series_data) ? analyticsData.time_series_data : []
  const recommendations = Array.isArray(analyticsData?.recommendations) ? analyticsData.recommendations : []
  const hasData = analyticsData !== null

  const barData = accountAnalytics.length > 0
    ? accountAnalytics.map(a => ({ name: a.account_name ?? '', consumed: a.total_consumed ?? 0, daily: a.avg_daily_usage ?? 0, efficiency: a.efficiency_score ?? 0 }))
    : accounts.map(a => ({ name: a.name, consumed: a.credits.used, daily: Math.round(a.credits.used / 30), efficiency: 0 }))

  const lineData = timeSeries.length > 0
    ? timeSeries.map(t => ({ date: t.date ?? '', usage: t.total_usage ?? 0 }))
    : Array.from({ length: 7 }, (_, i) => ({ date: `Day ${i + 1}`, usage: 0 }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[hsl(220,20%,15%)]">Usage Analytics</h2>
          {analyticsData?.period && <p className="text-xs text-[hsl(220,12%,50%)] mt-0.5">Period: {analyticsData.period}</p>}
          {analyticsData?.total_consumption !== undefined && (
            <p className="text-[10px] text-[hsl(220,10%,70%)]">Total consumption: {(analyticsData.total_consumption ?? 0).toLocaleString()} credits</p>
          )}
        </div>
        <Button size="sm" onClick={onGenerate} disabled={loading} className="h-7 text-xs rounded-sm bg-[hsl(220,75%,50%)] hover:bg-[hsl(220,75%,45%)]">
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <HiOutlineChartBarSquare className="h-3 w-3 mr-1" />}
          Generate Insights
        </Button>
      </div>

      {error && (
        <Card className="border border-[hsl(0,70%,90%)] bg-[hsl(0,70%,97%)] rounded-sm shadow-none">
          <CardContent className="py-2 px-3 flex items-center gap-2">
            <p className="text-xs text-[hsl(0,70%,40%)]">{error}</p>
            <Button variant="outline" size="sm" onClick={onGenerate} className="ml-auto h-6 text-[10px] rounded-sm">Retry</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-28 h-7 text-xs rounded-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-36 h-7 text-xs rounded-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {analyticsData?.trend_summary && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardContent className="py-2 px-3">
            <div className="flex items-start gap-2">
              <HiOutlineArrowTrendingUp className="h-4 w-4 text-[hsl(220,75%,50%)] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[hsl(220,20%,15%)]">{renderMarkdown(analyticsData.trend_summary)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight">Usage Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : lineData.length > 0 && lineData.some(d => d.usage > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220,12%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,12%,50%)" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 2, border: '1px solid hsl(220,15%,88%)' }} />
                  <Line type="monotone" dataKey="usage" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-[hsl(220,12%,50%)]">
                Click "Generate Insights" to load chart data
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight">Account Comparison</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {loading ? (
              <Skeleton className="h-44 w-full" />
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(220,12%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220,12%,50%)" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 2, border: '1px solid hsl(220,15%,88%)' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="consumed" fill={CHART_COLORS[0]} name="Consumed" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="daily" fill={CHART_COLORS[1]} name="Avg Daily" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-[hsl(220,12%,50%)]">
                No account data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {accountAnalytics.length > 0 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight">Account Analytics Detail</CardTitle>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <ScrollArea className="max-h-[200px]">
              <table className="w-full text-xs">
                <thead className="bg-[hsl(220,14%,95%)]">
                  <tr>
                    <th className="text-left py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Account</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Consumed</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Avg Daily</th>
                    <th className="text-center py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Trend</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Efficiency</th>
                    <th className="text-right py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {accountAnalytics.map((aa, i) => (
                    <tr key={i} className="border-t border-[hsl(220,15%,88%)] hover:bg-[hsl(220,14%,97%)]">
                      <td className="py-1.5 px-3 font-medium text-[hsl(220,20%,15%)]">{aa.account_name ?? ''}</td>
                      <td className="py-1.5 px-3 text-right tabular-nums">{(aa.total_consumed ?? 0).toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-right tabular-nums">{(aa.avg_daily_usage ?? 0).toLocaleString()}</td>
                      <td className="py-1.5 px-3 text-center">
                        <Badge variant="outline" className="rounded-sm text-[10px]">{aa.trend ?? '-'}</Badge>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Progress value={aa.efficiency_score ?? 0} className="h-1 w-8 rounded-sm" />
                          <span className="tabular-nums">{aa.efficiency_score ?? 0}%</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-right tabular-nums">{aa.utilization_rate ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineLightBulb className="h-3 w-3 text-[hsl(35,80%,50%)]" /> Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3">
            <div className="space-y-1.5">
              {recommendations.map((rec, i) => (
                <div key={i} className="border border-[hsl(220,15%,88%)] rounded-sm p-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium text-[hsl(220,20%,15%)]">{rec.title ?? ''}</span>
                    <Badge className={`ml-auto rounded-sm text-[10px] h-4 px-1 ${priorityColor(rec.priority)}`}>{rec.priority ?? 'low'}</Badge>
                  </div>
                  <p className="text-[10px] text-[hsl(220,12%,50%)] leading-tight">{rec.description ?? ''}</p>
                  {rec.impact && <p className="text-[10px] text-[hsl(160,65%,40%)] mt-0.5">Impact: {rec.impact}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasData && !loading && (
        <div className="text-center py-8">
          <HiOutlineChartBarSquare className="h-8 w-8 text-[hsl(220,10%,85%)] mx-auto mb-2" />
          <p className="text-xs text-[hsl(220,12%,50%)]">Click "Generate Insights" to analyze usage patterns across your accounts.</p>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  HiOutlineBellAlert,
  HiOutlineUserCircle,
  HiOutlineTrash,
  HiOutlinePlusCircle,
} from 'react-icons/hi2'

interface AccountData {
  id: string
  name: string
  apiKey: string
  status: string
  credits: { allocated: number; used: number; remaining: number }
  lastSync: string
}

interface SettingsSectionProps {
  accounts: AccountData[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
}

export default function SettingsSection({ accounts }: SettingsSectionProps) {
  const [thresholds, setThresholds] = useState<Record<string, number>>(
    Object.fromEntries(accounts.map(a => [a.id, 20]))
  )
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [criticalOnly, setCriticalOnly] = useState(false)

  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
    { id: 'm2', name: 'Finance Team', email: 'finance@company.com', role: 'manager' },
    { id: 'm3', name: 'Dev Lead', email: 'devlead@company.com', role: 'viewer' },
  ])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('viewer')

  const addMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return
    setMembers(prev => [...prev, { id: `m${Date.now()}`, name: newMemberName, email: newMemberEmail, role: newMemberRole }])
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('viewer')
  }

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const updateRole = (id: string, role: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-[hsl(220,20%,15%)]">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineBellAlert className="h-3 w-3" /> Alert Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3">
            <p className="text-[10px] text-[hsl(220,12%,50%)] mb-2">Set the low-balance warning percentage for each account.</p>
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id}>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-[hsl(220,20%,15%)]">{acc.name}</Label>
                    <span className="text-xs font-semibold tabular-nums text-[hsl(220,75%,50%)]">{thresholds[acc.id] ?? 20}%</span>
                  </div>
                  <Slider
                    value={[thresholds[acc.id] ?? 20]}
                    onValueChange={(v) => setThresholds(prev => ({ ...prev, [acc.id]: v[0] }))}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
              <HiOutlineBellAlert className="h-3 w-3" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-0 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-[hsl(220,20%,15%)]">Email Alerts</Label>
                <p className="text-[10px] text-[hsl(220,12%,50%)]">Receive alerts via email</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <Separator className="bg-[hsl(220,15%,88%)]" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-[hsl(220,20%,15%)]">In-App Alerts</Label>
                <p className="text-[10px] text-[hsl(220,12%,50%)]">Show alerts in the dashboard</p>
              </div>
              <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
            </div>
            <Separator className="bg-[hsl(220,15%,88%)]" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-[hsl(220,20%,15%)]">Critical Only</Label>
                <p className="text-[10px] text-[hsl(220,12%,50%)]">Only notify for critical alerts</p>
              </div>
              <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-sm border border-[hsl(220,15%,88%)] shadow-none">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-semibold tracking-tight flex items-center gap-1">
            <HiOutlineUserCircle className="h-3 w-3" /> Role Management
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <ScrollArea className="max-h-[220px]">
            <table className="w-full text-xs">
              <thead className="bg-[hsl(220,14%,95%)]">
                <tr>
                  <th className="text-left py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Name</th>
                  <th className="text-left py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Email</th>
                  <th className="text-center py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Role</th>
                  <th className="text-center py-1.5 px-3 font-medium text-[hsl(220,12%,50%)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-t border-[hsl(220,15%,88%)] hover:bg-[hsl(220,14%,97%)]">
                    <td className="py-1.5 px-3 font-medium text-[hsl(220,20%,15%)]">{m.name}</td>
                    <td className="py-1.5 px-3 text-[hsl(220,12%,50%)]">{m.email}</td>
                    <td className="py-1.5 px-3 text-center">
                      <Select value={m.role} onValueChange={(v) => updateRole(m.id, v)}>
                        <SelectTrigger className="h-6 w-24 text-[10px] rounded-sm mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMember(m.id)}>
                        <HiOutlineTrash className="h-3 w-3 text-[hsl(0,70%,50%)]" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="border-t border-[hsl(220,15%,88%)] px-3 py-2">
            <p className="text-[10px] text-[hsl(220,12%,50%)] mb-1.5">Add Team Member</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="h-7 text-xs rounded-sm flex-1"
              />
              <Input
                placeholder="Email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="h-7 text-xs rounded-sm flex-1"
              />
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger className="h-7 w-24 text-xs rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addMember} disabled={!newMemberName.trim() || !newMemberEmail.trim()} className="h-7 text-xs rounded-sm bg-[hsl(220,75%,50%)] hover:bg-[hsl(220,75%,45%)]">
                <HiOutlinePlusCircle className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

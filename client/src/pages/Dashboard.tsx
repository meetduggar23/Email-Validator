import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Mail, CheckCircle, XCircle, ShieldAlert, TrendingUp, Globe,
  Activity, Zap, ArrowRight, Download, RefreshCw, AlertTriangle,
  Upload, Code, Clock, ChevronRight, Search, Heart, Inbox,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { formatDate, getConfidenceColor, getInitials } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#5B5CEB', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4']

const chartTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '8px 12px',
}

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (hasAnimated.current) { setDisplayValue(value); return }
    const duration = 1200
    const start = performance.now()
    const from = 0
    const range = value - from

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(from + range * eased))
      if (progress < 1) requestAnimationFrame(animate)
      else hasAnimated.current = true
    }
    requestAnimationFrame(animate)
  }, [value])

  const formatted = useMemo(() => {
    if (typeof displayValue === 'number' && !isNaN(displayValue)) {
      if (suffix === '%') return displayValue.toFixed(decimals)
      return displayValue.toLocaleString()
    }
    return displayValue
  }, [displayValue, decimals, suffix])

  return <>{prefix}{formatted}{suffix}</>
}

function SparklineChart({ data, color = '#5B5CEB' }: { data: number[]; color?: string }) {
  if (data.length < 2) {
    return (
      <div className="h-[40px] flex items-center justify-center">
        <span className="text-[10px] text-[#9CA3AF]">Insufficient data</span>
      </div>
    )
  }
  const chartData = data.map((v, i) => ({ i, v }))
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={true}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function computeTrend(data: number[]): { direction: 'up' | 'down' | 'flat'; value: string } | null {
  if (data.length < 4) return null
  const half = Math.floor(data.length / 2)
  const first = data.slice(0, half)
  const last = data.slice(half)
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length
  const lastAvg = last.reduce((a, b) => a + b, 0) / last.length
  if (firstAvg === 0) return null
  const change = ((lastAvg - firstAvg) / firstAvg) * 100
  if (Math.abs(change) < 1) return { direction: 'flat', value: '0%' }
  return {
    direction: change > 0 ? 'up' : 'down',
    value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
  }
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#5B5CEB]/10 to-[#4F46E5]/5 flex items-center justify-center mb-6 border border-[#5B5CEB]/10">
        <Inbox className="w-10 h-10 text-[#5B5CEB]" />
      </div>
      <h2 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">No validation data yet</h2>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-2 max-w-md leading-relaxed">
        Validate your first email to start building analytics. Your dashboard will populate with real-time metrics, charts, and insights.
      </p>
      <Button
        onClick={() => navigate('/validate')}
        className="mt-8 h-11 px-6 bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#1F2937] dark:hover:bg-white/90 rounded-xl text-sm font-semibold shadow-lg shadow-black/10 dark:shadow-white/10"
      >
        <Zap className="w-4 h-4 mr-2" /> Validate First Email
      </Button>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-danger-500" />
      </div>
      <h3 className="text-lg font-semibold text-[#111827] dark:text-white">Failed to load dashboard</h3>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 max-w-md">{message}</p>
      <Button variant="outline" className="mt-6 rounded-xl" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" /> Try again
      </Button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-8 w-40 mt-2 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="rounded-2xl border-[#E5E7EB]"><CardContent className="p-5"><Skeleton className="h-24 w-full rounded-xl" /></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="h-[260px] rounded-2xl" />
      </div>
      <Skeleton className="h-[300px] rounded-2xl" />
    </div>
  )
}

function ChartCard({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 ${className || ''}`}>
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.stats.dashboard().then(r => r.data),
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  })

  const stats = data
  const hasData = (stats?.totalEmailsChecked || 0) > 0
  const recentList = stats?.recentValidations || []
  const dailyStats = stats?.dailyStats || []
  const sparklineCounts = useMemo(() => dailyStats.map((d: any) => d.total || d.count || 0), [dailyStats])
  const sparklineValid = useMemo(() => dailyStats.map((d: any) => d.valid || 0), [dailyStats])

  const statCards = [
    {
      label: 'Total Validations', value: stats?.totalEmailsChecked || 0,
      icon: Mail, color: '#5B5CEB', bg: 'bg-[#5B5CEB]/5',
      sparklineData: sparklineCounts, format: 'number',
    },
    {
      label: 'Valid Emails', value: stats?.validEmails || 0,
      icon: CheckCircle, color: '#22C55E', bg: 'bg-[#22C55E]/5',
      sparklineData: sparklineValid, format: 'number',
    },
    {
      label: 'Invalid Emails', value: stats?.invalidEmails || 0,
      icon: XCircle, color: '#EF4444', bg: 'bg-[#EF4444]/5',
      sparklineData: [], format: 'number',
    },
    {
      label: 'Disposable', value: stats?.disposableEmails || 0,
      icon: ShieldAlert, color: '#F59E0B', bg: 'bg-[#F59E0B]/5',
      sparklineData: [], format: 'number',
    },
    {
      label: 'Deliverability', value: stats?.deliverabilityRate ?? 0,
      icon: TrendingUp, color: '#8B5CF6', bg: 'bg-[#8B5CF6]/5',
      sparklineData: [], format: 'percent',
    },
    {
      label: 'MX Success', value: stats?.mxSuccess ?? 0,
      icon: Globe, color: '#06B6D4', bg: 'bg-[#06B6D4]/5',
      sparklineData: [], format: 'percent',
    },
    {
      label: 'Health Score', value: stats?.averageScore ?? 0,
      icon: Activity, color: '#10B981', bg: 'bg-[#10B981]/5',
      sparklineData: [], format: 'percent',
    },
    {
      label: "Today's Validations", value: stats?.todayValidated || 0,
      icon: Zap, color: '#F43F5E', bg: 'bg-[#F43F5E]/5',
      sparklineData: sparklineCounts.slice(-7), format: 'number',
    },
  ]

  const pieData = hasData ? [
    { name: 'Valid', value: stats?.validEmails || 0, color: '#22C55E' },
    { name: 'Invalid', value: stats?.invalidEmails || 0, color: '#EF4444' },
    { name: 'Disposable', value: stats?.disposableEmails || 0, color: '#F59E0B' },
  ].filter(d => d.value > 0) : []

  const providerData = stats?.providerStats || []

  return (
    <div className="space-y-6 animate-in">
      {isError && (
        <ErrorState
          message={(error as any)?.message || 'Unable to connect to the server. Please check your connection.'}
          onRetry={() => refetch()}
        />
      )}

      {isLoading && !stats && <LoadingSkeleton />}

      {!isLoading && !isError && !hasData && <EmptyState />}

      {hasData && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
                <span>Home</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">Dashboard</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] dark:text-white tracking-tight mt-0.5">Dashboard</h1>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Monitor your email validation performance in real time.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="rounded-xl border-[#E5E7EB] dark:border-white/10 h-9 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl border-[#E5E7EB] dark:border-white/10 h-9 text-xs"
              >
                <Link to="/reports"><Download className="w-3.5 h-3.5 mr-1.5" /> Export</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#1F2937] dark:hover:bg-white/90 h-9 text-xs shadow-sm"
              >
                <Link to="/validate"><Zap className="w-3.5 h-3.5 mr-1.5" /> Validate Email</Link>
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                  const trend = computeTrend(card.sparklineData)
                  const displayValue = card.format === 'percent' ? card.value : card.value
                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                    >
                      <Card className="rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                              <card.icon className="w-5 h-5" style={{ color: card.color }} />
                            </div>
                            {trend && (
                              <div className="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-white/5">
                                <span className={trend.direction === 'up' ? 'text-[#22C55E]' : trend.direction === 'down' ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}>
                                  {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                                </span>
                                <span className="text-[#6B7280] dark:text-[#9CA3AF]">{trend.value}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight">
                            {card.format === 'percent' ? (
                              <AnimatedCounter value={displayValue} suffix="%" decimals={1} />
                            ) : (
                              <AnimatedCounter value={displayValue} />
                            )}
                          </div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">{card.label}</div>
                          {card.sparklineData.length > 1 && (
                            <div className="mt-2 -mx-1">
                              <SparklineChart data={card.sparklineData} color={card.color} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <ChartCard title="Validation Trend" subtitle="Daily email validation volume">
                    {dailyStats.length > 1 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={dailyStats} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => v?.slice(5) || ''} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Line type="monotone" dataKey="total" stroke="#5B5CEB" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#5B5CEB', strokeWidth: 0 }} name="Total" />
                          <Line type="monotone" dataKey="valid" stroke="#22C55E" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#22C55E', strokeWidth: 0 }} name="Valid" />
                          <Legend wrapperStyle={{ fontSize: '12px', marginTop: '8px' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-sm text-[#9CA3AF]">Not enough daily data yet</div>
                    )}
                  </ChartCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <ChartCard title="Email Distribution" subtitle="Valid vs Invalid vs Disposable">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={4}
                            dataKey="value"
                            animationDuration={1200}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-sm text-[#9CA3AF]">No distribution data</div>
                    )}
                  </ChartCard>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <ChartCard title="Top Providers" subtitle="Email provider breakdown">
                    {providerData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={providerData} layout="vertical" margin={{ top: 4, right: 4, bottom: 4, left: -8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="provider" type="category" width={100} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Bar dataKey="count" fill="#5B5CEB" radius={[0, 6, 6, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-sm text-[#9CA3AF]">No provider data yet</div>
                    )}
                  </ChartCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <ChartCard title="Daily Activity" subtitle="Validations over time">
                    {dailyStats.length > 1 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={dailyStats} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#5B5CEB" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#5B5CEB" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => v?.slice(5) || ''} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Area type="monotone" dataKey="total" stroke="#5B5CEB" strokeWidth={2} fill="url(#areaGradient)" name="Validations" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-sm text-[#9CA3AF]">Not enough data</div>
                    )}
                  </ChartCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <ChartCard title="Hourly Activity" subtitle="Validations by hour">
                    {(stats?.hourlyActivity?.length || 0) > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.hourlyActivity} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} vertical={false} />
                          <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `${v}h`} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [value, 'Validations']} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                            {stats.hourlyActivity.map((_: any, i: number) => (
                              <Cell key={i} fill={i >= 7 && i <= 11 ? '#5B5CEB' : i >= 17 && i <= 20 ? '#8B5CF6' : '#A5B4FC'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-sm text-[#9CA3AF]">No hourly data yet</div>
                    )}
                  </ChartCard>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <Card className="rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] dark:border-white/10">
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Recent Validations</h3>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Latest email check results</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs h-8">
                        <Link to="/history">View all <ChevronRight className="ml-1 w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                  {recentList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#E5E7EB]/50 dark:border-white/5">
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Email</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider hidden sm:table-cell">Provider</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Status</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider hidden md:table-cell">Confidence</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider hidden lg:table-cell">Health</th>
                            <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider hidden lg:table-cell">Date</th>
                            <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentList.slice(0, 8).map((item: any, i: number) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.025 }}
                              className="border-b border-[#E5E7EB]/30 dark:border-white/5 hover:bg-[#F8FAFC] dark:hover:bg-white/[0.02] transition-colors group"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg bg-[#5B5CEB]/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-3.5 h-3.5 text-[#5B5CEB]" />
                                  </div>
                                  <span className="text-sm font-medium text-[#111827] dark:text-white truncate max-w-[180px]">{item.email}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-[#6B7280] dark:text-[#9CA3AF] hidden sm:table-cell">{item.provider || '—'}</td>
                              <td className="px-5 py-3.5">
                                <Badge
                                  variant={item.isValid ? 'success' : 'danger'}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                >
                                  {item.isValid ? (item.isDisposable ? 'Disposable' : 'Valid') : 'Invalid'}
                                </Badge>
                              </td>
                              <td className="px-5 py-3.5 hidden md:table-cell">
                                <span className={`text-sm font-semibold ${getConfidenceColor(item.confidenceScore)}`}>
                                  {item.confidenceScore}%
                                </span>
                              </td>
                              <td className="px-5 py-3.5 hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-[#E5E7EB] dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${item.healthScore ?? item.confidenceScore ?? 0}%`,
                                        backgroundColor: (item.healthScore ?? item.confidenceScore ?? 0) >= 80 ? '#22C55E' : (item.healthScore ?? item.confidenceScore ?? 0) >= 50 ? '#F59E0B' : '#EF4444',
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{item.healthScore ?? item.confidenceScore ?? 0}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-[#6B7280] dark:text-[#9CA3AF] hidden lg:table-cell whitespace-nowrap">{formatDate(item.timestamp)}</td>
                              <td className="px-5 py-3.5 text-right">
                                <Link
                                  to={`/history?id=${item.id}`}
                                  className="text-xs font-medium text-[#5B5CEB] hover:text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  View
                                </Link>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Inbox className="w-8 h-8 text-[#D1D5DB] dark:text-[#6B7280] mb-3" />
                      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">No recent validations</p>
                      <Button variant="outline" size="sm" asChild className="mt-3 rounded-xl text-xs">
                        <Link to="/validate">Validate your first email</Link>
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="hidden xl:block w-[300px] shrink-0"
            >
              <div className="space-y-4 sticky top-24">
                <Card className="rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#E5E7EB] dark:border-white/10">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="p-3 space-y-1">
                    <Link
                      to="/validate"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5B5CEB]/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Zap className="w-4 h-4 text-[#5B5CEB]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-white">Quick Validate</div>
                        <div className="text-xs text-[#9CA3AF]">Check a single email address</div>
                      </div>
                    </Link>
                    <Link
                      to="/bulk"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#22C55E]/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-4 h-4 text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-white">Upload CSV</div>
                        <div className="text-xs text-[#9CA3AF]">Bulk validate from file</div>
                      </div>
                    </Link>
                    <Link
                      to="/reports"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Download className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-white">Export Reports</div>
                        <div className="text-xs text-[#9CA3AF]">Download validation data</div>
                      </div>
                    </Link>
                    <Link
                      to="/api-playground"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Code className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-white">API Playground</div>
                        <div className="text-xs text-[#9CA3AF]">Test API endpoints</div>
                      </div>
                    </Link>
                  </div>
                </Card>

                <Card className="rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-[#E5E7EB] dark:border-white/10">
                    <h3 className="text-sm font-semibold text-[#111827] dark:text-white">Recent Activity</h3>
                  </div>
                  <div className="p-3">
                    {recentList.length > 0 ? (
                      <div className="space-y-2">
                        {recentList.slice(0, 5).map((item: any, i: number) => (
                          <div key={item.id} className="flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.isValid ? '#22C55E' : '#EF4444' }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-[#111827] dark:text-white truncate">{item.email}</div>
                              <div className="text-[11px] text-[#9CA3AF]">{formatDate(item.timestamp)}</div>
                            </div>
                            <Badge variant={item.isValid ? 'success' : 'danger'} className="text-[9px] px-1.5 py-0 rounded shrink-0">
                              {item.isValid ? (item.isDisposable ? 'Disp' : 'OK') : 'Bad'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <Clock className="w-6 h-6 text-[#D1D5DB] dark:text-[#6B7280] mb-2" />
                        <p className="text-xs text-[#9CA3AF]">No recent activity</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="rounded-2xl border-[#E5E7EB] dark:border-white/10 shadow-sm overflow-hidden bg-gradient-to-br from-[#5B5CEB]/5 to-[#4F46E5]/5">
                  <div className="p-5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#5B5CEB]/10 flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-[#5B5CEB]" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#111827] dark:text-white">Upgrade to Pro</h4>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 leading-relaxed">Get unlimited validations, advanced reports, and priority support.</p>
                    <Button className="mt-4 w-full h-9 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#1F2937] dark:hover:bg-white/90 text-xs font-semibold">
                      Upgrade Now
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}

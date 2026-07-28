import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Mail, CheckCircle, XCircle, ShieldAlert, TrendingUp, Globe,
  Activity, ArrowRight, Download, Upload,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { formatDate } from '@/lib/utils'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6']

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.stats.dashboard().then(res => {
      setStats(res.data)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Emails Checked', value: stats?.totalEmailsChecked || 0, icon: Mail, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400', change: '+12%' },
    { label: 'Valid Emails', value: stats?.validEmails || 0, icon: CheckCircle, color: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400', change: '+8%' },
    { label: 'Invalid Emails', value: stats?.invalidEmails || 0, icon: XCircle, color: 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400', change: '-3%' },
    { label: 'Disposable Emails', value: stats?.disposableEmails || 0, icon: ShieldAlert, color: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400', change: '+2%' },
    { label: 'Deliverability Rate', value: `${stats?.deliverabilityRate || 0}%`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', change: '+5%' },
    { label: 'MX Success', value: stats?.mxSuccess || 0, icon: Globe, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', change: '+10%' },
  ]

  const pieData = [
    { name: 'Valid', value: stats?.validEmails || 0 },
    { name: 'Invalid', value: stats?.invalidEmails || 0 },
    { name: 'Disposable', value: stats?.disposableEmails || 0 },
  ]

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your email validation activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports">
              <Download className="w-4 h-4 mr-2" /> Export
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/validate">
              <Activity className="w-4 h-4 mr-2" /> Validate
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ) : (
                  <>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color} mb-3`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <div className="flex items-end justify-between mt-1">
                      <p className="text-2xl font-bold">{card.value}</p>
                      <span className="text-xs text-success-500 font-medium">{card.change}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Validation Graph */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Daily Validations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.dailyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v?.slice(5) || ''} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} name="Total" />
                    <Line type="monotone" dataKey="valid" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Valid" />
                    <Line type="monotone" dataKey="invalid" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Invalid" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Email Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Provider Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Top Email Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats?.providerStats || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="provider" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Uploads */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Uploads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bulk">View all <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : stats?.recentUploads?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentUploads.map((upload: any) => (
                  <div key={upload.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{upload.filename}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(upload.createdAt)}</p>
                      </div>
                    </div>
                    <Badge variant={upload.status === 'completed' ? 'success' : 'warning'}>{upload.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No uploads yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/bulk">Upload CSV</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

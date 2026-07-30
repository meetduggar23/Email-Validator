import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileDown, FileSpreadsheet, FileJson, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#6B7280']

export default function Reports() {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.reports.summary().then(res => {
      setSummary(res.data)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  const pieData = summary ? [
    { name: 'Valid', value: summary.valid },
    { name: 'Invalid', value: summary.invalid },
    { name: 'Disposable', value: summary.disposable },
    { name: 'Duplicates', value: summary.duplicates },
    { name: 'Risky', value: summary.risky },
  ].filter(d => d.value > 0) : []

  const downloads = [
    { label: 'CSV', icon: FileSpreadsheet, url: api.reports.csv(), desc: 'Comma separated values' },
    { label: 'JSON', icon: FileJson, url: api.reports.json(), desc: 'JSON format' },
  ]

  const handleDownload = async (url: string, format: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `email-validation-report.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and download email validation reports from your real data</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full rounded-xl" /></CardContent></Card>
          ))
        ) : (
          [
            { label: 'Total Validated', value: summary?.total || 0, color: 'text-primary-500' },
            { label: 'Valid', value: summary?.valid || 0, color: 'text-success-500' },
            { label: 'Invalid', value: summary?.invalid || 0, color: 'text-danger-500' },
            { label: 'Disposable', value: summary?.disposable || 0, color: 'text-warning-500' },
            { label: 'Duplicates', value: summary?.duplicates || 0, color: 'text-purple-500' },
            { label: 'Risky', value: summary?.risky || 0, color: 'text-orange-500' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Validation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileDown className="w-5 h-5" /> Export Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {downloads.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleDownload(item.url, item.label.toLowerCase())}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card hover:bg-accent hover:border-primary-500/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

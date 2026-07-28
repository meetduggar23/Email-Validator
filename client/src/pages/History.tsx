import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Trash2, Download, Filter, ChevronLeft, ChevronRight,
  Clock, Mail, Check, X, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { api } from '@/services/api'
import { formatDate, getConfidenceColor } from '@/lib/utils'

export default function History() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [provider, setProvider] = useState('')

  const loadHistory = () => {
    setIsLoading(true)
    api.history.list({ page, limit: 15, search, status, provider })
      .then(res => {
        setItems(res.data.items)
        setTotal(res.data.total)
        setTotalPages(res.data.totalPages)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }

  useEffect(() => { loadHistory() }, [page, status, provider])

  const handleSearch = () => { setPage(1); loadHistory() }

  const handleDelete = async (id: string) => {
    await api.history.delete(id)
    loadHistory()
  }

  const handleClear = async () => {
    if (confirm('Clear all history?')) {
      await api.history.clear()
      loadHistory()
    }
  }

  const downloadItem = (item: any) => {
    const json = JSON.stringify(item, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validation-${item.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground mt-1">View and manage past validations ({total} total)</p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" /> Clear All
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="invalid">Invalid</SelectItem>
                <SelectItem value="disposable">Disposable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Providers</SelectItem>
                <SelectItem value="Google Gmail">Gmail</SelectItem>
                <SelectItem value="Yahoo Mail">Yahoo</SelectItem>
                <SelectItem value="Microsoft Outlook">Outlook</SelectItem>
                <SelectItem value="Microsoft Hotmail">Hotmail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No validation history yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isValid ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                    }`}>
                      {item.isValid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{item.provider}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-medium hidden sm:inline ${getConfidenceColor(item.confidenceScore)}`}>
                      {item.confidenceScore}%
                    </span>
                    {item.isDisposable && <Badge variant="warning" className="text-[10px]">Disposable</Badge>}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadItem(item)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-danger-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

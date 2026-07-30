import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FolderOpen, Trash2, Edit3, X, Check, Mail, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { formatDate, getConfidenceColor } from '@/lib/utils'
import EmptyState from '@/components/EmptyState'
import { toast } from '@/components/ui/toast'

const PRESET_COLORS = ['#4F46E5', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function Collections() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formColor, setFormColor] = useState('#4F46E5')

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => api.collections.list().then(r => r.data),
  })

  const { data: collectionItems } = useQuery({
    queryKey: ['collection-items', viewingId],
    queryFn: () => api.collections.items(viewingId!).then(r => r.data),
    enabled: !!viewingId,
  })

  const createMutation = useMutation({
    mutationFn: () => api.collections.create(formName, formDesc, formColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      setShowCreate(false); setFormName(''); setFormDesc(''); setFormColor('#4F46E5')
      toast({ title: 'Collection created', variant: 'success' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.collections.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      if (viewingId) setViewingId(null)
      toast({ title: 'Collection deleted', variant: 'default' })
    },
  })

  const list = collections || []

  if (isLoading) return (
    <div className="space-y-8 animate-in">
      <h1 className="text-3xl font-bold">Collections</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">Organize validated emails into groups</p>
        </div>
        <Button size="sm" onClick={() => { setShowCreate(true); setFormName(''); setFormDesc(''); setFormColor('#4F46E5') }}>
          <Plus className="w-4 h-4 mr-2" /> New Collection
        </Button>
      </div>

      {list.length === 0 && !viewingId && (
        <EmptyState icon="folder" title="No collections yet" description="Create a collection to organize your validated emails." />
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card>
              <CardContent className="p-5 space-y-4">
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Collection name..." className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary-500" autoFocus />
                <input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Description (optional)..." className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary-500" />
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setFormColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${formColor === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button size="sm" onClick={() => createMutation.mutate()} disabled={!formName.trim() || createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!viewingId ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((col: any, i: number) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setViewingId(col.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${col.color}20` }}>
                      <FolderOpen className="w-5 h-5" style={{ color: col.color }} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(col.id) }} className="p-1.5 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/30">
                        <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm">{col.name}</h3>
                  {col.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{col.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{col.itemCount || 0} emails</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setViewingId(null)} className="mb-4">
            <X className="w-4 h-4 mr-2" /> Back to collections
          </Button>
          <h2 className="text-xl font-semibold mb-4">
            {list.find((c: any) => c.id === viewingId)?.name || 'Collection'}
          </h2>
          {(!collectionItems || collectionItems.length === 0) ? (
            <EmptyState icon="mail" title="No emails in this collection" description="Add emails from the validation page." />
          ) : (
            <div className="space-y-2">
              {collectionItems.map((item: any, i: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{item.email}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={item.isValid ? 'success' : 'danger'} className="text-[10px]">
                      {item.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                    {item.confidenceScore != null && (
                      <span className={`text-xs font-medium ${getConfidenceColor(item.confidenceScore)}`}>{item.confidenceScore}%</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

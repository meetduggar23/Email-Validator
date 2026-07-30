import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Trash2, Search, ArrowUpDown, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { formatDate, getConfidenceColor } from '@/lib/utils'
import EmptyState from '@/components/EmptyState'
import { toast } from '@/components/ui/toast'

export default function Favorites() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'confidenceScore'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.favorites.list().then(r => r.data),
    refetchInterval: 10000,
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.favorites.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      toast({ title: 'Removed from favorites', variant: 'default' })
    },
  })

  const items = (data || [])
    .filter((f: any) => !search || f.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      const dir = sortOrder === 'desc' ? -1 : 1
      if (sortBy === 'confidenceScore') return (a.confidenceScore - b.confidenceScore) * dir
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    })

  const toggleSort = (field: 'createdAt' | 'confidenceScore') => {
    if (sortBy === field) setSortOrder(o => o === 'desc' ? 'asc' : 'desc')
    else { setSortBy(field); setSortOrder('desc') }
  }

  if (isError) {
    return (
      <div className="space-y-8 animate-in">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <EmptyState icon="heart" title="Could not load favorites" description="There was an error loading your favorites. Please try again." action={{ label: 'Retry', onClick: () => refetch() }} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-muted-foreground mt-1">Starred emails for quick access</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState icon="heart" title="No favorites yet" description="Star an email during validation to save it here for quick access." action={{ label: 'Go Validate', onClick: () => window.location.href = '/validate' }} />
      )}

      {items.length > 0 && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search favorites..." className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm outline-none focus:border-primary-500 transition-colors" />
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggleSort('createdAt')}>
              Date <ArrowUpDown className="ml-1 w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleSort('confidenceScore')}>
              Score <ArrowUpDown className="ml-1 w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((fav: any, i: number) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Heart className="w-4 h-4 fill-danger-500 text-danger-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{fav.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {fav.provider || 'Unknown'} &middot; {formatDate(fav.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={fav.isValid ? 'success' : 'danger'} className="text-[10px]">
                    {fav.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  <span className={`text-sm font-medium ${getConfidenceColor(fav.confidenceScore)}`}>
                    {fav.confidenceScore}%
                  </span>
                  <button onClick={() => removeMutation.mutate(fav.id)} className="p-1.5 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-900/30 text-muted-foreground hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

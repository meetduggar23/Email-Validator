import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  UploadCloud, FileText, Check, X, AlertTriangle, Download,
  Trash2, BarChart3, ChevronDown, ChevronUp, List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { api } from '@/services/api'
import { formatDate, getConfidenceColor } from '@/lib/utils'
import Papa from 'papaparse'

export default function BulkValidate() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(true)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return

    setFile(f)
    setResult(null)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split(/[\n\r,]+/).map(l => l.trim()).filter(l => l.includes('@'))
      setPreview(lines.slice(0, 10))
    }
    reader.readAsText(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file) return
    setIsProcessing(true)
    setError('')

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 20, 90))
    }, 500)

    try {
      const res = await api.bulk.upload(file)
      clearInterval(progressInterval)
      setProgress(100)
      if (res.success) {
        setResult(res.data)
      } else {
        setError(res.error || 'Upload failed')
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message || 'Upload failed')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview([])
    setResult(null)
    setError('')
    setProgress(0)
  }

  const downloadCSV = () => {
    if (!result?.results) return
    const csv = Papa.unparse(result.results.map((r: any) => ({
      email: r.email,
      status: r.status,
      ...(r.result ? {
        syntax: r.result.syntax,
        domain: r.result.domain,
        mxRecords: r.result.mxRecords,
        disposable: r.result.disposable,
        provider: r.result.provider,
        confidence: r.result.confidenceScore,
      } : {}),
    })))
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'validation-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validCount = result?.results?.filter((r: any) => r.status === 'completed' && r.result?.syntax && !r.result?.disposable).length || 0
  const invalidCount = result?.results?.filter((r: any) => r.status === 'failed' || (r.result && !r.result.syntax)).length || 0
  const disposableCount = result?.results?.filter((r: any) => r.result?.disposable).length || 0

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Bulk Validate</h1>
        <p className="text-muted-foreground mt-1">Upload a CSV or TXT file to validate multiple email addresses at once</p>
      </div>

      {/* Upload Zone */}
      {!result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                    : 'border-border hover:border-primary-300 hover:bg-muted/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-primary-500' : 'text-primary-600 dark:text-primary-400'}`} />
                </div>
                {isDragActive ? (
                  <p className="text-lg font-medium text-primary-500">Drop your file here</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">Drag & drop your file here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse (CSV, TXT - max 10MB)</p>
                  </>
                )}
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB - {preview.length} emails detected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={handleUpload} disabled={isProcessing}>
                        {isProcessing ? 'Uploading...' : 'Upload & Validate'}
                      </Button>
                    </div>
                  </div>

                  {/* Preview */}
                  {preview.length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <List className="w-4 h-4" /> Preview ({preview.length} emails)
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {preview.map((email, i) => (
                          <div key={i} className="text-sm text-muted-foreground font-mono">
                            {i + 1}. {email}
                          </div>
                        ))}
                        {file && (() => {
                          const reader = new FileReader()
                          let totalLines = 0
                          return null
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          <AnimatePresence>
            {progress > 0 && progress < 100 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Processing...</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 rounded-2xl p-4">
          {error}
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: result.results?.length || 0, color: 'bg-primary-100 text-primary-600' },
                { label: 'Valid', value: validCount, color: 'bg-success-100 text-success-600' },
                { label: 'Invalid', value: invalidCount, color: 'bg-danger-100 text-danger-600' },
                { label: 'Disposable', value: disposableCount, color: 'bg-warning-100 text-warning-600' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowResults(!showResults)}>
                {showResults ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                {showResults ? 'Hide Results' : 'Show Results'}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={downloadCSV}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Upload
                </Button>
              </div>
            </div>

            {/* Results Table */}
            <AnimatePresence>
              {showResults && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Provider</th>
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Confidence</th>
                              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Disposable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.results?.map((r: any, i: number) => (
                              <motion.tr
                                key={r.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                              >
                                <td className="p-4 text-sm font-medium">{r.email}</td>
                                <td className="p-4">
                                  <Badge variant={r.status === 'completed' && r.result?.syntax ? 'success' : 'danger'}>
                                    {r.status === 'completed' && r.result?.syntax ? 'Valid' : 'Invalid'}
                                  </Badge>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">{r.result?.provider || '-'}</td>
                                <td className="p-4">
                                  <span className={`text-sm font-medium ${getConfidenceColor(r.result?.confidenceScore || 0)}`}>
                                    {r.result?.confidenceScore || 0}%
                                  </span>
                                </td>
                                <td className="p-4">
                                  {r.result?.disposable ? (
                                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                                  ) : (
                                    <Check className="w-4 h-4 text-success-500" />
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

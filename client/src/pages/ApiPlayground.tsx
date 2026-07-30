import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Play, Terminal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

const EXAMPLE_CODE = `{
  "email": "demo@gmail.com"
}`

export default function ApiPlayground() {
  const [email, setEmail] = useState('demo@gmail.com')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    setError('')
    setResponse(null)
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.success) setResponse(data.data)
      else setError(data.error || 'Request failed')
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response || { error }, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copied to clipboard', variant: 'success' })
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">API Playground</h1>
        <p className="text-muted-foreground mt-1">Test the email validation API directly from your browser</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-mono font-bold">POST</span>
              <span className="text-sm font-mono text-muted-foreground">/api/validate</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Request Body</label>
              <div className="relative">
                <pre className="p-4 rounded-xl bg-muted text-sm font-mono overflow-x-auto">
                  {`{`}
                  <br />
                  {`  "email": "`}
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                    className="bg-transparent border-b border-dashed border-primary-400 outline-none w-48 text-primary-600 dark:text-primary-400 font-mono"
                  />
                  {`"`}
                  <br />
                  {`}`}
                </pre>
              </div>
            </div>

            <Button onClick={handleSend} disabled={isLoading || !email.trim()} className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Send Request</>
              )}
            </Button>

            <div className="text-xs text-muted-foreground">
              <p className="mb-1 font-medium">Example curl:</p>
              <pre className="p-3 rounded-lg bg-muted overflow-x-auto">
                {`curl -X POST /api/validate \\
  -H "Content-Type: application/json" \\
  -d '{"email":"${email}"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response</span>
              {response && (
                <Button variant="ghost" size="sm" onClick={copyResponse}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>

            <div className="min-h-[300px] rounded-xl bg-[#1E1E2E] p-4 overflow-x-auto">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Waiting for response...</span>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs text-red-400 font-mono">Error</span>
                  </div>
                  <pre className="text-sm text-red-300 font-mono">{error}</pre>
                </div>
              )}

              {response && !isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${response.syntax ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-white/40 font-mono">{response.syntax ? '200 OK' : '422 Unprocessable'}</span>
                  </div>
                  <pre className="text-sm text-white font-mono whitespace-pre-wrap">{JSON.stringify({
                    email: response.email,
                    syntax: response.syntax,
                    domain: response.domain,
                    mxRecords: response.mxRecords,
                    provider: response.provider,
                    disposable: response.disposable,
                    healthScore: response.healthScore || response.confidenceScore,
                    confidence: `${response.confidenceScore}%`,
                    deliverability: response.deliverability,
                  }, null, 2)}</pre>
                  {response.explanation && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-white/60">{response.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {!response && !error && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <Terminal className="w-8 h-8 mb-2" />
                  <span className="text-sm">Send a request to see the response</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">API Endpoints</h2>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold">POST</span>
                <code className="font-mono">/api/validate</code>
              </div>
              <p className="text-muted-foreground mb-2">Validate a single email address</p>
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">{`{ "email": "user@example.com" }`}</pre>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">GET</span>
                <code className="font-mono">/api/health</code>
              </div>
              <p className="text-muted-foreground">Check API health status</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">GET</span>
                <code className="font-mono">/api/stats/dashboard</code>
              </div>
              <p className="text-muted-foreground">Get dashboard statistics</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">GET</span>
                <code className="font-mono">/api/history?page=1&limit=20</code>
              </div>
              <p className="text-muted-foreground">Get paginated validation history</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

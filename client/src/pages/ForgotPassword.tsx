import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setSent(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-950 dark:to-primary-950 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </Link>
            {sent ? (
              <>
                <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success-500" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground text-sm mt-1">We've sent a recovery link to {email}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Forgot password?</h1>
                <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a recovery link</p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send recovery link'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

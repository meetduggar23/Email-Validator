import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmailValidationCard from '@/components/EmailValidationCard'
import { motion } from 'framer-motion'
import {
  Shield, Check, ChevronDown, Menu, X, Mail, Globe,
  Search, BarChart3, Download, Upload, Clock, Zap,
  Terminal, Users, Star, ArrowUpRight, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.08 },
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
]

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: () => api.stats.dashboard().then(r => r.data),
    refetchInterval: 30000,
    staleTime: 10000,
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111827] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-[#E5E7EB]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <span className="font-semibold text-lg tracking-tight">Email Validator</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/dashboard"><Button size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm">Dashboard</Button></Link>
            </div>

            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-[#6B7280] hover:text-[#111827]">
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4 space-y-3">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileMenu(false)} className="block text-sm text-[#6B7280] hover:text-[#111827] py-2">{link.label}</a>
            ))}
            <div className="pt-2">
              <Link to="/dashboard" onClick={() => setMobileMenu(false)}><Button size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white w-full">Dashboard</Button></Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-20 lg:pb-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4F46E5]/5 border border-[#4F46E5]/10 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                <span className="text-xs font-medium text-[#4F46E5] tracking-wide uppercase">Dashboard </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-[#111827]">
                Validate Every Email{' '}
                <span className="text-[#4F46E5]">Before You Send It</span>
              </h1>
              <p className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-lg">
                Check syntax, domain, MX records, and disposable emails in real time.
                Our engine validates thousands of addresses per minute with 99.9% accuracy.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/validate">
                  <Button className="h-12 px-7 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-base shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                    Validate Email
                    <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-[#6B7280]">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> No credit card</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Free tier</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> 99.9% uptime</div>
              </div>
            </motion.div>

            {/* Right - Validation Panel */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                      <div className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                    </div>
                    <span className="text-xs text-white/40 font-mono ml-2">validate — zsh</span>
                  </div>
                  <Terminal className="w-4 h-4 text-white/30" />
                </div>

                <div className="text-sm text-white/50 font-medium mb-4">Test an email address</div>
                <EmailValidationCard variant="landing" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-medium text-[#4F46E5] tracking-widest uppercase">Dashboard</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">Beautiful analytics at a glance</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xl shadow-black/5 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]/60" />
              </div>
              <span className="text-xs text-[#6B7280] font-mono ml-3">dashboard</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: 'Total Validated', value: stats?.totalEmailsChecked ?? '—' },
                  { label: 'Valid', value: stats?.validEmails ?? '—' },
                  { label: 'Invalid', value: stats?.invalidEmails ?? '—' },
                  { label: 'Disposable', value: stats?.disposableEmails ?? '—' },
                  { label: 'Deliverability', value: stats?.deliverabilityRate != null ? `${stats.deliverabilityRate}%` : '—' },
                  { label: 'MX Success', value: stats?.mxSuccess != null ? `${stats.mxSuccess}%` : '—' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#FAFAFA] rounded-xl p-4 border border-[#E5E7EB]">
                    <div className="text-xs text-[#6B7280] font-medium">{stat.label}</div>
                    <div className="text-xl font-bold text-[#111827] mt-1">
                      {statsLoading ? <Skeleton className="h-7 w-16" /> : stat.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-48 rounded-xl bg-[#F9F9FB] border border-[#E5E7EB] p-4">
                {statsLoading ? (
                  <Skeleton className="h-full w-full rounded-lg" />
                ) : stats?.dailyStats?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyStats}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {stats.dailyStats.map((_: any, i: number) => (
                          <Cell key={i} fill="#4F46E5" fillOpacity={0.6 + (i / stats.dailyStats.length) * 0.4} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#D1D5DB] text-sm">No data yet</div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-16 border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.p {...fadeUp()} className="text-xs font-medium text-[#6B7280] tracking-widest uppercase text-center mb-8">
            Trusted by teams worldwide
          </motion.p>
          <motion.div {...stagger} className="flex flex-wrap justify-center items-center gap-12 sm:gap-16 text-[#9CA3AF]">
            {['Vercel', 'Stripe', 'Linear', 'Figma', 'Notion', 'Railway'].map(name => (
              <motion.span
                key={name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg sm:text-xl font-semibold tracking-tight hover:text-[#6B7280] transition-colors"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 lg:py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp()} className="max-w-xl">
            <span className="text-xs font-medium text-[#4F46E5] tracking-widest uppercase">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">Everything you need to validate emails</h2>
            <p className="mt-4 text-[#6B7280] leading-relaxed">
              Comprehensive email validation with real-time checks, bulk processing, and detailed analytics.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { icon: Zap, title: 'Real-time Validation', desc: 'Validate emails instantly as users type with live feedback and auto-correction suggestions.' },
              { icon: Globe, title: 'Domain & MX Check', desc: 'Verify domain existence and mail exchange records to confirm deliverability before sending.' },
              { icon: Shield, title: 'Disposable Detection', desc: 'Identify temporary and disposable email addresses from 10,000+ known domains.' },
              { icon: Upload, title: 'Bulk CSV Processing', desc: 'Upload CSV or TXT files and validate thousands of emails in a single batch operation.' },
              { icon: BarChart3, title: 'Detailed Analytics', desc: 'Track validation history, provider statistics, and daily trends with interactive charts.' },
              { icon: Download, title: 'Export & Reports', desc: 'Download validation results in CSV, JSON, or Excel format for your records.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:border-[#4F46E5]/20 hover:shadow-lg hover:shadow-[#4F46E5]/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/5 flex items-center justify-center mb-4 group-hover:bg-[#4F46E5]/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <h3 className="font-semibold text-[#111827]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 lg:py-32 px-6 lg:px-8 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-medium text-[#4F46E5] tracking-widest uppercase">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">Three steps to clean your email list</h2>
          </motion.div>

          <motion.div {...stagger} className="grid md:grid-cols-3 gap-10 mt-16 relative">
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-[#E5E7EB]" />
            {[
              { step: '01', icon: Mail, title: 'Enter Email', desc: 'Type a single email or upload a CSV file containing your email list.' },
              { step: '02', icon: Search, title: 'Run Validation', desc: 'Our engine checks syntax, domain, MX records, and disposable status.' },
              { step: '03', icon: BarChart3, title: 'Get Results', desc: 'View detailed reports with confidence scores, suggestions, and export options.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#4F46E5]/5 flex items-center justify-center mx-auto mb-5 relative z-10">
                  <item.icon className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <span className="text-xs font-semibold text-[#4F46E5] tracking-widest">{item.step}</span>
                <h3 className="font-semibold mt-2 text-[#111827]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="py-20 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '10M+', label: 'Emails validated' },
              { value: '99.9%', label: 'Accuracy rate' },
              { value: '<200ms', label: 'Average response' },
              { value: '10K+', label: 'Disposable domains' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-[#111827] tracking-tight">{stat.value}</div>
                <div className="text-sm text-[#6B7280] mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-medium text-[#4F46E5] tracking-widest uppercase">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 tracking-tight">Frequently asked questions</h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'How does email validation work?', a: 'Our validator checks multiple criteria: email syntax format, domain existence, MX record availability, disposable email detection, and provider identification to give you a comprehensive deliverability assessment.' },
              { q: 'Is my data secure?', a: 'Yes. All email data is encrypted in transit and at rest. We never share or sell your data. You can delete your data at any time.' },
              { q: 'Can I validate bulk emails?', a: 'Absolutely. Upload a CSV file with your email list and we will validate them all at once. Download the results in your preferred format.' },
              { q: 'What email providers are supported?', a: 'We support all major providers including Gmail, Yahoo, Outlook, iCloud, ProtonMail, and thousands of custom domains.' },
              { q: 'Is there a limit on validations?', a: 'No. Our Free plan includes unlimited email validations with no daily or monthly caps.' },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAFA] transition-colors"
                >
                  <span className="font-medium text-[#111827] text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 shrink-0 ml-4 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-sm text-[#6B7280] leading-relaxed">{faq.a}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to clean your email list?</h2>
            <p className="mt-4 text-lg text-[#6B7280]">Start validating emails instantly. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link to="/validate">
                <Button className="h-12 px-8 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-base shadow-sm">
                  Validate Email
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" className="h-12 px-8 rounded-xl text-base border-[#E5E7EB] hover:bg-[#F3F4F6]">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#E5E7EB] py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center mb-4">
                <span className="font-semibold text-lg tracking-tight">Email Validator</span>
              </Link>
              <p className="text-sm text-[#6B7280] max-w-sm leading-relaxed">
                Advanced email validation platform. Check syntax, domain, MX records, and deliverability instantly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] tracking-widest uppercase mb-5">Product</h4>
              <div className="flex flex-col gap-3">
                <Link to="/validate" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Validate Email</Link>
                <Link to="/bulk" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Bulk Upload</Link>
                <Link to="/reports" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Reports</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] tracking-widest uppercase mb-5">Company</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E5E7EB] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#9CA3AF]">&copy; 2024 EmailValidator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


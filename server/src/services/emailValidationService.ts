import validator from 'validator'
import dns from 'dns/promises'
import { v4 as uuidv4 } from 'uuid'

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwawaymail.com',
  'yopmail.com', 'maildrop.cc', 'getnada.com', '10minutemail.com',
  'temp-mail.org', 'fakeinbox.com', 'trashmail.com', 'sharklasers.com',
  'burnermail.io', 'spamgourmet.com', 'mailnator.com', 'dispostable.com',
  'tempemail.net', 'mailmetrash.com', 'mailexpire.com', 'mailsac.com',
  'tempinbox.com', 'spambox.us', 'mailcatch.com', 'guerrillamail.org',
  'guerrillamail.net', 'guerrillamail.biz', 'grr.la', 'dodgeit.com',
  'spam.la', 'spamavert.com', 'spamdecoy.net', 'spamex.com',
  'spamgourmet.com', 'spamhole.com', 'spammotel.com', 'trashymail.com',
  'tyldd.com', 'uglyscholar.com', 'spambog.com', 'spambox.info',
  'spambox.me', 'spambox.org', 'spambox.us', 'spamcero.com',
  'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com', 'spamday.com',
  'spamherelots.com', 'spamhereplease.com', 'spamify.com', 'spaminator.de',
  'spamkill.info', 'spaml.com', 'spamlot.net', 'spamsalad.in',
  'spamserver.de', 'spamserver.net', 'spamslicer.com', 'spamsphere.com',
  'spamstack.net', 'spamspot.com', 'spamtrail.com', 'spamtroll.net',
  'spamvertise.net', 'spamwc.de', 'tempail.com', 'tempe-mail.com',
  'tempemail.biz', 'tempemail.co.za', 'tempemail.com', 'tempemail.net',
  'tempmail.co', 'tempmail.de', 'tempmail.eu', 'tempmail.it',
  'tempmail.net', 'tempmail.org', 'tempmail.us', 'tempmail.xyz',
  'tempmailo.com', 'tempmails.org', 'tempomail.fr', 'temporarily.de',
  'temporarioemail.com.br', 'temporaryemail.net', 'temporaryemail.us',
  'temporaryforwarding.com', 'temporaryinbox.com', 'temporarymail.co',
  'temporarymail.io', 'temporarymail.org', 'temporarymailbox.com',
  'thankyou2010.com', 'throwam.com', 'throwaway.email', 'throwaway.io',
  'throwaway.mailinator.com', 'throwaway.xyz', 'throwawayemail.com',
  'throya.com', 'thunkinator.org', 'tmail.com', 'tmail.ws',
  'tmailinator.com', 'trash-amil.com', 'trash-me.com', 'trash2009.com',
  'trash247.com', 'trashbox.eu', 'trashcanmail.com', 'trashdevil.com',
  'trashemail.de', 'trashify.org', 'trashmail.at', 'trashmail.com',
  'trashmail.de', 'trashmail.ga', 'trashmail.gq', 'trashmail.io',
  'trashmail.me', 'trashmail.net', 'trashmail.org', 'trashmail.ws',
  'trashmailer.com', 'trashmails.com', 'trashymail.net',
])

const COMMON_PROVIDER_DOMAINS = new Map([
  ['gmail.com', 'Google Gmail'],
  ['googlemail.com', 'Google Gmail'],
  ['yahoo.com', 'Yahoo Mail'],
  ['yahoo.co.uk', 'Yahoo Mail UK'],
  ['yahoo.co.in', 'Yahoo Mail India'],
  ['ymail.com', 'Yahoo Mail'],
  ['rocketmail.com', 'Yahoo Mail'],
  ['hotmail.com', 'Microsoft Hotmail'],
  ['outlook.com', 'Microsoft Outlook'],
  ['live.com', 'Microsoft Live'],
  ['msn.com', 'Microsoft MSN'],
  ['aol.com', 'AOL Mail'],
  ['aim.com', 'AIM Mail'],
  ['icloud.com', 'Apple iCloud'],
  ['me.com', 'Apple iCloud'],
  ['mac.com', 'Apple iCloud'],
  ['protonmail.com', 'Proton Mail'],
  ['proton.me', 'Proton Mail'],
  ['pm.me', 'Proton Mail'],
  ['zoho.com', 'Zoho Mail'],
  ['yandex.com', 'Yandex Mail'],
  ['gmx.com', 'GMX Mail'],
  ['fastmail.com', 'FastMail'],
  ['tutanota.com', 'Tutanota'],
  ['hey.com', 'HEY World'],
  ['mail.com', 'Mail.com'],
  ['inbox.com', 'Inbox.com'],
  ['att.net', 'AT&T Mail'],
  ['verizon.net', 'Verizon Mail'],
  ['comcast.net', 'Comcast Mail'],
  ['sbcglobal.net', 'AT&T SBCGlobal'],
  ['bellsouth.net', 'AT&T Bellsouth'],
  ['earthlink.net', 'EarthLink'],
  ['cox.net', 'Cox Mail'],
  ['charter.net', 'Spectrum Charter'],
  ['optonline.net', 'Optimum Online'],
  ['qq.com', 'Tencent QQ Mail'],
  ['163.com', 'NetEase 163'],
  ['126.com', 'NetEase 126'],
  ['mail.ru', 'Mail.ru'],
  ['ukr.net', 'Ukr.net'],
  ['rediffmail.com', 'Rediffmail'],
])

const TRUSTED_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'ymail.com', 'rocketmail.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'zoho.com',
  'aol.com', 'aim.com',
])

const TYPOS = new Map([
  ['gmial.com', 'gmail.com'], ['gmil.com', 'gmail.com'], ['gmal.com', 'gmail.com'],
  ['gmaill.com', 'gmail.com'], ['gmai.com', 'gmail.com'], ['gamil.com', 'gmail.com'],
  ['gmali.com', 'gmail.com'], ['gnail.com', 'gmail.com'], ['gmaik.com', 'gmail.com'],
  ['gmak.com', 'gmail.com'], ['gmaul.com', 'gmail.com'], ['gmaio.com', 'gmail.com'],
  ['gmaiil.com', 'gmail.com'], ['gmaail.com', 'gmail.com'], ['gmaiol.com', 'gmail.com'],
  ['gmaill.com', 'gmail.com'], ['gmmail.com', 'gmail.com'],
  ['yaho.com', 'yahoo.com'], ['yahooo.com', 'yahoo.com'], ['yhoo.com', 'yahoo.com'],
  ['yahho.com', 'yahoo.com'], ['yahoocom.com', 'yahoo.com'], ['yahom.com', 'yahoo.com'],
  ['yhaoo.com', 'yahoo.com'], ['ayhoo.com', 'yahoo.com'], ['yaboo.com', 'yahoo.com'],
  ['hotmaill.com', 'hotmail.com'], ['hotmai.com', 'hotmail.com'], ['hotmil.com', 'hotmail.com'],
  ['hotmal.com', 'hotmail.com'], ['hotmial.com', 'hotmail.com'], ['homtail.com', 'hotmail.com'],
  ['hotmaik.com', 'hotmail.com'], ['hotmaul.com', 'hotmail.com'], ['hotmaio.com', 'hotmail.com'],
  ['hotnail.com', 'hotmail.com'],
  ['outllok.com', 'outlook.com'], ['outlok.com', 'outlook.com'], ['outlokk.com', 'outlook.com'],
  ['outlock.com', 'outlook.com'], ['outloo.com', 'outlook.com'], ['otulook.com', 'outlook.com'],
  ['aol.coom', 'aol.com'], ['aol.cmo', 'aol.com'], ['aol.con', 'aol.com'],
  ['icloud.coom', 'icloud.com'], ['icloud.cmo', 'icloud.com'], ['icloud.con', 'icloud.com'],
  ['iclud.com', 'icloud.com'], ['icoud.com', 'icloud.com'],
  ['protonmai.com', 'protonmail.com'], ['protonmaill.com', 'protonmail.com'],
  ['outloo.coom', 'outlook.com'], ['outlok.coom', 'outlook.com'],
])

export interface ValidationResponse {
  email: string
  syntax: boolean
  domain: boolean
  domainCheck: 'ok' | 'not_found' | 'unable_to_verify'
  mxRecords: boolean
  mxCheck: 'ok' | 'not_found' | 'unable_to_verify'
  smtp: boolean | null
  disposable: boolean
  provider: string
  deliverability: 'high' | 'medium' | 'low' | 'unknown'
  confidenceScore: number
  healthScore: number
  healthLabel: 'Healthy' | 'Risky' | 'Invalid'
  explanation: string
  suggestions: string[]
  typoSuggestions: string[]
  debugLog: string[]
}

function log(debugLog: string[], message: string): void {
  const timestamp = new Date().toISOString().slice(11, 23)
  const entry = `[${timestamp}] ${message}`
  debugLog.push(entry)
  console.log(entry)
}

async function checkDnsConnectivity(): Promise<boolean> {
  try {
    await dns.resolve('google.com', 'A')
    return true
  } catch {
    try {
      await dns.resolve('cloudflare.com', 'A')
      return true
    } catch {
      return false
    }
  }
}

type DnsResult = { status: 'ok' } | { status: 'not_found' } | { status: 'unable_to_verify'; reason: string }

async function resolveDomain(domain: string, debugLog: string[]): Promise<DnsResult> {
  log(debugLog, `DNS: Resolving A records for ${domain}...`)
  try {
    const records = await dns.resolve(domain, 'A')
    if (records.length > 0) {
      log(debugLog, `DNS: A records found for ${domain}: ${records.slice(0, 3).join(', ')}`)
      return { status: 'ok' }
    }
  } catch (err: any) {
    log(debugLog, `DNS: A record lookup failed for ${domain}: code=${err.code} syscall=${err.syscall} message=${err.message}`)
  }

  log(debugLog, `DNS: Trying AAAA records for ${domain}...`)
  try {
    const records = await dns.resolve(domain, 'AAAA')
    if (records.length > 0) {
      log(debugLog, `DNS: AAAA records found for ${domain}: ${records.slice(0, 3).join(', ')}`)
      return { status: 'ok' }
    }
  } catch (err: any) {
    log(debugLog, `DNS: AAAA record lookup failed for ${domain}: code=${err.code} syscall=${err.syscall} message=${err.message}`)
  }

  log(debugLog, `DNS: All DNS lookups failed for ${domain}`)
  return { status: 'not_found' }
}

async function resolveMX(domain: string, debugLog: string[]): Promise<DnsResult> {
  log(debugLog, `MX: Resolving MX records for ${domain}...`)
  try {
    const records = await dns.resolveMx(domain)
    if (records.length > 0) {
      const sorted = records.sort((a, b) => a.priority - b.priority)
      log(debugLog, `MX: Found ${records.length} records for ${domain}: ${sorted.map(r => `${r.exchange} (priority ${r.priority})`).join(', ')}`)
      return { status: 'ok' }
    }
    log(debugLog, `MX: No MX records returned for ${domain} (empty array)`)
    return { status: 'not_found' }
  } catch (err: any) {
    log(debugLog, `MX: Lookup failed for ${domain}: code=${err.code} syscall=${err.syscall} message=${err.message}`)
    if (err.code === 'ENODATA') {
      log(debugLog, `MX: ENODATA - DNS server returned no MX records for ${domain}`)
      return { status: 'not_found' }
    }
    if (err.code === 'ENOTFOUND' && err.syscall === 'queryMx') {
      log(debugLog, `MX: ENOTFOUND - domain likely does not exist`)
      return { status: 'not_found' }
    }
    log(debugLog, `MX: Treating as unable_to_verify (network/DNS error)`)
    return { status: 'unable_to_verify', reason: err.message }
  }
}

function getLevenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function findClosestDomain(domain: string): string | null {
  if (TYPOS.has(domain)) return TYPOS.get(domain)!

  let bestMatch: string | null = null
  let bestDist = Infinity
  for (const [typo, correct] of TYPOS) {
    if (typo === domain) return correct
    const dist = getLevenshteinDistance(domain, correct)
    if (dist <= 2 && dist < bestDist) {
      bestDist = dist
      bestMatch = correct
    }
  }
  return bestMatch
}

function getProvider(domain: string): string {
  return COMMON_PROVIDER_DOMAINS.get(domain) || 'Custom / Unknown'
}

export async function validateEmail(email: string): Promise<ValidationResponse> {
  const debugLog: string[] = []
  const normalizedEmail = email.trim().toLowerCase()
  const suggestions: string[] = []
  const typoSuggestions: string[] = []

  log(debugLog, `=== Starting validation for ${normalizedEmail} ===`)

  const atIndex = normalizedEmail.indexOf('@')
  const domain = atIndex > -1 ? normalizedEmail.slice(atIndex + 1) : ''
  const localPart = atIndex > -1 ? normalizedEmail.slice(0, atIndex) : ''

  const syntaxValid = validator.isEmail(normalizedEmail)
  log(debugLog, `Syntax: ${syntaxValid ? 'Valid' : 'Invalid'}`)

  if (!syntaxValid) {
    if (!normalizedEmail.includes('@')) {
      suggestions.push('Add an @ symbol to form a valid email address')
    } else if (!domain.includes('.')) {
      suggestions.push('Add a domain extension (e.g., .com, .org)')
    } else {
      suggestions.push('Check the email format (e.g., user@domain.com)')
    }
  }

  if (syntaxValid && domain) {
    const corrected = findClosestDomain(domain)
    if (corrected && corrected !== domain) {
      typoSuggestions.push(`Did you mean ${localPart}@${corrected}?`)
    }
  }

  if (localPart && domain) {
    const commonPatterns = [
      { re: /\.com\.com$/, fix: '.com' },
      { re: /\.con$/, fix: '.com' },
      { re: /\.cmo$/, fix: '.com' },
      { re: /\.coom$/, fix: '.com' },
      { re: /\.o rg$/, fix: '.org' },
      { re: /\.ne t$/, fix: '.net' },
      { re: /\.comm$/, fix: '.com' },
    ]
    for (const { re, fix } of commonPatterns) {
      if (re.test(domain)) {
        const fixed = domain.replace(re, fix)
        typoSuggestions.push(`Did you mean ${localPart}@${fixed}?`)
        break
      }
    }
  }

  let domainExists = false
  let domainCheck: 'ok' | 'not_found' | 'unable_to_verify' = 'not_found'
  let mxRecordsFound = false
  let mxCheck: 'ok' | 'not_found' | 'unable_to_verify' = 'not_found'
  let isDisposable = false
  let provider = 'Unknown'
  let deliverability: 'high' | 'medium' | 'low' | 'unknown' = 'unknown'
  let confidenceScore = 0
  let dnsError = false

  if (syntaxValid && domain) {
    isDisposable = DISPOSABLE_DOMAINS.has(domain)
    provider = getProvider(domain)
    const isTrusted = TRUSTED_PROVIDERS.has(domain)

    if (isTrusted) {
      log(debugLog, `Domain: ${domain} is a TRUSTED PROVIDER — marking domain+MX as valid by default`)
      domainExists = true
      domainCheck = 'ok'
      mxRecordsFound = true
      mxCheck = 'ok'
    }

    log(debugLog, `DNS: Performing DNS lookup for ${domain}...`)
    const domainResult = await resolveDomain(domain, debugLog)
    const mxResult = await resolveMX(domain, debugLog)

    if (domainResult.status === 'ok') {
      domainExists = true
      domainCheck = 'ok'
      log(debugLog, `RESULT: Domain ${domain} exists (A/AAAA records found)`)
    } else if (domainResult.status === 'not_found') {
      if (!isTrusted) {
        log(debugLog, `RESULT: Domain ${domain} not found`)
        domainExists = false
        domainCheck = 'not_found'
      } else {
        log(debugLog, `RESULT: Domain ${domain} DNS lookup failed but is trusted — keeping default`)
      }
    }

    if (mxResult.status === 'ok') {
      mxRecordsFound = true
      mxCheck = 'ok'
      log(debugLog, `RESULT: MX records found for ${domain}`)
    } else if (mxResult.status === 'not_found') {
      if (!isTrusted) {
        log(debugLog, `RESULT: No MX records for ${domain}`)
        mxRecordsFound = false
        mxCheck = 'not_found'
      } else {
        log(debugLog, `RESULT: MX lookup failed for ${domain} but is trusted — keeping default`)
      }
    } else if (mxResult.status === 'unable_to_verify') {
      dnsError = true
      if (isTrusted) {
        log(debugLog, `RESULT: MX lookup network error for trusted provider ${domain} — keeping default`)
      } else if (domainResult.status === 'ok') {
        log(debugLog, `RESULT: Domain exists but MX lookup had network error — flagging as unable_to_verify`)
        mxCheck = 'unable_to_verify'
        mxRecordsFound = false
      } else {
        dnsError = true
        domainCheck = 'unable_to_verify'
        mxCheck = 'unable_to_verify'
        log(debugLog, `RESULT: DNS resolution failed due to network error for ${domain}`)
      }
    }

    if (!isTrusted && domainResult.status === 'not_found' && mxResult.status === 'not_found') {
      if (dnsError) {
        if (typoSuggestions.length === 0) {
          suggestions.push('Unable to verify domain at this time — DNS resolution failed')
        }
      } else {
        if (typoSuggestions.length === 0) {
          suggestions.push('Domain does not exist')
          suggestions.push('No MX records found')
          suggestions.push('Email is not deliverable')
        } else {
          suggestions.push('Invalid Domain — did you mean a different domain?')
        }
      }
    }

    if (!isTrusted && domainResult.status === 'ok' && mxCheck === 'unable_to_verify') {
      suggestions.push('Domain exists but unable to verify mail exchange (MX) records at this time')
    }

    if (!isTrusted && domainResult.status === 'ok' && mxCheck === 'not_found') {
      suggestions.push('Domain exists but no mail exchange (MX) records found')
      suggestions.push('Email may not be deliverable')
    }
  }

  if (dnsError && !syntaxValid) {
    if (suggestions.length === 0) {
      suggestions.push('Unable to verify email at this time due to DNS resolution issues')
    }
  }

  if (syntaxValid) confidenceScore += 25
  if (domainExists) confidenceScore += 25
  if (mxRecordsFound) confidenceScore += 25
  if (!isDisposable) confidenceScore += 15
  if (syntaxValid && domainExists && mxRecordsFound && !isDisposable && TRUSTED_PROVIDERS.has(domain)) {
    confidenceScore += 10
  }

  if (isDisposable) confidenceScore = Math.min(confidenceScore, 35)
  if (!syntaxValid) confidenceScore = Math.min(confidenceScore, 10)
  if (!domainExists && !TRUSTED_PROVIDERS.has(domain)) confidenceScore = Math.min(confidenceScore, 40)

  if (confidenceScore >= 90) deliverability = 'high'
  else if (confidenceScore >= 60) deliverability = 'medium'
  else if (confidenceScore >= 25) deliverability = 'low'
  else deliverability = 'unknown'

  const healthScore = Math.round(confidenceScore)
  let healthLabel: 'Healthy' | 'Risky' | 'Invalid' = 'Invalid'
  if (healthScore >= 80) healthLabel = 'Healthy'
  else if (healthScore >= 40) healthLabel = 'Risky'

  const explanationParts: string[] = []

  if (!syntaxValid) {
    if (!normalizedEmail.includes('@')) explanationParts.push('The email address is missing the @ symbol.')
    else if (!domain.includes('.')) explanationParts.push('The domain is missing a top-level extension like .com or .org.')
    else explanationParts.push('The email format is invalid. Please use the format user@domain.com.')
  }

  if (syntaxValid && domain) {
    if (typoSuggestions.length > 0) {
      const typoSuggestion = typoSuggestions[0]
      const suggestedDomain = typoSuggestion.includes('@') ? typoSuggestion.split('@')[1]?.replace('?', '') : ''
      if (suggestedDomain) explanationParts.push(`The domain "${domain}" appears to contain a typo. Did you mean ${suggestedDomain}?`)
    }

    if (isDisposable) explanationParts.push('The email uses a disposable or temporary email provider which cannot be used for permanent accounts.')

    if (domainCheck === 'not_found' && !TRUSTED_PROVIDERS.has(domain)) {
      explanationParts.push(`The domain "${domain}" does not appear to exist. No DNS records were found.`)
    } else if (mxCheck === 'not_found' && !TRUSTED_PROVIDERS.has(domain)) {
      explanationParts.push('No mail exchange (MX) records were found for this domain. Email delivery is unlikely.')
    } else if (mxCheck === 'unable_to_verify') {
      explanationParts.push('We were unable to verify the mail servers for this domain at this time. This may be a temporary network issue.')
    }

    if (domainExists && mxRecordsFound && !isDisposable && syntaxValid) {
      if (TRUSTED_PROVIDERS.has(domain)) {
        explanationParts.push(`This is a ${provider.toLowerCase()} address with verified mail servers. The email should be deliverable.`)
      } else {
        explanationParts.push('The domain exists and has mail exchange records configured. The email should be deliverable.')
      }
    }
  }

  if (dnsError && syntaxValid && explanationParts.length === 0) {
    explanationParts.push('DNS resolution encountered a temporary issue. The domain may still be valid.')
  }

  if (explanationParts.length === 0) {
    explanationParts.push('Email validation completed with no issues detected.')
  }

  const explanation = explanationParts.join(' ')

  const result: ValidationResponse = {
    email: normalizedEmail,
    syntax: syntaxValid,
    domain: domainExists,
    domainCheck,
    mxRecords: mxRecordsFound,
    mxCheck,
    smtp: mxRecordsFound ? true : null,
    disposable: isDisposable,
    provider,
    deliverability,
    confidenceScore: Math.round(confidenceScore),
    healthScore,
    healthLabel,
    explanation,
    suggestions,
    typoSuggestions,
    debugLog,
  }

  log(debugLog, `=== Validation complete for ${normalizedEmail} ===`)
  log(debugLog, `RESULT: syntax=${syntaxValid} domain=${domainExists}(${domainCheck}) mx=${mxRecordsFound}(${mxCheck}) disposable=${isDisposable} confidence=${Math.round(confidenceScore)} deliverability=${deliverability}`)
  log(debugLog, `RESULT JSON: ${JSON.stringify({ email: normalizedEmail, syntax: syntaxValid, domain: domainExists, domainCheck, mxRecords: mxRecordsFound, mxCheck, disposable: isDisposable, provider, deliverability, confidenceScore: Math.round(confidenceScore), suggestions, typoSuggestions })}`)

  return result
}

export async function validateBulk(emails: string[]): Promise<ValidationResponse[]> {
  const results: ValidationResponse[] = []
  for (const email of emails) {
    results.push(await validateEmail(email.trim()))
  }
  return results
}

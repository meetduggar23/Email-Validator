import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EMAIL_DOMAINS, DOMAIN_TYPOS, type DomainEntry } from '@/constants/emailDomains'

interface EmailAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  placeholder?: string
  inputClassName?: string
  disabled?: boolean
  id?: string
  theme?: 'dark' | 'light'
}

export default function EmailAutocomplete({
  value,
  onChange,
  onEnter,
  placeholder = 'name@example.com',
  inputClassName = '',
  disabled = false,
  id,
  theme = 'light',
}: EmailAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [filteredDomains, setFilteredDomains] = useState<DomainEntry[]>([])
  const [typoSuggestion, setTypoSuggestion] = useState<{ typed: string; correction: string } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const updateSuggestions = useCallback((input: string) => {
    const atIdx = input.indexOf('@')

    if (atIdx === -1) {
      setFilteredDomains([])
      setTypoSuggestion(null)
      setIsOpen(false)
      return
    }

    if (atIdx === input.length - 1) {
      setFilteredDomains(EMAIL_DOMAINS)
      setTypoSuggestion(null)
      setIsOpen(true)
      setActiveIndex(-1)
      return
    }

    const domainPrefix = input.slice(atIdx + 1).toLowerCase()

    if (domainPrefix in DOMAIN_TYPOS) {
      setTypoSuggestion({ typed: domainPrefix, correction: DOMAIN_TYPOS[domainPrefix] })
    } else {
      setTypoSuggestion(null)
    }

    const matches = EMAIL_DOMAINS.filter(
      entry => entry.domain.startsWith(domainPrefix) && entry.domain !== domainPrefix
    )
    setFilteredDomains(matches)
    setActiveIndex(-1)

    const hasTypo = domainPrefix in DOMAIN_TYPOS
    setIsOpen(matches.length > 0 || hasTypo)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => updateSuggestions(value), 80)
    return () => clearTimeout(timer)
  }, [value, updateSuggestions])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]')
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const selectDomain = useCallback((domain: string) => {
    const atIdx = value.indexOf('@')
    const localPart = atIdx > -1 ? value.slice(0, atIdx + 1) : ''
    onChange(localPart + domain)
    setIsOpen(false)
    inputRef.current?.focus()
  }, [value, onChange])

  const acceptTypoCorrection = useCallback(() => {
    if (typoSuggestion) {
      selectDomain(typoSuggestion.correction)
    }
  }, [typoSuggestion, selectDomain])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || (filteredDomains.length === 0 && !typoSuggestion)) {
      if (e.key === 'Enter' && onEnter) {
        onEnter()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => Math.min(prev + 1, filteredDomains.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredDomains.length) {
          selectDomain(filteredDomains[activeIndex].domain)
        } else if (typoSuggestion && activeIndex === -1) {
          acceptTypoCorrection()
        } else if (onEnter) {
          onEnter()
        }
        setIsOpen(false)
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const hasAtSign = value.includes('@')

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (hasAtSign) {
            updateSuggestions(value)
          }
        }}
        placeholder={placeholder}
        className={inputClassName}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={isOpen ? 'email-autocomplete-list' : undefined}
        aria-activedescendant={activeIndex >= 0 ? `email-option-${activeIndex}` : undefined}
      />

      <AnimatePresence>
        {isOpen && (filteredDomains.length > 0 || typoSuggestion) && (
          <motion.div
            id="email-autocomplete-list"
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-2 w-full rounded-2xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#1E1E2E] border border-white/10 shadow-xl shadow-black/30'
                : 'bg-white border border-gray-200 shadow-lg shadow-black/5'
            }`}
            style={{ minWidth: '280px' }}
          >
            <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
              {typoSuggestion && (
                <button
                  onClick={acceptTypoCorrection}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                    theme === 'dark'
                      ? 'border-b border-white/5 hover:bg-white/5'
                      : 'border-b border-gray-100 hover:bg-amber-50'
                  }`}
                  role="option"
                  aria-selected={false}
                >
                  <span className="text-amber-500 shrink-0 text-base">⚠</span>
                  <div>
                    <span className={theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}>Did you mean </span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{typoSuggestion.correction}</span>
                    <span className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'}>?</span>
                  </div>
                </button>
              )}
              {filteredDomains.map((entry, i) => (
                <button
                  key={entry.domain}
                  id={`email-option-${i}`}
                  onClick={() => selectDomain(entry.domain)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                    theme === 'dark'
                      ? `text-white hover:bg-white/5 ${activeIndex === i ? 'bg-white/10' : ''}`
                      : `text-gray-900 hover:bg-gray-50 ${activeIndex === i ? 'bg-gray-100' : ''}`
                  }`}
                  role="option"
                  aria-selected={activeIndex === i}
                >
                  <span className="shrink-0 text-base">📧</span>
                  <div>
                    <div className="font-medium">{entry.domain}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{entry.provider}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

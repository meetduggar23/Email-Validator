export default function ProviderIcon({ provider, size = 20 }: { provider: string; size?: number }) {
  const s = size

  if (provider.includes('Gmail') || provider.includes('Google')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Gmail">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.91 12 9.818l6.545-4.91 1.528-1.417C21.691 2.28 24 3.434 24 5.457z" fill="#EA4335" />
      </svg>
    )
  }

  if (provider.includes('Outlook') || provider.includes('Hotmail') || provider.includes('Microsoft') || provider.includes('Live')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Outlook">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#0078D4" />
        <path d="M11.5 7.5v9l-4-2.25v-4.5l4-2.25zM15 8.5v7l-2.5-1.25v-4.5L15 8.5z" fill="#fff" />
      </svg>
    )
  }

  if (provider.includes('Yahoo')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Yahoo">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#6001D2" />
        <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Y!</text>
      </svg>
    )
  }

  if (provider.includes('iCloud') || provider.includes('Apple')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="iCloud">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#555" />
        <path d="M7.5 14.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5-1 2.5-2.5 2.5-2.5-1-2.5-2.5zM12 10c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5-1 2.5-2.5 2.5S12 11.5 12 10z" fill="#fff" opacity="0.8" />
      </svg>
    )
  }

  if (provider.includes('Proton')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Proton">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#6D4AFF" />
        <path d="M8 9h8M8 12h6M8 15h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (provider.includes('Zoho')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Zoho">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#E42527" />
        <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Z</text>
      </svg>
    )
  }

  if (provider.includes('GMX')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="GMX">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#1A6D9E" />
        <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">GMX</text>
      </svg>
    )
  }

  if (provider.includes('FastMail')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="FastMail">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#15967D" />
        <path d="M7 9l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (provider.includes('Yandex')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Yandex">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#FC3F1D" />
        <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Ya</text>
      </svg>
    )
  }

  if (provider.includes('Mail.ru')) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label="Mail.ru">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#FFD93D" />
        <path d="M7 10l5 3.5L17 10" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-label={provider}>
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#6B7280" />
      <path d="M7 9h10M7 12h8M7 15h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

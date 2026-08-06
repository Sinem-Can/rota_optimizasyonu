'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ErpToolbarProps {
  searchOpen: boolean
  onToggleSearch: () => void
  query: string
  onQueryChange: (value: string) => void
  searchPlaceholder: string
  resultCount: number
}

export function ErpToolbar({
  searchOpen,
  onToggleSearch,
  query,
  onQueryChange,
  searchPlaceholder,
  resultCount,
}: ErpToolbarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  return (
    <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2">
      <button
        type="button"
        onClick={onToggleSearch}
        aria-expanded={searchOpen}
        title={searchOpen ? 'Aramayı kapat' : 'Kayıtlarda ara'}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          searchOpen && 'bg-muted text-foreground',
        )}
      >
        {searchOpen ? <X className="size-3.5" /> : <Search className="size-3.5" />}
        Ara
      </button>

      {searchOpen ? (
        <div className="relative ml-auto w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input ref={searchRef} type="search" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={searchPlaceholder} aria-label="ERP kayıtlarında ara" className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
        </div>
      ) : (
        <span className="ml-auto text-[12px] font-medium text-muted-foreground">{resultCount} kayıt</span>
      )}
    </div>
  )
}

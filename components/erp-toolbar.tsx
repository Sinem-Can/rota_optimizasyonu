'use client'

import { Copy, Eye, Pencil, Search, Trash2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ErpToolbarProps {
  /** '+ Yeni' birincil aksiyonu; ilgili modülün dialog tetikleyicisi. */
  newAction: React.ReactNode
  hasSelection: boolean
  onEdit: () => void
  onDelete: () => void
  onInspect: () => void
  onCopy: () => void
  searchOpen: boolean
  onToggleSearch: () => void
  query: string
  onQueryChange: (value: string) => void
  searchPlaceholder: string
  resultCount: number
}

/** Kayıt seçimi gerektiren ikincil aksiyonlar için ortak ghost buton stili. */
const actionClass =
  'flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted-foreground/50'

export function ErpToolbar({
  newAction,
  hasSelection,
  onEdit,
  onDelete,
  onInspect,
  onCopy,
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

  const needsRow = hasSelection ? undefined : 'Önce tablodan bir kayıt seçin'

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-secondary/40 px-4 py-2">
      {newAction}

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <button
        type="button"
        onClick={onEdit}
        disabled={!hasSelection}
        title={needsRow ?? 'Seçili kaydı düzelt'}
        className={actionClass}
      >
        <Pencil className="size-3.5" />
        Düzelt
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={!hasSelection}
        title={needsRow ?? 'Seçili kaydı sil'}
        className={cn(
          actionClass,
          hasSelection &&
            'border-destructive/40 text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/40',
        )}
      >
        <Trash2 className="size-3.5" />
        Sil
      </button>
      <button
        type="button"
        onClick={onInspect}
        disabled={!hasSelection}
        title={needsRow ?? 'Seçili kaydı incele'}
        className={actionClass}
      >
        <Eye className="size-3.5" />
        İncele
      </button>
      <button
        type="button"
        onClick={onCopy}
        disabled={!hasSelection}
        title={needsRow ?? 'Seçili kaydı kopyala'}
        className={actionClass}
      >
        <Copy className="size-3.5" />
        Kopya
      </button>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <button
        type="button"
        onClick={onToggleSearch}
        aria-expanded={searchOpen}
        title={searchOpen ? 'Aramayı kapat' : 'Kayıtlarda ara'}
        className={cn(actionClass, searchOpen && 'bg-accent text-accent-foreground')}
      >
        {searchOpen ? <X className="size-3.5" /> : <Search className="size-3.5" />}
        Ara
      </button>

      {searchOpen ? (
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="ERP kayıtlarında ara"
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[12px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>
      ) : (
        <span className="ml-auto text-[12px] font-medium text-muted-foreground">
          {resultCount} kayıt
        </span>
      )}
    </div>
  )
}

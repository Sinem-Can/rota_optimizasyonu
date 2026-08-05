'use client'

import { AlertTriangle, ArrowUpDown, ChevronRight, FileSearch, Plus, CheckSquare, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner' // YENİ: Şık bildirimler için
import { ErpRecordDialog } from '@/components/erp-record-dialog'
import { GibDocumentDialog } from '@/components/gib-document-dialog'
import { ErpRowDialog, type ErpRowMode } from '@/components/erp-row-dialog'
import { ErpSidebar } from '@/components/erp-sidebar'
import { ErpToolbar } from '@/components/erp-toolbar'
import { NewVehicleDialog } from '@/components/new-vehicle-dialog'
import { Badge } from '@/components/ui/badge'
import { erpStatusMeta } from '@/lib/erp-data'
import { findGibDocument, type GibDocument } from '@/lib/erp-document'
import { erpModules, findView, type ErpCell, type ErpTone } from '@/lib/erp-modules'
import { cn } from '@/lib/utils'
import { NewOrderDialog } from '@/components/new-order-dialog'

/** Serbest metinli pill'ler için ton eşlemesi. */
const toneClass: Record<ErpTone, string> = {
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/25',
  primary: 'bg-primary/10 text-primary border-primary/25',
  neutral: 'bg-muted text-muted-foreground border-border',
}

const toneDot: Record<ErpTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  primary: 'bg-primary',
  neutral: 'bg-muted-foreground',
}

function Pill({ label, tone }: { label: string; tone: ErpTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
        toneClass[tone],
      )}
    >
      <span className={cn('size-1.5 rounded-full', toneDot[tone])} aria-hidden="true" />
      {label}
    </span>
  )
}

/** Jenerik hücre render'ı; tüm modüller aynı görsel dili paylaşır. */
function Cell({ cell }: { cell: ErpCell }) {
  switch (cell.t) {
    case 'code':
      return (
        <>
          <p className="whitespace-nowrap font-mono text-[13px] font-bold tracking-wide text-foreground">
            {cell.v}
          </p>
          {cell.sub ? (
            <p className="font-mono text-[11px] text-muted-foreground">{cell.sub}</p>
          ) : null}
        </>
      )
    case 'text':
      return (
        <>
          <p
            className={cn(
              'max-w-[260px] truncate text-[13px] text-foreground',
              cell.strong ? 'font-medium' : '',
            )}
            title={cell.v}
          >
            {cell.v}
          </p>
          {cell.sub ? (
            <p className="max-w-[260px] truncate text-[12px] text-muted-foreground" title={cell.sub}>
              {cell.sub}
            </p>
          ) : null}
        </>
      )
    case 'badge':
      return (
        <Badge variant={cell.variant ?? 'secondary'} className="whitespace-nowrap font-medium">
          {cell.v}
        </Badge>
      )
    case 'money':
      return (
        <>
          <span
            className={cn(
              'whitespace-nowrap font-mono text-[13px] font-semibold',
              cell.signed
                ? cell.v < 0
                  ? 'text-destructive'
                  : 'text-success'
                : 'text-foreground',
            )}
          >
            {cell.v.toLocaleString('tr-TR')} ₺
          </span>
          {cell.sub ? <p className="text-[11px] text-muted-foreground">{cell.sub}</p> : null}
        </>
      )
    case 'num':
      return (
        <>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'whitespace-nowrap font-mono text-[13px] font-semibold',
                cell.alert ? 'text-destructive' : 'text-foreground',
              )}
            >
              {cell.v.toLocaleString('tr-TR')}
              {cell.unit ? (
                <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                  {cell.unit}
                </span>
              ) : null}
            </span>
            {cell.alert ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="size-2.5" />
                {cell.alertLabel ?? 'Kritik'}
              </span>
            ) : null}
          </div>
          {cell.sub ? (
            <p className="font-mono text-[11px] text-muted-foreground">{cell.sub}</p>
          ) : null}
        </>
      )
    case 'status': {
      const meta = erpStatusMeta[cell.v]
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
            meta.className,
          )}
        >
          <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden="true" />
          {cell.v}
        </span>
      )
    }
    case 'tone':
      return <Pill label={cell.v} tone={cell.tone} />
    case 'progress':
      return (
        <div className="w-32">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[13px] font-semibold text-foreground">%{cell.pct}</span>
            <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
              {cell.label}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary" role="presentation">
            <div
              className={cn(
                'h-full rounded-full',
                cell.pct >= 90 ? 'bg-destructive' : cell.pct >= 70 ? 'bg-warning' : 'bg-success',
              )}
              style={{ width: `${cell.pct}%` }}
            />
          </div>
        </div>
      )
  }
}

export function ErpPanel() {
  const [activeViewKey, setActiveViewKey] = useState(erpModules[0].views[0].key)
  const [collapsed, setCollapsed] = useState(false)
  const [openModules, setOpenModules] = useState<string[]>([erpModules[0].key])
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rowMode, setRowMode] = useState<ErpRowMode | null>(null)
  
  // Toplu işlemler için seçilen satırların ID'lerini tutan state
  const [selectedIdsForBatch, setSelectedIdsForBatch] = useState<string[]>([])
  // Backend'e istek atılırken butonun dönmesini sağlayacak state
  const [isSending, setIsSending] = useState(false)
  
  /** Açık GİB matbu evrak önizlemesi (e-İrsaliye / e-Fatura). */
  const [gibDoc, setGibDoc] = useState<GibDocument | null>(null)
  /** UI mock: silinen kayıtlar yalnızca istemci tarafında gizlenir. */
  const [deletedIds, setDeletedIds] = useState<string[]>([])

  const { module, view } = findView(activeViewKey)

  // 3. ADIM: GERÇEKÇİ BACKEND FONKSİYONU (Buraya eklendi)
async function handleSendToRoutePool() {
    setIsSending(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5099'
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Seçtiğimiz siparişlerin ID listesini (Array) backend'e JSON olarak yolluyoruz
        body: JSON.stringify({ siparisIds: selectedIdsForBatch }),
      })

      // Backend'den 200 OK (Başarılı) yanıtı gelmezse hata fırlat
      if (!response.ok) {
        throw new Error(`HTTP Hata! Durum kodu: ${response.status}`)
      }

      // Backend başarılı yanıt dönerse:
      toast.success(`${selectedIdsForBatch.length} adet sipariş Rota Havuzuna aktarıldı!`)
      setSelectedIdsForBatch([]) // İşlem bitince seçimleri temizle

    } catch (error) {
      console.error("Backend bağlantı hatası:", error)
      toast.error("Siparişler gönderilirken backend'de bir hata oluştu! API adresini ve backend'in çalıştığını kontrol et.")
    } finally {
      setIsSending(false)
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    return view.rows.filter(
      (r) =>
        !deletedIds.includes(r.id) &&
        (q.length === 0 || r.search.toLocaleLowerCase('tr-TR').includes(q)),
    )
  }, [view, query, deletedIds])

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null

  /** Görünüm değişince arama ve seçim sıfırlanır. */
  function handleSelectView(key: string) {
    setActiveViewKey(key)
    setQuery('')
    setSearchOpen(false)
    setSelectedId(null)
    setSelectedIdsForBatch([]) // Sekme değişince eski seçimleri temizle
    const owner = erpModules.find((m) => m.views.some((v) => v.key === key))
    if (owner && !openModules.includes(owner.key)) {
      setOpenModules((prev) => [...prev, owner.key])
    }
  }

  function toggleModule(key: string) {
    setOpenModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  // '+ Yeni' aksiyonu
  const newTriggerClass =
    'flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'

  const newAction =
    view.dialog === 'arac' ? (
      <NewVehicleDialog triggerLabel="Yeni" triggerClassName={newTriggerClass} />
    ) : view.dialog === 'siparis' ? (
      <NewOrderDialog triggerLabel="Yeni" triggerClassName={newTriggerClass} /> 
    ) : view.dialog ? (
      <ErpRecordDialog
        kind={view.dialog}
        triggerLabel="Yeni"
        triggerClassName={newTriggerClass}
      />
    ) : (
      <button type="button" onClick={() => setRowMode('new')} className={newTriggerClass}>
        <Plus className="size-4" />
        Yeni
      </button>
    )

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <ErpSidebar
        activeViewKey={activeViewKey}
        onSelectView={handleSelectView}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        openModules={openModules}
        onToggleModule={toggleModule}
      />

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Breadcrumb başlığı */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5">
          <module.icon className="size-4 shrink-0 text-muted-foreground" />
          <nav aria-label="Konum" className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[12px] font-medium text-muted-foreground">
              {module.label}
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            <h1 className="truncate text-[14px] font-semibold tracking-tight text-foreground">
              {view.label}
            </h1>
          </nav>
          {selectedRow ? (
            <span className="ml-auto whitespace-nowrap rounded border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-semibold text-secondary-foreground">
              Seçili: {selectedRow.id}
            </span>
          ) : null}
        </div>

        {/* 4. ADIM: GÜNCELLENEN BUTON BAR'I */}
        {view.selectable && selectedIdsForBatch.length > 0 && (
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-primary/5 px-4 py-2.5">
            <span className="text-[13px] font-medium text-primary">
              {selectedIdsForBatch.length} adet {view.recordName.toLowerCase()} seçildi
            </span>
            <button
              onClick={handleSendToRoutePool}
              disabled={isSending}
              className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckSquare className="size-4" />
              )}
              {isSending ? 'Gönderiliyor...' : (view.batchActionLabel || 'Seçilenleri Gönder')}
            </button>
          </div>
        )}

        <ErpToolbar
          newAction={newAction}
          hasSelection={selectedRow !== null}
          onEdit={() => setRowMode('edit')}
          onDelete={() => setRowMode('delete')}
          onInspect={() => setRowMode('inspect')}
          onCopy={() => setRowMode('new')}
          searchOpen={searchOpen}
          onToggleSearch={() => {
            setSearchOpen((s) => {
              if (s) setQuery('')
              return !s
            })
          }}
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={view.searchPlaceholder}
          resultCount={rows.length}
        />

        {/* Veri tablosu */}
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {/* En sola Checkbox sütun başlığı */}
                  {view.selectable && (
                    <th scope="col" className="w-12 px-4 py-3 align-middle">
                      <input 
                        type="checkbox"
                        className="size-3.5 cursor-pointer rounded border-border"
                        checked={rows.length > 0 && selectedIdsForBatch.length === rows.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIdsForBatch(rows.map(r => r.id)) // Hepsini seç
                          } else {
                            setSelectedIdsForBatch([]) // Hiçbirini seçme
                          }
                        }}
                      />
                    </th>
                  )}
                  {view.columns.map((col, i) => {
                    const isActionCol =
                      view.docAction !== undefined && i === view.columns.length - 1
                    return (
                      <th
                        key={col}
                        scope="col"
                        className={cn(
                          'whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                          isActionCol ? 'text-right' : '',
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col}
                          {isActionCol ? null : <ArrowUpDown className="size-3 opacity-40" />}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const active = row.id === selectedId
                  const isChecked = selectedIdsForBatch.includes(row.id)

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(active ? null : row.id)}
                      onDoubleClick={() => {
                        setSelectedId(row.id)
                        setRowMode('inspect')
                      }}
                      aria-selected={active}
                      className={cn(
                        'cursor-pointer border-b border-border transition-colors last:border-0',
                        active ? 'bg-accent/60' : isChecked ? 'bg-primary/5' : 'hover:bg-secondary/50',
                      )}
                    >
                      {/* Satırın en başına checkbox */}
                      {view.selectable && (
                        <td className="w-12 px-4 py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            className="size-3.5 cursor-pointer rounded border-border"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedIdsForBatch(prev => 
                                prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]
                              )
                            }}
                          />
                        </td>
                      )}
                      
                      {row.cells.map((cell, i) => (
                        <td key={`${row.id}-${i}`} className="px-4 py-3 align-middle">
                          <Cell cell={cell} />
                        </td>
                      ))}
                      {view.docAction ? (
                        <td className="px-4 py-3 text-right align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setGibDoc(findGibDocument(row.id))
                            }}
                            title={`${row.id} belgesini görüntüle / indir`}
                            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <FileSearch className="size-3.5 text-muted-foreground" />
                            Görüntüle/İndir
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={view.columns.length + (view.selectable ? 1 : 0)}
                      className="px-4 py-12 text-center text-[13px] text-muted-foreground"
                    >
                      Aramanızla eşleşen kayıt bulunamadı.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ErpRowDialog
        mode={rowMode}
        onClose={() => setRowMode(null)}
        onConfirmDelete={() => {
          if (selectedRow) setDeletedIds((prev) => [...prev, selectedRow.id])
          setSelectedId(null)
          setRowMode(null)
        }}
        columns={view.columns}
        row={rowMode === 'new' && !selectedRow ? null : selectedRow}
        recordName={view.recordName}
      />

      <GibDocumentDialog doc={gibDoc} onClose={() => setGibDoc(null)} />
    </div>
  )
}

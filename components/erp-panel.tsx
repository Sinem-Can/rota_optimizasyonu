'use client'

import { AlertTriangle, ArrowUpDown, ChevronRight, FileSearch, CheckSquare, Loader2 } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { GibDocumentDialog } from '@/components/gib-document-dialog'
import { ErpSidebar } from '@/components/erp-sidebar'
import { ErpToolbar } from '@/components/erp-toolbar'
import { Badge } from '@/components/ui/badge'
import { erpStatusMeta } from '@/lib/erp-data'
import { findGibDocument, type GibDocument } from '@/lib/erp-document'
import { erpModules, findView, type ErpCell, type ErpTone, type ErpRow } from '@/lib/erp-modules'
import { cn } from '@/lib/utils'

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
              'max-w-[320px] text-[13px] text-foreground whitespace-normal break-words',
              cell.strong ? 'font-medium' : '',
            )}
            title={cell.v}
          >
            {cell.v}
          </p>
          {cell.sub ? (
            <p className="max-w-[320px] text-[12px] text-muted-foreground whitespace-normal break-words" title={cell.sub}>
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
  
  // Toplu işlemler için seçilen satırların ID'lerini tutan state
  const [selectedIdsForBatch, setSelectedIdsForBatch] = useState<string[]>([])
  // Backend'e istek atılırken butonun dönmesini sağlayacak state
  const [isSending, setIsSending] = useState(false)
  
  /** Açık GİB matbu evrak önizlemesi (e-İrsaliye / e-Fatura). */
  const [gibDoc, setGibDoc] = useState<GibDocument | null>(null)

  const { module, view } = findView(activeViewKey)

  // 3. ADIM: GERÇEKÇİ BACKEND FONKSİYONU
  async function handleSendToRoutePool() {
    setIsSending(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'
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

  const [dbCariRows, setDbCariRows] = useState<ErpRow[]>([])
  const [dbAdresRows, setDbAdresRows] = useState<ErpRow[]>([])
  const [dbAracRows, setDbAracRows] = useState<ErpRow[]>([])
  const [dbStokRows, setDbStokRows] = useState<ErpRow[]>([])
  const [dbDepoRows, setDbDepoRows] = useState<ErpRow[]>([])
  const [dbSiparisRows, setDbSiparisRows] = useState<ErpRow[]>([])
  
  const [dbIrsaliyeRows, setDbIrsaliyeRows] = useState<ErpRow[]>([])
  const [dbFaturaRows, setDbFaturaRows] = useState<ErpRow[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'
        const s = (...parts: (string | number)[]) => parts.join(' ')
        
        // Fetch Cari
        const cariRes = await fetch(`${apiUrl}/api/erp/cari`, { cache: 'no-store' })
        if (cariRes.ok) {
          const data = await cariRes.json()
          const cariMapped = data.map((a: any) => ({
            id: a.id,
            search: s(a.code, a.name, a.type, a.id),
            cells: [
              { t: 'code', v: a.code, sub: a.id },
              { t: 'text', v: a.name, strong: true },
              { t: 'badge', v: a.type, variant: 'outline' },
            ],
          }))
          setDbCariRows(cariMapped)
          
          const adresMapped = data.map((c: any) => ({
            id: c.id,
            search: s(c.id, c.name, c.address),
            cells: [
              { t: 'code', v: c.id },
              { t: 'text', v: c.name, sub: c.address, strong: true },
              { t: 'code', v: `${c.windowStart} – ${c.windowEnd}` }, 
              { t: 'num', v: c.avgVolumeM3, unit: 'm³' },
            ],
          }))
          setDbAdresRows(adresMapped)
        }

        // Fetch Araclar
        const aracRes = await fetch(`${apiUrl}/api/erp/araclar`, { cache: 'no-store' })
        if (aracRes.ok) {
          const data = await aracRes.json()
          const aracMapped = data.map((v: any) => ({
            id: v.id,
            search: s(v.id, v.plate, v.driver, v.type, v.depot, v.features),
            cells: [
              { t: 'code', v: v.id },
              { t: 'text', v: v.plate, sub: v.driver, strong: true },
              { t: 'badge', v: v.type, variant: 'outline' },
              { t: 'badge', v: v.depot, variant: 'secondary' },
              {
                t: 'num',
                v: v.capacityKg,
                unit: 'kg',
                sub: `${v.volumeM3} m³ · donanım yok`,
              },
            ],
          }))
          setDbAracRows(aracMapped)
        }

        // Fetch Stoklar
        const stokRes = await fetch(`${apiUrl}/api/erp/stoklar`, { cache: 'no-store' })
        if (stokRes.ok) {
          const data = await stokRes.json()
          const stokMapped = data.map((i: any) => ({
            id: i.id,
            search: s(i.code, i.name, i.category, i.warehouse, i.unit, i.id),
            cells: [
              { t: 'code', v: i.code, sub: i.id },
              { t: 'text', v: i.name, strong: true },
              { t: 'badge', v: i.category, variant: 'secondary' },
              { t: 'text', v: i.unit },
              { t: 'num', v: i.weightKg ?? 0, unit: 'kg' },
              { t: 'num', v: i.volumeM3 ?? 0, unit: 'm³' },
              {
                t: 'num',
                v: i.quantity,
                sub: `eşik: ${i.criticalLevel.toLocaleString('tr-TR')} ${i.unit}`,
                alert: i.quantity < i.criticalLevel,
                alertLabel: 'Kritik',
              },
              { t: 'text', v: i.warehouse },
            ],
          }))
          setDbStokRows(stokMapped)
        }

        // Fetch Depolar
        const depoRes = await fetch(`${apiUrl}/api/erp/depolar`, { cache: 'no-store' })
        if (depoRes.ok) {
          const data = await depoRes.json()
          const depoMapped = data.map((w: any) => ({
            id: w.id,
            search: s(w.code, w.name, w.district, w.address, w.id),
            cells: [
              { t: 'code', v: w.code, sub: w.id },
              { t: 'text', v: w.name, sub: w.address, strong: true },
              { t: 'badge', v: w.district, variant: 'secondary' },
            ],
          }))
          setDbDepoRows(depoMapped)
        }

        // Fetch Siparisler
        const siparisRes = await fetch(`${apiUrl}/api/erp/siparisler`, { cache: 'no-store' })
        if (siparisRes.ok) {
          const data = await siparisRes.json()
          const siparisMapped = data.map((o: any) => ({
            id: o.id,
            search: s(o.id, o.offerId, o.cariName, o.vehiclePlate, o.status, ...(o.lines || []).map((l:any) => l.stockName)),
            cells: [
              { t: 'code', v: o.id, sub: `Teklif: ${o.offerId}` },
              { t: 'text', v: o.cariName, sub: o.cariCode, strong: true },
              { 
                t: 'text', 
                v: (o.lines || []).map((l:any) => `${l.quantity}x ${l.stockName}`).join(', '), 
                sub: (o.lines || []).map((l:any) => l.stockCode).join(', ') 
              },
              { t: 'text', v: o.vehicleCode, sub: o.vehiclePlate },
              { t: 'num', v: o.totalKg, unit: 'kg', sub: `${o.totalM3} m³` },
              { t: 'code', v: `${o.windowStart} - ${o.windowEnd}` },
            ],
          }))
          setDbSiparisRows(siparisMapped)

          const irsRes = await fetch(`${apiUrl}/api/erp/liste`, { cache: 'no-store' })
          if (irsRes.ok) {
            const data = await irsRes.json()
            
            console.log("C#'tan gelen ham veri:", data);

            // 1. İRSALİYELER İÇİN MAPPING - SADECE TİRELİ OLANLARI (YENİLERİ) AL
            const irsaliyeMapped = data
              .filter((i: any) => i.irsaliyeNo && i.irsaliyeNo.includes('-'))
              .map((i: any) => {
                
                let kalemSayisi = 0;
                try {
                  let parsedLines = [];
                  const jsonStr = i.kalemlerJson || i.KalemlerJson || "[]";
                  parsedLines = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
                  if (typeof parsedLines === 'string') {
                    parsedLines = JSON.parse(parsedLines);
                  }
                  if (Array.isArray(parsedLines)) {
                    kalemSayisi = parsedLines.length;
                  }
                } catch (err) {
                  console.error("Kalem sayısı hesaplanırken hata:", err);
                }

                return {
                  id: i.irsaliyeNo,
                  search: (i.irsaliyeNo || "") + " " + (i.cariAdi || "") + " " + (i.cikisDeposu || "") + " " + (i.aracPlaka || ""),
                  cells: [
                    { t: 'code', v: i.irsaliyeNo, sub: i.faturaNo && i.faturaNo !== 'FTR-BEKLEYEN' ? i.faturaNo : '' }, 
                    { t: 'text', v: i.cariAdi || 'Genel Müşteri', strong: true },                        
                    { t: 'text', v: '07.08.2026' }, 
                    { t: 'badge', v: i.aracPlaka || '-', variant: 'outline' },                            
                    { t: 'num', v: kalemSayisi, unit: 'Adet' }, 
                    { t: 'badge', v: i.durum || 'Planlandı', variant: 'secondary' }                      
                  ],
                  rawData: i 
                }
              })
            setDbIrsaliyeRows(irsaliyeMapped)

            // 2. FATURALAR İÇİN MAPPING - SADECE TİRELİ OLANLARI (YENİLERİ) AL
            const faturaMapped = data
              .filter((i: any) => i.faturaNo && !i.faturaNo.toUpperCase().includes('BEKLEYEN') && i.faturaNo.includes('-'))
              .map((i: any) => ({
                id: i.faturaNo,
                search: s(i.faturaNo, i.irsaliyeNo, i.cariAdi, i.cikisDeposu, i.aracPlaka),
                cells: [
                  { t: 'code', v: i.faturaNo, sub: i.irsaliyeNo },                                     
                  { t: 'text', v: i.cariAdi || 'Genel Müşteri', strong: true },                        
                  { t: 'text', v: '07.08.2026' }, 
                  { t: 'badge', v: 'e-Fatura', variant: 'secondary' },                                  
                  { t: 'money', v: i.tutar || 0 },                                                     
                  { t: 'text', v: i.odemeTuru || 'Banka Transferi' } 
                ],
                rawData: i 
              }))
            setDbFaturaRows(faturaMapped)
          }
        }
      } catch (err) {
        console.error("Data fetch error", err)
      }
    }
    fetchData()
  }, [])

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR')
    let sourceRows = view.rows
    if (activeViewKey === 'cari-kartlari') sourceRows = dbCariRows
    if (activeViewKey === 'musteri-adresleri') sourceRows = dbAdresRows
    if (activeViewKey === 'arac-kartlari') sourceRows = dbAracRows
    if (activeViewKey === 'stok-kartlari') sourceRows = dbStokRows
    if (activeViewKey === 'depolar') sourceRows = dbDepoRows
    if (activeViewKey === 'siparisler') sourceRows = dbSiparisRows
    if (activeViewKey === 'irsaliyeler') sourceRows = dbIrsaliyeRows
    if (activeViewKey === 'faturalar') sourceRows = dbFaturaRows 

    return sourceRows.filter(
      (r) => q.length === 0 || r.search.toLocaleLowerCase('tr-TR').includes(q),
    )
  }, [view, query, activeViewKey, dbCariRows, dbAdresRows, dbAracRows, dbStokRows, dbDepoRows, dbSiparisRows, dbIrsaliyeRows, dbFaturaRows])

  const selectedRow = rows.find((r) => r.id === selectedId) ?? null

  /** Görünüm değişince arama ve seçim sıfırlanır. */
  function handleSelectView(key: string) {
    setActiveViewKey(key)
    setQuery('')
    setSearchOpen(false)
    setSelectedId(null)
    setSelectedIdsForBatch([]) 
    const owner = erpModules.find((m) => m.views.some((v) => v.key === key))
    if (owner && !openModules.includes(owner.key)) {
      setOpenModules((prev) => [...prev, owner.key])
    }
  }

  function toggleModule(key: string) {
    setOpenModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background">
      <ErpSidebar
        activeViewKey={activeViewKey}
        onSelectView={handleSelectView}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        openModules={openModules}
        onToggleModule={toggleModule}
        counts={{
          'cari-kartlari': dbCariRows.length,
          'musteri-adresleri': dbAdresRows.length,
          'arac-kartlari': dbAracRows.length,
          'stok-kartlari': dbStokRows.length,
          'depolar': dbDepoRows.length,
          'siparisler': dbSiparisRows.length,
          'irsaliyeler': dbIrsaliyeRows.length, // YENİ: Gerçek sayı eklendi!
          'faturalar': dbFaturaRows.length,     // YENİ: Gerçek sayı eklendi!
        }}
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
                              
                              const raw = (row as any).rawData || {};
                              const isFatura = row.id.startsWith('FTR');
                              const today = new Date().toLocaleDateString('tr-TR');
                              const time = new Date().toLocaleTimeString('tr-TR');

                              // 1. ADIM: GERÇEK ÜRÜNLERİ JSON'DAN ÇÖZME
                              let parsedLines = [];
                              try {
                                // C#'tan gelen JSON string'i JavaScript dizisine çeviriyoruz
                                parsedLines = raw.kalemlerJson ? JSON.parse(raw.kalemlerJson) : [];
                              } catch (err) {
                                console.error("JSON parse hatası:", err);
                              }

                              const productLines = parsedLines.length > 0 ? parsedLines : [
                                // Eğer veritabanından veri gelmezse çökmemesi için boş/test yedeği
                                { code: 'YOK', name: 'Ürün Bulunamadı', qty: 1, unit: 'Adet', price: 0 }
                              ];

                              // 2. ADIM: FATURA / İRSALİYE AYRIMI (Fiyatları Sıfırlama)
                              const calculatedLines = productLines.map((l: any, index: number) => {
                                const unitPrice = isFatura ? (l.price || 0) : 0;
                                
                                return {
                                  no: index + 1,
                                  code: l.code,
                                  name: l.name,
                                  qty: l.qty,
                                  unit: l.unit || 'Adet',
                                  price: unitPrice,
                                  amount: l.qty * unitPrice
                                };
                              });

                              // 3. ADIM: DİP TOPLAMLARI OTOMATİK BELİRLEME
                              const calculatedSubtotal = calculatedLines.reduce((acc: number, curr: any) => acc + curr.amount, 0);
                              const calculatedVat = calculatedSubtotal * 0.20; // %20 KDV
                              const calculatedTotal = calculatedSubtotal + calculatedVat;

                              // Orijinal "GibDocument" tipine birebir uyumlu veri objesi
                              const dynamicDoc = {
                                title: isFatura ? 'e-FATURA' : 'e-İRSALİYE',
                                no: row.id,
                                date: today,
                                time: time,
                                uuid: 'feb4c0c6-244d-4456-a6b9-38684779c945', 
                                customizationNo: 'TR1.2',
                                scenario: isFatura ? 'TEMELFATURA' : 'TEMELIRSALIYE',
                                kind: isFatura ? 'fatura' : 'irsaliye',
                                docType: 'SATIŞ',
                                
                                sender: {
                                  name: 'UYUMSOFT BİLGİ SİSTEMLERİ VE TEKNOLOJİLERİ A.Ş.',
                                  addressLines: ['YTÜ Teknopark, Teknoloji Geliştirme Bölgesi'],
                                  district: 'Esenler',
                                  city: 'İstanbul',
                                  phone: '0212 555 44 33',
                                  email: 'destek@uyumsoft.com.tr',
                                  web: 'www.uyumsoft.com.tr',
                                  taxOffice: 'BÜYÜKMÜKELLEFLER',
                                  vkn: '8990159422'
                                },
                                
                                receiver: {
                                  name: raw.cariAdi || 'GENEL MÜŞTERİ',
                                  addressLines: [raw.cikisDeposu || 'Merkez Depo'],
                                  district: '-',
                                  city: 'İstanbul',
                                  phone: '-',
                                  email: '-',
                                  web: '',
                                  taxOffice: 'İSTANBUL VD.',
                                  vkn: '1112223344'
                                },
                                
                                // Fatura/İrsaliye ayrımı yapılmış dinamik listeler ve toplamlar
                                lines: calculatedLines,
                                subtotal: calculatedSubtotal,
                                vatRate: 20,
                                vatTotal: calculatedVat,
                                grandTotal: calculatedTotal,
                                
                                relatedDocs: [],
                                
                                carrier: {
                                  company: 'Lojistik A.Ş.',
                                  vkn: '9998887766',
                                  driverName: 'Sistem Üzerinden Atanan Şoför',
                                  driverTckn: '11111111111',
                                  plate: raw.aracPlaka || '34 ABC 123',
                                  vehicleType: 'Kamyon',
                                  dispatchDate: today,
                                  dispatchTime: time
                                }
                              };

                              setGibDoc(dynamicDoc as any);
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

      <GibDocumentDialog doc={gibDoc} onClose={() => setGibDoc(null)} />
    </div>
  )
}
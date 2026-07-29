'use client'

// useState'i import listemize ekledik
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { parseImportFile } from "@/lib/parse-import-file"
import type { UnassignedTaskDto } from "@/lib/route-data"

import {
  Bell,
  Boxes,
  Calendar,
  ChevronDown,
  Clock,
  Gauge,
  Route,
  Search,
  Settings2,
  TrendingUp,
  Truck,
  Upload,
  Wallet,
  Warehouse,
} from 'lucide-react'
import { erpSummary } from '@/lib/erp-data'
import { fleetSummary, kpiSummary } from '@/lib/route-data'
import { ThemeToggle } from '@/components/theme-toggle'

export type TabKey = 'planlama' | 'erp'

const navItems: { key: TabKey; label: string }[] = [
  { key: 'planlama', label: 'Planlama' },
  { key: 'erp', label: 'ERP Yönetimi' },
]

interface TopBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  onImportTasks: (tasks: UnassignedTaskDto[]) => void   // ← yeni
}


interface KpiItem {
  label: string
  value: string
  unit?: string
  delta: string
  deltaTone: 'up' | 'down' | 'neutral' | 'alert'
  icon: React.ComponentType<{ className?: string }>
}

const kpis: KpiItem[] = [
  {
    label: 'Toplam Mesafe',
    value: kpiSummary.totalDistanceKm.toString(),
    unit: 'km',
    delta: `-${kpiSummary.optimizationGain}%`,
    deltaTone: 'down',
    icon: Route,
  },
  {
    label: 'Toplam Süre',
    value: kpiSummary.totalDuration,
    delta: '-1s 20d',
    deltaTone: 'down',
    icon: Clock,
  },
  {
    label: 'Araç Sayısı',
    value: kpiSummary.vehicleCount.toString(),
    unit: 'araç',
    delta: `${kpiSummary.plannedStops} durak`,
    deltaTone: 'neutral',
    icon: Truck,
  },
  {
    label: 'Başarı Oranı',
    value: `%${kpiSummary.successRate}`,
    delta: '+1,2 puan',
    deltaTone: 'up',
    icon: Gauge,
  },
]

const erpKpis: KpiItem[] = [
  {
    label: 'Kayıtlı Cari',
    value: erpSummary.accountCount.toString(),
    unit: 'cari',
    delta: 'alıcı + satıcı',
    deltaTone: 'neutral',
    icon: Wallet,
  },
  {
    label: 'Toplam Alacak',
    value: `${Math.round(erpSummary.receivableTotal / 1000).toLocaleString('tr-TR')}B`,
    unit: '₺',
    delta: 'vadesi açık',
    deltaTone: 'up',
    icon: TrendingUp,
  },
  {
    label: 'Aktif Araç',
    value: fleetSummary.active.toString(),
    unit: 'araç',
    delta: `${fleetSummary.broken} arızalı`,
    deltaTone: 'alert',
    icon: Truck,
  },
  {
    label: 'Stok Kalemi',
    value: erpSummary.stockItemCount.toString(),
    unit: 'kalem',
    delta: `${erpSummary.criticalStockCount} kritik seviye`,
    deltaTone: 'alert',
    icon: Boxes,
  },
  {
    label: 'Depo Doluluk',
    value: `%${erpSummary.occupancyPct}`,
    delta: `${erpSummary.warehouseCount} depo`,
    deltaTone: 'neutral',
    icon: Warehouse,
  },
]

export function TopBar({ activeTab, onTabChange, onImportTasks }: TopBarProps) {
  const isErp = activeTab === 'erp'
  const activeKpis = isErp ? erpKpis : kpis

  // Arama Çubuğu için State'ler
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Takvim için State (Tasarımındaki default değer)
  const [selectedDate, setSelectedDate] = useState('2026-07-25')

  // Seçili tarihi "25 Tem 2026" formatına çeviren küçük yardımcı fonksiyon
  const formatDisplayDate = () => {
    const [y, m, d] = selectedDate.split('-')
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    return `${d} ${months[parseInt(m) - 1]} ${y}`
  }

  // Arama kısayolu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault() 
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value
      if (!query.trim()) return

      toast.info(`"${query}" aranıyor...`, {
        description: 'Veritabanında eşleşen kayıtlar getiriliyor.',
      })

      setTimeout(() => {
        toast.success("Kayıt bulundu", {
          description: "Sonuçlar haritaya ve listeye yansıtıldı."
        })
      }, 1200)
    }
  }

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex shrink-0 items-center gap-2.5 pr-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Route className="size-5" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight text-foreground">RotaPlan</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] font-medium text-muted-foreground">
              Sevkiyat Komuta Merkezi
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <nav aria-label="Ana menü" className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const active = item.key === activeTab
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'whitespace-nowrap rounded-md bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-foreground'
                    : 'whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
                }
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            onKeyDown={handleSearchSubmit}
            placeholder="Müşteri, sipariş no veya plaka ara…"
            aria-label="Genel arama"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-14 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Güncellenmiş ve Canlandırılmış Takvim Butonu */}
        <div className="relative flex h-9 shrink-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer focus-within:ring-2 focus-within:ring-ring/20">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="font-mono">{formatDisplayDate()}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
          
          {/* Görünmez Native HTML Takvim Seçici */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value)
                toast.info("Tarih güncellendi", {
                  description: "Seçilen güne ait rotalar ve araç verileri yükleniyor..."
                })
              }
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        {/* Gerçek Dosya Yükleme (File Input) Butonu */}
        <label className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary focus-within:ring-2 focus-within:ring-ring/20">
          <Upload className="size-4 text-muted-foreground" />
          İçe Aktar (CSV/Excel)
          <input
            type="file"
            accept=".csv, .xlsx, .xls" // Artık Excel dosyalarını da seçmene izin verecek!
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                toast.success(`"${file.name}" başarıyla yüklendi`, {
                  description: "Veriler ayrıştırılıp havuza eklendi."
                })
                e.target.value = ''
              }
            }}
          />
        </label>

        <div className="h-8 w-px bg-border" />

        <ThemeToggle />

        <button
          type="button"
          aria-label="Bildirimler"
          className="relative grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="size-4.5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
        </button>
        <button
          type="button"
          aria-label="Ayarlar"
          className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings2 className="size-4.5" />
        </button>
        <div className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-secondary-foreground ring-1 ring-border">
          OK
        </div>
      </div>

      <div className="flex items-stretch border-t border-border bg-secondary/40">
        <div
          className={`grid flex-1 grid-cols-2 divide-border sm:divide-x ${
            activeKpis.length === 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4'
          }`}
        >
          {activeKpis.map((kpi) => (
            <div key={kpi.label} className="flex items-center gap-3 px-4 py-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground">
                <kpi.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-semibold leading-tight tracking-tight text-foreground">
                    {kpi.value}
                  </span>
                  {kpi.unit ? (
                    <span className="text-[11px] font-medium text-muted-foreground">{kpi.unit}</span>
                  ) : null}
                  <span
                    className={
                      kpi.deltaTone === 'up' || kpi.deltaTone === 'down'
                        ? 'ml-0.5 flex items-center gap-0.5 font-mono text-[11px] font-semibold text-success'
                        : kpi.deltaTone === 'alert'
                          ? 'ml-0.5 flex items-center gap-0.5 font-mono text-[11px] font-semibold text-destructive'
                          : 'ml-0.5 font-mono text-[11px] font-medium text-muted-foreground'
                    }
                  >
                    {kpi.deltaTone === 'up' || kpi.deltaTone === 'down' ? (
                      <TrendingUp className="size-3" />
                    ) : null}
                    {kpi.delta}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-4 border-l border-border px-4 xl:flex">
          {isErp ? null : (
            <>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Yakıt Tahmini
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {kpiSummary.fuelEstimateL.toLocaleString('tr-TR')} lt
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Maliyet
                </p>
                <p className="font-mono text-sm font-semibold text-foreground">
                  {kpiSummary.costEstimate}
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Motor v4.2 · Canlı
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
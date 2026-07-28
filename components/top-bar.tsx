'use client'

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

// Filo, Müşteriler ve Raporlar artık ERP Yönetimi modülleri altında yer alıyor.
export type TabKey = 'planlama' | 'erp'

const navItems: { key: TabKey; label: string }[] = [
  { key: 'planlama', label: 'Planlama' },
  { key: 'erp', label: 'ERP Yönetimi' },
]

interface TopBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
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

// ERP sekmesi için ana veri (cari/filo/stok/depo) odaklı metrikler.
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

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const isErp = activeTab === 'erp'
  const activeKpis = isErp ? erpKpis : kpis

  return (
    <header className="shrink-0 border-b border-border bg-card">
      {/* Üst navigasyon */}
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Logo alanı */}
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

        {/* Arama çubuğu */}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Müşteri, sipariş no veya plaka ara…"
            aria-label="Genel arama"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-14 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Tarih seçici */}
        <button
          type="button"
          className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Calendar className="size-4 text-muted-foreground" />
          <span className="font-mono">25 Tem 2026</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>

        {/* İçe aktar (ikincil buton) */}
        <button
          type="button"
          className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-input bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Upload className="size-4 text-muted-foreground" />
          İçe Aktar (CSV)
        </button>

        <div className="h-8 w-px bg-border" />

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

      {/* KPI özet çubuğu */}
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

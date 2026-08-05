'use client'

import { toast } from 'sonner'
import type { DriverDto } from "@/lib/route-data"

import {
  Boxes,
  Clock,
  Fuel,
  Route,
  Search,
  TrendingUp,
  Truck,
  Wallet,
  Warehouse,
} from 'lucide-react'
// YENİ: Bütün özet bilgilerimizi artık erp-data.ts içindeki erpSummary'den alıyoruz!
import { erpSummary } from '@/lib/erp-data'
import { ThemeToggle } from '@/components/theme-toggle'

export type TabKey = 'planlama' | 'erp'

const navItems: { key: TabKey; label: string }[] = [
  { key: 'planlama', label: 'Planlama' },
  { key: 'erp', label: 'ERP Yönetimi' },
]

interface TopBarProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  drivers: DriverDto[]
  onSearch?: (query: string) => void
}

interface KpiItem {
  label: string
  value: string
  unit?: string
  icon: React.ComponentType<{ className?: string }>
}

export function TopBar({ activeTab, onTabChange, drivers, onSearch }: TopBarProps) {
  const isErp = activeTab === 'erp'

  // --- DİNAMİK HESAPLAMALAR (PLANLAMA EKRANI İÇİN) ---
  const activeVehicleCount = drivers.length
  
  const totalDistance = drivers.reduce((sum, driver) => sum + driver.totalDistanceKm, 0)
  
  const totalMinutes = drivers.reduce((sum, driver) => sum + driver.totalDurationMin, 0)
  
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}s ${mins}d`
  }
  
  const estimatedFuel = Math.round((totalDistance / 100) * 12)

  // --- KPI KARTLARI ---
  const kpis: KpiItem[] = [
    {
      label: 'Toplam Mesafe',
      value: totalDistance.toString(),
      unit: 'km',
      icon: Route,
    },
    {
      label: 'Toplam Süre',
      value: formatDuration(totalMinutes),
      icon: Clock,
    },
    {
      label: 'Araç Sayısı',
      value: activeVehicleCount.toString(),
      unit: 'araç',
      icon: Truck,
    },
    {
      label: 'Yakıt Tahmini',
      value: estimatedFuel.toLocaleString('tr-TR'),
      unit: 'lt',
      icon: Fuel,
    },
    {
      label: 'Maliyet',
      value: (estimatedFuel * 42.5).toLocaleString('tr-TR'),
      unit: '₺',
      icon: Wallet,
    },
  ]

  const erpKpis: KpiItem[] = [
    {
      label: 'Kayıtlı Cari',
      value: erpSummary.accountCount.toString(),
      unit: 'cari',
      icon: Wallet,
    },
    {
      label: 'Toplam Alacak',
      value: `${Math.round(erpSummary.receivableTotal / 1000).toLocaleString('tr-TR')}B`,
      unit: '₺',
      icon: TrendingUp,
    },
    {
      label: 'Aktif Araç',
      // YENİ: Excel tablomuzla eşitlediğimiz erpSummary verilerini kullanıyoruz
      value: erpSummary.activeVehicleCount.toString(),
      unit: 'araç',
      icon: Truck,
    },
    {
      label: 'Stok Kalemi',
      value: erpSummary.stockItemCount.toString(),
      unit: 'kalem',
      icon: Boxes,
    },
    {
      label: 'Depo Doluluk',
      value: `%${erpSummary.occupancyPct}`,
      icon: Warehouse,
    },
  ]

  const activeKpis = isErp ? erpKpis : kpis

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      toast.info(`"${e.currentTarget.value}" arandı`, {
        description: 'Sonuçlar listeye yansıtıldı.',
      })
    }
  }

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex h-14 items-center gap-3 px-4">
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
            type="search"
            onChange={(e) => onSearch?.(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Müşteri, sipariş no veya plaka ara…"
            aria-label="Genel arama"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <ThemeToggle />

      </div>

    </header>
  )
}

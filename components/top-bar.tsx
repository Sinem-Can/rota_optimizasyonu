'use client'

import { useEffect, useState } from 'react'
import type { DriverDto } from "@/lib/route-data"

import {
  Boxes,
  Clock,
  Download,
  Fuel,
  Route,
  Search,
  TrendingUp,
  Truck,
  Wallet,
  Warehouse,
  X,
} from 'lucide-react'
// YENİ: Bütün özet bilgilerimizi artık erp-data.ts içindeki erpSummary'den alıyoruz!
import { erpSummary } from '@/lib/erp-data'
import { ThemeToggle } from '@/components/theme-toggle'
import { exportToPdf } from '@/lib/route-export'

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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsSearchExpanded(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

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

        <div className="ml-auto flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
          {!isErp ? <span className="hidden lg:inline">İstanbul · Avrupa/Anadolu</span> : null}
          {!isErp ? (
            <button
              type="button"
              onClick={() => exportToPdf(drivers)}
              disabled={drivers.length === 0}
              aria-label="Rota planını PDF olarak dışa aktar"
              title="Rota planını PDF olarak indir"
              className="grid size-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="size-4" />
            </button>
          ) : null}
          <div className={`flex h-9 items-center overflow-hidden rounded-md border border-border bg-secondary/50 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-ring/30 ${isSearchExpanded ? 'w-72' : 'w-9'}`}>
            {isSearchExpanded ? (
              <>
                <Search className="ml-2.5 size-4 shrink-0 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={searchValue}
                  onChange={(event) => {
                    setSearchValue(event.target.value)
                    onSearch?.(event.target.value)
                  }}
                  placeholder="Müşteri, sipariş no veya plaka ara..."
                  aria-label="Genel arama"
                  className="h-full min-w-0 flex-1 bg-transparent px-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('')
                    onSearch?.('')
                    setIsSearchExpanded(false)
                  }}
                  aria-label="Aramayı temizle ve kapat"
                  title="Kapat"
                  className="mr-1 grid size-7 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setIsSearchExpanded(true)} aria-label="Ara" title="Ara (⌘K)" className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Search className="size-4" />
              </button>
            )}
          </div>
        </div>

        <ThemeToggle />

      </div>
    </header>
  )
}

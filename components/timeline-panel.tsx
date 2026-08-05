'use client'

import { useState, useEffect } from 'react'
import { ChevronsUpDown, Clock, TriangleAlert, ZoomIn } from 'lucide-react'
import { driverTheme, toMinutes, type StopDto, type DriverDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TimelinePanelProps {
  selectedStopId: string | null
  onSelectStop: (stop: StopDto, driverId: string) => void
  drivers: DriverDto[]
}

const DAY_START = 8 * 60 // 08:00
const DAY_END = 19 * 60 // 19:00
const SPAN = DAY_END - DAY_START

const pct = (minutes: number) => ((minutes - DAY_START) / SPAN) * 100

const hourTicks = Array.from(
  { length: (DAY_END - DAY_START) / 60 + 1 },
  (_, i) => DAY_START + i * 60,
)

export function TimelinePanel({ selectedStopId, onSelectStop, drivers }: TimelinePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 1. DİNAMİK SAAT: Gerçek sistem saatini alıp her dakika güncelliyoruz
  const [nowMinutes, setNowMinutes] = useState(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNowMinutes(now.getHours() * 60 + now.getMinutes())
    }, 60000) // Her dakika tetiklenir
    return () => clearInterval(interval)
  }, [])

  // Dakikayı "11:21" gibi şık bir HH:MM formatına çeviren yardımcı metot
  const formattedTime = `${String(Math.floor(nowMinutes / 60)).padStart(2, '0')}:${String(nowMinutes % 60).padStart(2, '0')}`

  // 2. DİNAMİK RİSK SAYACI: Tüm sürücülerin duraklarını tarayıp risk statüsünde olanları topluyoruz
  const riskCount = drivers.reduce((total, driver) => {
    return total + driver.stops.filter((stop) => stop.status === 'risk').length
  }, 0)

  return (
    <section
      aria-label="Sürücü zaman çizelgesi"
      className={cn(
        'flex shrink-0 flex-col border-t border-border bg-card transition-[height] duration-200',
        isExpanded ? 'h-[300px]' : 'h-[150px]',
      )}
    >
      {/* Başlık çubuğu */}
      <div className="flex h-8 shrink-0 items-center gap-3 border-b border-border px-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          Zaman Çizelgesi · Vardiya Planı
        </p>
        
        {/* Sadece risk varsa bu butonu göster */}
        {riskCount > 0 && (
          <span className="flex items-center gap-1 rounded border border-destructive/25 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
            <TriangleAlert className="size-2.5" />
            {riskCount} Gecikme Riski
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden font-mono text-[10px] font-medium text-muted-foreground sm:inline">
            Şu an {formattedTime}
          </span>
          <button
            type="button"
            aria-label="Zaman aralığını yakınlaştır"
            className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Paneli küçült' : 'Paneli genişlet'}
            title={isExpanded ? 'Paneli küçült' : 'Tüm sürücüleri göster'}
            className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronsUpDown className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Saat başlıkları */}
      <div className="flex h-5 shrink-0 items-stretch border-b border-border bg-secondary/40">
        <div className="w-28 shrink-0 border-r border-border px-2 text-[10px] font-semibold leading-5 text-muted-foreground">
          Sürücü
        </div>
        <div className="relative flex-1 pr-3">
          <div className="relative h-full">
            {hourTicks.map((tick) => (
              <span
                key={tick}
                className="absolute top-0 -translate-x-1/2 font-mono text-[9px] font-medium leading-5 text-muted-foreground"
                style={{ left: `${pct(tick)}%` }}
              >
                {String(Math.floor(tick / 60)).padStart(2, '0')}
              </span>
            ))}
            
            {/* Dinamik Saat İkonu */}
            <span
              className="absolute top-0 -translate-x-1/2 rounded bg-destructive px-1 font-mono text-[9px] font-bold leading-5 text-primary-foreground transition-all duration-1000"
              style={{ left: `${pct(nowMinutes)}%` }}
            >
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* Satırlar */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {drivers.map((driver) => {
          const theme = driverTheme[driver.colorKey]
          return (
            <div
              key={driver.id}
              className="flex items-stretch border-b border-border/60 last:border-b-0"
            >
              <div className="flex w-28 shrink-0 items-center gap-1.5 border-r border-border px-2 py-1">
                <span className={cn('h-5 w-1 shrink-0 rounded-full', theme.solid)} />
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-semibold text-foreground">
                    {driver.label}
                  </span>
                  <span className="block font-mono text-[9px] text-muted-foreground">
                    {driver.shiftStart}–{driver.shiftEnd}
                  </span>
                </span>
              </div>

              <div className="flex-1 pr-3">
                <div className="relative h-full py-2">
                  {/* Izgara */}
                  {hourTicks.map((tick) => (
                    <span
                      key={tick}
                      className="absolute inset-y-0 w-px bg-border/60"
                      style={{ left: `${pct(tick)}%` }}
                    />
                  ))}

                  {/* Vardiya arka planı */}
                  <span
                    className="absolute inset-y-1.5 rounded bg-muted"
                    style={{
                      left: `${pct(toMinutes(driver.shiftStart))}%`,
                      width: `${pct(toMinutes(driver.shiftEnd)) - pct(toMinutes(driver.shiftStart))}%`,
                    }}
                  />

                  {/* Canlı zaman imleci (Kırmızı dikey çizgi) */}
                  <span
                    className="absolute inset-y-0 z-10 w-px bg-destructive/70 transition-all duration-1000"
                    style={{ left: `${pct(nowMinutes)}%` }}
                  />

                  {/* Durak barları */}
                  {driver.stops.map((stop) => {
                    const start = toMinutes(stop.eta)
                    const end = start + stop.serviceMinutes + 25 // servis + seyahat payı
                    const left = pct(start)
                    const width = Math.max(pct(end) - left, 3)
                    const isSelected = selectedStopId === stop.id
                    const isRisk = stop.status === 'risk'

                    return (
                      <button
                        key={stop.id}
                        type="button"
                        onClick={() => onSelectStop(stop, driver.id)}
                        title={`${stop.customerName} · ETA ${stop.eta} · ${stop.serviceMinutes} dk servis`}
                        className={cn(
                          'group absolute inset-y-2 z-20 flex items-center gap-1 rounded px-1.5 text-left transition-all',
                          theme.solid,
                          isRisk && 'ring-2 ring-destructive ring-offset-1',
                          isSelected && 'z-30 ring-2 ring-foreground ring-offset-1',
                          !isRisk && !isSelected && 'hover:brightness-110',
                        )}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <span className="truncate font-mono text-[9px] font-bold text-primary-foreground">
                          {stop.sequence}. {stop.customerName}
                        </span>
                        {isRisk ? (
                          <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full border border-card bg-destructive shadow-sm">
                            <TriangleAlert className="size-2.5 text-primary-foreground" />
                          </span>
                        ) : null}
                        {isRisk ? (
                          <span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden whitespace-nowrap rounded border border-destructive/30 bg-card px-1.5 py-0.5 text-[9px] font-bold text-destructive shadow-sm group-hover:block">
                            Gecikme Riski · +20 dk
                          </span>
                        ) : null}
                      </button>
                    )
                  })}

                  {/* Mola bloğu */}
                  <span
                    className="absolute inset-y-2 z-10 rounded border border-border/70"
                    style={{
                      left: `${pct(13 * 60)}%`,
                      width: `${pct(13 * 60 + 30) - pct(13 * 60)}%`,
                      backgroundImage:
                        'repeating-linear-gradient(45deg, var(--color-border) 0 3px, transparent 3px 7px)',
                    }}
                    title="Mola · 13:00–13:30"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
'use client'

import {
  Crosshair,
  Layers,
  Maximize2,
  Minus,
  Navigation,
  Plus,
  Route,
  Ruler,
  TriangleAlert,
  Warehouse,
} from 'lucide-react'
import { driverTheme, type StopDto, type DriverDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'

interface MapPanelProps {
  selectedStopId: string | null
  onSelectStop: (stop: StopDto, driverId: string) => void
  isOptimizing: boolean
  drivers: DriverDto[]
}


/** Noktalar arasında hafif kavisli yol çizgisi üretir (gerçek yol geometrisi backend'den gelir). */
function buildRoutePath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const mx = (prev.x + curr.x) / 2
    const my = (prev.y + curr.y) / 2
    // dikey ofset ile yumuşak kavis
    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const offset = Math.min(len * 0.16, 6)
    const cx = mx + (-dy / len) * offset
    const cy = my + (dx / len) * offset
    d += ` Q ${cx} ${cy} ${curr.x} ${curr.y}`
  }
  return d
}

export function MapPanel({ selectedStopId, onSelectStop, isOptimizing, drivers }: MapPanelProps) {
  
  // --- DİNAMİK VERİ HESAPLAMALARI ---
  const activeRouteCount = drivers.length
  const activeStopCount = drivers.reduce((sum, driver) => sum + driver.stops.length, 0)

  // Sistemdeki tüm durakları tarayıp 'risk' statüsünde olan İLK durağı (ve sürücüsünü) bul
  let riskStop: StopDto | null = null
  let riskDriverLabel = ''
  
  for (const driver of drivers) {
    const foundRisk = driver.stops.find((s) => s.status === 'risk')
    if (foundRisk) {
      riskStop = foundRisk
      riskDriverLabel = driver.label
      break
    }
  }

  // HANGİ ARACIN ODAKTA OLDUĞUNU BULUYORUZ
  const activeDriver = drivers.find((d) => d.stops.some((s) => s.id === selectedStopId))
  const activeDriverId = activeDriver?.id
  return (
    <section
      aria-label="Rota haritası"
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-muted"
    >
      {/* Harita araç çubuğu */}
      <div className="absolute left-3 right-3 top-3 z-30 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card/95 p-1 shadow-sm backdrop-blur">
          {[
            { icon: Route, label: 'Rotalar', active: true },
            { icon: Layers, label: 'Katmanlar', active: false },
            { icon: Ruler, label: 'Mesafe ölç', active: false },
            { icon: Crosshair, label: 'Konum seç', active: false },
          ].map((tool) => (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              className={cn(
                'grid size-7 place-items-center rounded transition-colors',
                tool.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <tool.icon className="size-3.5" />
            </button>
          ))}
          <div className="mx-0.5 h-5 w-px bg-border" />
          <span className="pr-1.5 font-mono text-[11px] font-semibold text-muted-foreground">
            İstanbul · Avrupa/Anadolu
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
            <Navigation className="size-3.5 text-primary" />
            <span className="font-mono text-[11px] font-semibold text-foreground">
              {activeRouteCount} rota · {activeStopCount} aktif durak
            </span>
          </div>
          <button
            type="button"
            aria-label="Tam ekran"
            className="grid size-8 place-items-center rounded-md border border-border bg-card/95 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Yakınlaştırma */}
      <div className="absolute right-3 top-16 z-30 flex flex-col overflow-hidden rounded-md border border-border bg-card/95 shadow-sm backdrop-blur">
        <button
          type="button"
          aria-label="Yakınlaştır"
          className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          aria-label="Uzaklaştır"
          className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
      </div>

      {/* Harita gövdesi */}
      <div className="relative min-h-0 flex-1">
       <img
          src="/images/map-base.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover grayscale opacity-40 dark:opacity-60 dark:invert dark:hue-rotate-180"
        />
        <div className="absolute inset-0 bg-background/50 dark:bg-background/60 backdrop-blur-[1px]" />

{/* Rota çizgileri */}
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* 1. Z-ORDER SİHRİ: Seçili aracı her zaman en son (en üstte) çizmek için sıralıyoruz */}
          {[...drivers]
            .sort((a, b) => {
              const aActive = a.id === activeDriverId
              const bActive = b.id === activeDriverId
              return Number(aActive) - Number(bActive)
            })
            .map((driver) => {
              const theme = driverTheme[driver.colorKey]
              const depot = { x: driver.depotX ?? 50, y: driver.depotY ?? 50 }
              const points = [depot, ...driver.stops.map((s) => ({ x: s.x, y: s.y })), depot]
              const d = buildRoutePath(points)
              
              // 2. RENDER KURALI: Hiçbir şey seçili değilse hepsi normal. Biri seçiliyse DİĞERLERİ GRİ olur.
              const isFaded = activeDriverId ? activeDriverId !== driver.id : false
              
              // Seçili değilse Tailwind'in standart gri rengini veriyoruz, renk karmasını bitiriyoruz.
              const colorClass = isFaded ? 'text-muted-foreground/40 dark:text-muted-foreground/20' : theme.text
              const strokeWidthClass = isFaded ? 1.5 : (activeDriverId === driver.id ? 4 : 2.5)

              return (
                <g 
                  key={driver.id} 
                  className={cn(
                    'transition-all duration-300 ease-in-out',
                    colorClass
                  )}
                >
                  {/* Gölge/Arka plan çizgisi */}
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--color-background)"
                    strokeWidth={strokeWidthClass + 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={isFaded ? 0.1 : 0.6}
                  />
                  {/* Asıl rota çizgisi */}
                  <path
                    d={d}
                    fill="none"
                    stroke="currentColor" 
                    strokeWidth={strokeWidthClass}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={isOptimizing ? '6 5' : undefined}
                  />
                </g>
              )
            })}
        </svg>

        {/* Depolar */}
        {Array.from(new Map(
          drivers.map(d => [
            d.depotName || 'Merkez Depo',
            {
              name: d.depotName || 'Merkez Depo',
              x: d.depotX ?? 50,
              y: d.depotY ?? 50,
              // Bu depoya ait olan araçların ID'lerini haritalıyoruz
              driverIds: drivers.filter(dr => (dr.depotName || 'Merkez Depo') === (d.depotName || 'Merkez Depo')).map(dr => dr.id)
            }
          ])
        ).values()).map(d => {
          // ODAK SİHRİ: Seçili bir araç varsa ve bu depo o araca ait değilse soluklaştır
          const isFaded = activeDriverId ? !d.driverIds.includes(activeDriverId) : false

          return (
            <div
              key={d.name}
              className={cn(
                "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out",
                isFaded ? "opacity-20 grayscale scale-95 z-0" : "opacity-100 scale-100 z-20"
              )}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/70 px-3 py-1.5 shadow-lg backdrop-blur-md">
                <Warehouse className="size-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold tracking-wider text-foreground/90">{d.name}</span>
              </div>
            </div>
          )
        })}

{/* Numaralı durak pinleri */}
        {[...drivers]
          // Durakları da z-order için sıralıyoruz
          .sort((a, b) => Number(a.id === activeDriverId) - Number(b.id === activeDriverId))
          .map((driver) => {
            const theme = driverTheme[driver.colorKey]
            const isFaded = activeDriverId ? activeDriverId !== driver.id : false

            return driver.stops.map((stop) => {
              const isSelected = selectedStopId === stop.id
              const isRisk = stop.status === 'risk'
              
              return (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => onSelectStop(stop, driver.id)}
                  className={cn(
                    'group absolute -translate-x-1/2 -translate-y-full transition-all duration-300 ease-in-out focus:outline-none',
                    isSelected ? 'z-40 scale-125' : 'z-20 hover:scale-110 hover:z-30',
                    isFaded ? 'opacity-40 grayscale saturate-0' : 'opacity-100'
                  )}
                  style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                >
                  <span className="relative flex flex-col items-center">
                    <span
                      className={cn(
                        'grid size-7 place-items-center rounded-full font-mono text-[11px] font-bold shadow-md transition-colors',
                        // Griye düşme durumu:
                        isFaded 
                          ? 'bg-muted text-muted-foreground border-2 border-background' 
                          : `${theme.solid} text-white ring-2 ring-background/40`,
                        isSelected && 'ring-4 ring-foreground ring-offset-1 ring-offset-background'
                      )}
                    >
                      {stop.sequence}
                    </span>
                    <span
                      className={cn(
                        '-mt-0.5 size-2 rotate-45 border-b-2 border-r-2 border-background transition-colors',
                        isFaded ? 'bg-muted' : theme.solid
                      )}
                    />
                    
                    {/* Sadece aktif rotada risk ikonu göster */}
                    {isRisk && !isFaded ? (
                      <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full border border-background bg-destructive">
                        <TriangleAlert className="size-2.5 text-white" />
                      </span>
                    ) : null}

                    {/* Tooltip (Etiket): Sadece seçiliyse veya üzerine gelindiğinde açık kalır (Claude Madde 5) */}
                    <span
                      className={cn(
                        'pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded border border-border bg-card px-2 py-1 text-[10px] font-semibold text-foreground shadow-lg transition-opacity',
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {stop.customerName} · {stop.eta}
                    </span>
                  </span>
                </button>
              )
            })
        })}

        {/* DİNAMİK: Gecikme uyarı balonu sadece sistemde riskli bir durak varsa çıkar */}
        {riskStop ? (
          <div className="absolute bottom-24 left-3 z-30 flex max-w-[19rem] items-start gap-2.5 rounded-md border border-destructive/30 bg-card/95 p-2.5 shadow-md backdrop-blur">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-destructive/10">
              <TriangleAlert className="size-3.5 text-destructive" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-foreground">Zaman penceresi ihlali</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {riskDriverLabel} · {riskStop.customerName.substring(0, 20)}... durağı gecikme riski taşıyor. Trafik yoğunluğu nedeniyle rota yeniden hesaplanmalı.
              </p>
              <button
                type="button"
                className="mt-1.5 text-[11px] font-bold text-primary underline-offset-2 hover:underline"
              >
                Yeniden hesapla →
              </button>
            </div>
          </div>
        ) : null}

        {/* Lejant */}
        <div className="absolute bottom-3 left-3 z-30 rounded-md border border-border bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Rota Lejantı
          </p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {drivers.map((driver) => (
              <li key={driver.id} className="flex items-center gap-1.5">
                <span
                  className={cn('h-1 w-4 rounded-full', driverTheme[driver.colorKey].solid)}
                />
                <span className="text-[11px] font-medium text-foreground">{driver.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ölçek */}
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 rounded border border-border bg-card/90 px-2 py-1 font-mono text-[10px] font-medium text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-10 border-x border-b border-foreground/60" />
          2 km
        </div>

        {/* Optimizasyon örtüsü */}
        {isOptimizing ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-background/55 backdrop-blur-[2px]">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
              <Route className="size-5 animate-pulse text-primary" />
              <div>
                <p className="text-[13px] font-bold text-foreground">
                  Rotalar yeniden hesaplanıyor
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  VRP çözücü çalışıyor · {activeStopCount} durak / {activeRouteCount} araç
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
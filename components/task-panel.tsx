'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  Clock,
  FileText,
  GripVertical,
  Lock,
  LockOpen,
  MapPin,
  Package,
  PackageCheck,
  Route,
  TriangleAlert,
  Truck,
  Weight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  driverTheme,
  drivers,
  formatDuration,
  statusMeta,
  unassignedTasks,
  type StopDto,
  type DriverDto,
} from '@/lib/route-data'
import { cn } from '@/lib/utils'

interface TaskPanelProps {
  selectedStopId: string | null
  onSelectStop: (stop: StopDto, driverId: string) => void
  isOptimizing: boolean
  onOptimize: () => void
  drivers: DriverDto[]
  unassigned: StopDto[]
  searchQuery?: string
}

const priorityClass: Record<string, string> = {
  Yüksek: 'bg-destructive/10 text-destructive border-destructive/25',
  Normal: 'bg-secondary text-secondary-foreground border-border',
  Düşük: 'bg-muted text-muted-foreground border-border',
}

export function TaskPanel({
  selectedStopId,
  onSelectStop,
  isOptimizing,
  onOptimize,
  drivers: localDrivers,
  unassigned: localUnassigned,
  searchQuery = '',
}: TaskPanelProps) {
  const [tab, setTab] = useState<'assigned' | 'unassigned'>('unassigned')

  const [expanded, setExpanded] = useState<string[]>(['ARC-001', 'ARC-002'])
  const [lockPopoverOpen, setLockPopoverOpen] = useState(false)
  const [confirmedStops, setConfirmedStops] = useState<string[]>([])
  const [brokenDrivers, setBrokenDrivers] = useState<string[]>([])
  
  const [waybills, setWaybills] = useState<Record<string, string>>({})

  const generateWaybill = (driverId: string, driverLabel: string) => {
    const waybillNo = `UYM-2026-${Math.floor(1000 + Math.random() * 9000)}`
    setWaybills(prev => ({ ...prev, [driverId]: waybillNo }))
    
    toast.success(`${driverLabel} İçin İrsaliye Kesildi`, {
      description: `${waybillNo} numaralı e-İrsaliye oluşturuldu. Araç yola çıkmaya hazır.`,
    })
  }

  const confirmDeliveryWithInvoice = (stopId: string, customerName: string) => {
    setConfirmedStops((prev) => (prev.includes(stopId) ? prev : [...prev, stopId]))
    
    toast.success(`${customerName} teslimatı onaylandı!`, {
      description: "e-Fatura oluşturuldu ve tutar cari bakiyeye borç olarak işlendi.",
    })
  }

  const toggleBreakdown = (driverId: string) =>
    setBrokenDrivers((prev) =>
      prev.includes(driverId) ? prev.filter((d) => d !== driverId) : [...prev, driverId],
    )

  const handleBreakdown = (driverId: string, driverLabel: string) => {
    toggleBreakdown(driverId)
    if (!brokenDrivers.includes(driverId)) {
      toast.error(`${driverLabel} Arızalandı!`, {
        description: "Kalan teslimatlar 'Açık Sipariş' (Teslim Edilemedi) statüsüne çekildi.",
      })
    }
  }

  const toggleDriver = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))

  const assignedCount = localDrivers.reduce((sum, d) => sum + d.stops.length, 0)

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-card">
      <div className="shrink-0 border-b border-border p-3">
        <button
          type="button"
          onClick={() => {
            onOptimize()
            setTab('assigned')
          }}
          disabled={isOptimizing || localUnassigned.length === 0}
          title={
            localUnassigned.length === 0 
              ? 'Havuzda optimize edilecek sipariş yok' 
              : 'Rotaları yeniden optimize et'
          }
          className={cn(
            'group relative flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            localUnassigned.length === 0
              ? 'cursor-not-allowed opacity-40 saturate-50'
              : 'hover:brightness-110 active:scale-[0.99]',
            isOptimizing && 'cursor-wait opacity-80',
          )}
        >
          <Route className={cn('size-4', isOptimizing && 'animate-spin')} />
          <span>{isOptimizing ? 'Optimize Ediliyor…' : 'Rotaları Optimize Et'}</span>
          {localUnassigned.length > 0 ? (
            <span className="absolute right-2 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
              {localUnassigned.length}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 pt-2">
        <button
          type="button"
          onClick={() => setTab('unassigned')}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-1 text-[13px] font-semibold transition-colors',
            tab === 'unassigned'
              ? 'border-muted-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          Atanmamışlar
          <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-destructive">
            {localUnassigned.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('assigned')}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-1 text-[13px] font-semibold transition-colors',
            tab === 'assigned'
              ? 'border-muted-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
          )}
        >
          Atananlar
          <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold text-secondary-foreground">
            {assignedCount}
          </span>
        </button>
      </div>


      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'assigned' ? (
          <ul className="divide-y divide-border">
            {localDrivers.map((driver) => {
              // Arama sorgusuyla filtreleme
              const filteredStops = driver.stops.filter((stop) => 
                !searchQuery || 
                stop.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                stop.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
              )
              
              if (searchQuery && filteredStops.length === 0) return null;

              const theme = driverTheme[driver.colorKey]
              const isOpen = expanded.includes(driver.id)
              const loadPct = Math.round((driver.capacityUsedKg / driver.capacityMaxKg) * 100)
              const hasRisk = driver.stops.some((s) => s.status === 'risk')
              const isBroken = brokenDrivers.includes(driver.id)

              return (
                <li
                  key={driver.id}
                  className={cn(
                    'transition-colors hover:bg-secondary/20',
                    isOpen && 'border-l-2 border-muted-foreground bg-muted/40',
                  )}
                >
                  <div
                    onClick={() => toggleDriver(driver.id)}
                    className="group flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
                  >
                    <Truck className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.6} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-foreground">
                          {driver.label}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {/* Removed driver.fullName */}
                        </span>
                        {hasRisk && !isBroken ? (
                          <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
                        ) : null}
                        {isBroken ? (
                          <span className="shrink-0 rounded border border-destructive/40 bg-destructive/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive">
                            Arızalı
                          </span>
                        ) : null}
                        
                      </span>
                      <span className="mt-0.5 flex items-center gap-2.5 font-mono text-[10px] font-semibold text-foreground/80">
                        <span>{driver.plate}</span>
                        <span>{driver.totalDistanceKm} km</span>
                        <span>{formatDuration(driver.totalDurationMin)}</span>
                      </span>
                    </span>
                    {!isBroken ? (
                      <button
                        type="button"
                        disabled={Boolean(waybills[driver.id])}
                        onClick={(e) => {
                          e.stopPropagation()
                          generateWaybill(driver.id, driver.label)
                        }}
                        aria-label={`${driver.label} için irsaliye kes`}
                        title={waybills[driver.id] ? `${waybills[driver.id]} oluşturuldu` : 'İrsaliye kes'}
                        className={cn(
                          'grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus-visible:opacity-100',
                          waybills[driver.id]
                            ? 'cursor-default opacity-100 text-primary'
                            : 'opacity-0 group-hover:opacity-100',
                        )}
                      >
                        <FileText className="size-3.5" strokeWidth={1.6} />
                      </button>
                    ) : null}
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[11px] font-semibold text-foreground">
                        %{loadPct}
                      </span>
                      <span className="mt-1 block h-1 w-12 overflow-hidden rounded-full bg-muted">
                        <span
                          className={cn('block h-full rounded-full', theme.solid)}
                          style={{ width: `${loadPct}%` }}
                        />
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </div>

                  {isOpen ? (
                    <ol className="space-y-1.5 border-t border-border bg-secondary/30 px-3 py-2.5">
                      {filteredStops.map((stop) => {
                        const isSelected = selectedStopId === stop.id
                        const isConfirmed = confirmedStops.includes(stop.id)
                        const isDelivered = isConfirmed || stop.status === 'completed'
                        const isUndeliverable = isBroken && !isDelivered
                        const status = isUndeliverable
                          ? {
                              label: 'Açık Sipariş (Teslim Edilemedi)',
                              className: 'bg-destructive/15 text-destructive border-destructive/40',
                            }
                          : isConfirmed
                            ? { label: 'Teslim Onaylandı', className: statusMeta.completed.className }
                            : statusMeta[stop.status]
                        return (
                          <li key={stop.id}>
                            <div
                              className={cn(
                                'flex items-stretch rounded-md border bg-card transition-all',
                                isSelected
                                  ? 'border-muted-foreground bg-muted/50'
                                  : isUndeliverable
                                    ? 'border-destructive/40'
                                    : 'border-border hover:border-ring/40 hover:shadow-sm',
                              )}
                            >
                            <button
                              type="button"
                              onClick={() => onSelectStop(stop, driver.id)}
                              aria-pressed={isSelected}
                              className="flex min-w-0 flex-1 items-start gap-2.5 p-2.5 text-left"
                            >
                              <GripVertical className="mt-0.5 size-3.5 shrink-0 cursor-grab text-muted-foreground/60" />
                              <span
                                className={cn(
                                  'grid size-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold text-primary-foreground',
                                  theme.solid,
                                )}
                              >
                                {stop.sequence}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                  <span className="truncate text-[13px] font-semibold text-foreground">
                                    {stop.customerName}
                                  </span>
                                  <span className="shrink-0 font-mono text-[11px] font-bold text-foreground">
                                    {stop.eta}
                                  </span>
                                </span>
                                <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <MapPin className="size-3 shrink-0" />
                                  <span className="truncate">
                                    {stop.district ? `${stop.district} · ` : ""}{stop.address}
                                  </span>
                                </span>
                                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-muted-foreground">
                                    <Clock className="size-2.5" />
                                    {stop.windowStart} - {stop.windowEnd}
                                  </span>
                                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-muted-foreground">
                                    <Weight className="size-2.5" />
                                    {stop.weightKg} kg
                                  </span>
                                  <span
                                    className={cn(
                                      'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                                      status.className,
                                    )}
                                  >
                                    {status.label}
                                  </span>
                                </span>
                              </span>
                            </button>
                            <div className="flex shrink-0 items-center border-l border-border px-1.5">
                              <button
                                type="button"
                                onClick={() => confirmDeliveryWithInvoice(stop.id, stop.customerName)}
                                disabled={isDelivered}
                                aria-label={`${stop.customerName} teslimini onayla`}
                                title={
                                  isDelivered
                                    ? 'Teslim onaylandı'
                                    : `${stop.customerName} teslimini onayla`
                                }
                                className={cn(
                                  'grid size-7 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40',
                                  isDelivered
                                    ? 'cursor-default border-success/40 bg-success/15 text-success'
                                    : 'border-success/40 text-success hover:bg-success/15',
                                )}
                              >
                                <Check className="size-3.5" />
                              </button>
                            </div>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="divide-y divide-border">
            {localUnassigned.filter(task => 
              !searchQuery || 
              task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((task) => (
              <li key={task.id}>
                <div className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-secondary/50">
                  <GripVertical className="mt-1 size-3.5 shrink-0 text-muted-foreground/60" />
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
                    <Package className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        <span className="text-muted-foreground mr-1">{task.orderNo}</span> 
                        {task.customerName}
                      </p>
                      <span
                        className={cn(
                          'shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                          priorityClass[task.priority],
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">
                        {task.district ? `${task.district} · ` : ""}{task.address}
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground/90">
                        <Clock className="size-2.5" />
                        {task.windowStart} - {task.windowEnd}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                        <Weight className="size-2.5" />
                        {task.weightKg} kg
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                        <PackageCheck className="size-2.5" />
                        Stok Onaylı
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {task.orderNo}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </aside>
  )
}

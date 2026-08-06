'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  Clock,
  GripVertical,
  Lock,
  LockOpen,
  MapPin,
  Package,
  PackageCheck,
  Sparkles,
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
import { NewOrderDialog } from "@/components/new-order-dialog"

interface TaskPanelProps {
  selectedStopId: string | null
  onSelectStop: (stop: StopDto, driverId: string) => void
  isOptimizing: boolean
  onOptimize: () => void
  drivers: DriverDto[]
  unassigned: StopDto[]
  setUnassigned: Dispatch<SetStateAction<StopDto[]>>
  setDrivers: Dispatch<SetStateAction<DriverDto[]>>
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
  setUnassigned: setLocalUnassigned,
  setDrivers: setLocalDrivers,
  searchQuery = '',
}: TaskPanelProps) {
  const [tab, setTab] = useState<'assigned' | 'unassigned'>('unassigned')

  const [expanded, setExpanded] = useState<string[]>(['ARC-001', 'ARC-002'])
  const [lockPopoverOpen, setLockPopoverOpen] = useState(false)
  const [confirmedStops, setConfirmedStops] = useState<string[]>([])
  const [brokenDrivers, setBrokenDrivers] = useState<string[]>([])
  
  const [waybills, setWaybills] = useState<Record<string, string>>({})

  const handleDropTask = (taskId: string, driverId: string) => {
    const taskToMove = localUnassigned.find((t) => t.id === taskId)
    if (!taskToMove) return

    const targetDriver = localDrivers.find((d) => d.id === driverId)
    if (!targetDriver) return

    // HATA ÇÖZÜMÜ: Sürükle bırakta da ID çakışmasını engellemek için benzersiz ID
    const newStop = {
      ...taskToMove,
      id: `ST-DRP-${taskToMove.id}-${Date.now()}`,
      sequence: targetDriver.stops.length + 1,
      volumeM3: 1.5,
      status: 'pending',
      eta: taskToMove.windowStart,
      serviceMinutes: 15,
      phone: '0555 000 0000',
      x: 55,
      y: 55,
    } as StopDto

    setLocalUnassigned((prev) => prev.filter((t) => t.id !== taskId))
    
    setLocalDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, stops: [...d.stops, newStop] } : d))
    )

    toast.success("Sipariş araca atandı!", {
      description: `${taskToMove.customerName}, ${targetDriver.label} rotasına eklendi.`,
    })
  }

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
            'group flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-4 py-3.5 text-[15px] font-bold tracking-tight text-primary-foreground shadow-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            localUnassigned.length === 0
              ? 'cursor-not-allowed opacity-40 saturate-50'
              : 'hover:brightness-110 active:scale-[0.99]',
            isOptimizing && 'cursor-wait opacity-80',
          )}
        >
          <Sparkles className={cn('size-5', isOptimizing && 'animate-spin')} />
          {isOptimizing ? 'Optimize Ediliyor…' : 'Rotaları Optimize Et'}
        </button>
        <div className="mt-2 px-0.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            {localUnassigned.length} atanmamış görev kuyrukta
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 pt-2">
        <button
          type="button"
          onClick={() => setTab('unassigned')}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-1 text-[13px] font-semibold transition-colors',
            tab === 'unassigned'
              ? 'border-primary text-foreground'
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
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
          }}
          onDrop={(e) => {
            e.preventDefault()
            const taskId = e.dataTransfer.getData('taskId')
            if (taskId && localDrivers.length > 0) {
              handleDropTask(taskId, localDrivers[0].id)
              setTab('assigned')
            }
          }}
          className={cn(
            'flex items-center gap-1.5 border-b-2 px-2.5 pb-2 pt-1 text-[13px] font-semibold transition-colors',
            tab === 'assigned'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50'
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
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={(e) => {
                    e.preventDefault()
                    const taskId = e.dataTransfer.getData('taskId')
                    if (taskId) handleDropTask(taskId, driver.id)
                  }}
                  className="transition-colors hover:bg-secondary/20"
                >
                  <div
                    onClick={() => toggleDriver(driver.id)}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
                  >
                    <span className={cn('h-9 w-1 shrink-0 rounded-full', theme.solid)} />
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-md border',
                        theme.soft,
                        theme.border,
                        theme.text,
                      )}
                    >
                      <Truck className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold text-foreground">
                          {driver.label}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          · {driver.fullName}
                        </span>
                        {hasRisk && !isBroken ? (
                          <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
                        ) : null}
                        {isBroken ? (
                          <span className="shrink-0 rounded border border-destructive/40 bg-destructive/15 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive">
                            Arızalı
                          </span>
                        ) : null}
                        
                        {!isBroken && waybills[driver.id] ? (
                          <span className="shrink-0 rounded border border-blue-400 bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                            📄 {waybills[driver.id]} ile Yolda
                          </span>
                        ) : (
                          !isBroken && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation(); 
                                generateWaybill(driver.id, driver.label);
                              }}
                              className="shrink-0 rounded border border-ring/50 bg-card px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                              İrsaliye Kes
                            </button>
                          )
                        )}

                      </span>
                      <span className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                        <span>{driver.plate}</span>
                        <span className="text-border">|</span>
                        <span>{driver.totalDistanceKm} km</span>
                        <span className="text-border">|</span>
                        <span>{formatDuration(driver.totalDurationMin)}</span>
                      </span>
                    </span>
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
                                  ? 'border-primary ring-2 ring-primary/25'
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
                                  <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    <Clock className="size-2.5" />
                                    {stop.windowStart} - {stop.windowEnd}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
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
            <li className="px-3 py-2">
                <NewOrderDialog 
                  triggerLabel="Yeni Sipariş Ekle"
                  triggerClassName="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:bg-secondary/50 hover:text-primary transition-colors"
                  onAddOrder={(newOrder) => {
                    setLocalUnassigned((prev) => [newOrder, ...prev])
                  }} 
                />
              </li>
            {localUnassigned.filter(task => 
              !searchQuery || 
              task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.orderNo.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((task) => (
              <li 
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('taskId', task.id)
                }}
                className="cursor-grab active:cursor-grabbing"
              >
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
                      <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <Clock className="size-2.5" />
                        {task.windowStart} - {task.windowEnd}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
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

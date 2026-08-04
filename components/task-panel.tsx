'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  Clock,
  Filter,
  GripVertical,
  Lock,
  LockOpen,
  MapPin,
  Package,
  PackageCheck,
  PackageOpen,
  Plus,
  RotateCcw,
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
} from '@/lib/route-data'
import { cn } from '@/lib/utils'
import { NewOrderDialog } from "@/components/new-order-dialog"

interface TaskPanelProps {
  selectedStopId: string | null
  onSelectStop: (stop: StopDto, driverId: string) => void
  isOptimizing: boolean
  onOptimize: () => void
  isPoolLocked: boolean
  onPoolLockChange: (locked: boolean) => void
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
  isPoolLocked,
  onPoolLockChange,
}: TaskPanelProps) {
  const [tab, setTab] = useState<'unassigned' | 'assigned'>('assigned')
  
  const [localUnassigned, setLocalUnassigned] = useState(unassignedTasks)
  const [localDrivers, setLocalDrivers] = useState(drivers)

  const [expanded, setExpanded] = useState<string[]>(['ARC-001', 'ARC-002'])
  const [lockPopoverOpen, setLockPopoverOpen] = useState(false)
  const [confirmedStops, setConfirmedStops] = useState<string[]>([])
  const [brokenDrivers, setBrokenDrivers] = useState<string[]>([])
  
  const [waybills, setWaybills] = useState<Record<string, string>>({})

  // OPTİMİZASYON SİMÜLASYONU SİHRİ
  const handleOptimizeClick = () => {
    onOptimize()

    setTimeout(() => {
      setLocalUnassigned((prevUnassigned) => {
        if (prevUnassigned.length === 0) return prevUnassigned

        setLocalDrivers((prevDrivers) => {
          const updatedDrivers = [...prevDrivers]
          
          prevUnassigned.forEach((task, index) => {
            const driverIndex = index % updatedDrivers.length
            const targetDriver = updatedDrivers[driverIndex]
            
            // HATA ÇÖZÜMÜ: ID çakışmasını engellemek için benzersiz bir ID üretiyoruz
            const newStop = {
              ...task,
              id: `ST-OPT-${task.id}-${index}-${Date.now()}`,
              sequence: targetDriver.stops.length + 1,
              volumeM3: 1.5,
              status: 'pending', 
              eta: task.windowStart,
              serviceMinutes: 15,
              phone: '0555 000 0000',
              x: 50 + (index * 2),
              y: 50 + (index * 2),
            } as StopDto
            
            updatedDrivers[driverIndex] = {
              ...targetDriver,
              stops: [...targetDriver.stops, newStop],
              capacityUsedKg: targetDriver.capacityUsedKg + task.weightKg
            }
          })
          
          return updatedDrivers
        })

        return []
      })
      
      setTab('assigned')
    }, 2200)
  }

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
          onClick={handleOptimizeClick}
          disabled={isOptimizing || isPoolLocked || localUnassigned.length === 0}
          aria-describedby={isPoolLocked ? 'optimize-lock-hint' : undefined}
          title={
            isPoolLocked
              ? 'Havuz kilitli olduğu için optimizasyon başlatılamaz'
              : localUnassigned.length === 0 
                ? 'Havuzda optimize edilecek sipariş yok' 
                : 'Rotaları yeniden optimize et'
          }
          className={cn(
            'group flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-4 py-3.5 text-[15px] font-bold tracking-tight text-primary-foreground shadow-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            (isPoolLocked || localUnassigned.length === 0)
              ? 'cursor-not-allowed opacity-40 saturate-50'
              : 'hover:brightness-110 active:scale-[0.99]',
            isOptimizing && 'cursor-wait opacity-80',
          )}
        >
          {isPoolLocked ? (
            <Lock className="size-5" />
          ) : (
            <Sparkles className={cn('size-5', isOptimizing && 'animate-spin')} />
          )}
          {isOptimizing ? 'Optimize Ediliyor…' : 'Rotaları Optimize Et'}
        </button>
        {isPoolLocked ? (
          <p
            id="optimize-lock-hint"
            className="mt-2 flex items-center gap-1.5 rounded-md border border-warning/25 bg-warning/10 px-2 py-1.5 text-[11px] font-medium leading-relaxed text-warning"
          >
            <Lock className="size-3 shrink-0" />
            Havuz kilitli — optimizasyon için acil müdahale gerekli.
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between px-0.5">
          <p className="text-[11px] font-medium text-muted-foreground">
            {localUnassigned.length} atanmamış görev kuyrukta
          </p>
          <button
            type="button"
            className="text-[11px] font-semibold text-primary underline-offset-2 hover:underline"
          >
            Motor ayarları
          </button>
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
        
        <button
          type="button"
          aria-label="Filtrele"
          className="ml-auto mb-1.5 grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Filter className="size-3.5" />
        </button>
      </div>

      {tab === 'unassigned' ? (
        <div
          className={cn(
            'shrink-0 border-b border-border px-3 py-1.5',
            isPoolLocked ? 'bg-warning/10' : 'bg-success/10',
          )}
        >
          {isPoolLocked ? (
            <Popover open={lockPopoverOpen} onOpenChange={setLockPopoverOpen}>
              <PopoverTrigger
                aria-label="Havuz kilidi hakkında bilgi ve acil müdahale seçenekleri"
                className={cn(
                  'inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning transition-colors',
                  'hover:border-warning/60 hover:bg-warning/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40',
                  lockPopoverOpen && 'border-warning/60 bg-warning/25',
                )}
              >
                <Lock className="size-2.5 shrink-0" />
                06:00 Cut-Off: Havuz Kilitli
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-warning/30 bg-warning/10 text-warning">
                    <Lock className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-foreground">Havuz Kilitli</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      Havuz şu an kilitli olduğu için yeni sipariş ataması yapılamaz. Acil durum
                      müdahalesi için havuz kilidini geçici olarak kaldırmak istiyor musunuz?
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => setLockPopoverOpen(false)}>
                    Vazgeç
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onPoolLockChange(false)
                      setLockPopoverOpen(false)
                    }}
                  >
                    Kilidi Kaldır
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              type="button"
              onClick={() => onPoolLockChange(true)}
              aria-label="Havuz kilidini yeniden etkinleştir"
              title="Havuz kilidini yeniden etkinleştir"
              className="inline-flex items-center gap-1 rounded border border-success/40 bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success transition-colors hover:border-success/60 hover:bg-success/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
            >
              <LockOpen className="size-2.5 shrink-0" />
              Havuz Kilidi Kaldırıldı (Acil Müdahale)
            </button>
          )}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'assigned' ? (
          <ul className="divide-y divide-border">
            {localDrivers.map((driver) => {
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

                  <p className="flex items-center gap-1.5 px-3 pb-2 font-mono text-[10px] font-medium text-muted-foreground">
                    <PackageOpen className="size-3 shrink-0" />
                    <span className="truncate">
                      {'Depo Yükleme Sırası (LIFO): '}
                      <span className="font-bold text-foreground">
                        {driver.stops
                          .map((s) => s.sequence)
                          .slice()
                          .reverse()
                          .join(' → ')}
                      </span>
                    </span>
                  </p>

                  {isOpen ? (
                    <ol className="space-y-1.5 border-t border-border bg-secondary/30 px-3 py-2.5">
                      {driver.stops.map((stop) => {
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
                                    {stop.district} · {stop.address}
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
                      <li>
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-ring/50 hover:bg-card hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                          Bu rotaya durak ekle
                        </button>
                      </li>
                      <li className="pt-0.5">
                        {isBroken ? (
                          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5">
                            <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
                            <p className="min-w-0 flex-1 text-[11px] font-semibold leading-relaxed text-destructive">
                              Araç arızalandı — teslim edilmeyen duraklar açık siparişe düştü.
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleBreakdown(driver.id)}
                              className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/15"
                            >
                              <RotateCcw className="size-3" />
                              Geri Al
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBreakdown(driver.id, driver.label)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-destructive/50 bg-transparent py-2 text-[12px] font-bold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                          >
                            <TriangleAlert className="size-3.5 shrink-0" />
                            Araç Arızalandı!
                          </button>
                        )}
                      </li>
                    </ol>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="divide-y divide-border">
            {!isPoolLocked ? (
              <li className="px-3 py-2">
                <NewOrderDialog 
                  onAddOrder={(newOrder) => {
                    setLocalUnassigned((prev) => [newOrder, ...prev])
                  }} 
                />
              </li>
            ) : null}
            {localUnassigned.map((task) => (
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
                        {task.district} · {task.address}
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

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-secondary/40 px-3 py-2">
        <span className="font-mono text-[11px] text-muted-foreground">
          Plan #PLN-2026-0725-01
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Senkronize
        </span>
      </div>
    </aside>
  )
}
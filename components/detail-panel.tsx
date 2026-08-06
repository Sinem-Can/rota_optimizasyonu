'use client'

import { useState } from 'react'
import {
  BellRing,
  Boxes,
  Clock,
  Fuel,
  Loader2,
  MapPin,
  Pencil,
  Route,
  Timer,
  TriangleAlert,
  Truck,
  Wallet,
  Weight,
  X,
} from 'lucide-react'
import { toast } from "sonner"
import { driverTheme, type StopDto, type DriverDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  stop: StopDto | null
  driverId: string | null
  drivers: DriverDto[]
  onClose: () => void
}

export function DetailPanel({ stop, driverId, drivers, onClose }: DetailPanelProps) {
  // Yükleme animasyonları için state'ler
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const driver = drivers.find((d) => d.id === driverId) ?? null

  if (!stop || !driver) {
    const totalDistance = drivers.reduce((sum, item) => sum + item.totalDistanceKm, 0)
    const totalMinutes = drivers.reduce((sum, item) => sum + item.totalDurationMin, 0)
    const estimatedFuel = Math.round((totalDistance / 100) * 12)
    const summaryItems = [
      { label: 'Toplam Mesafe', value: totalDistance.toLocaleString('tr-TR'), unit: 'km', icon: Route },
      { label: 'Toplam Süre', value: `${Math.floor(totalMinutes / 60)}s ${totalMinutes % 60}d`, icon: Timer },
      { label: 'Araç Sayısı', value: drivers.length.toString(), unit: 'araç', icon: Truck },
      { label: 'Yakıt Tahmini', value: estimatedFuel.toLocaleString('tr-TR'), unit: 'lt', icon: Fuel },
      { label: 'Maliyet', value: (estimatedFuel * 42.5).toLocaleString('tr-TR'), unit: '₺', icon: Wallet },
    ]

    return (
      <aside className="flex h-full min-h-0 flex-col border-l border-border bg-card">
        <div className="border-b border-border px-3.5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Plan Özeti</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Bir durağı seçtiğinizde burada durak detayları gösterilir.
          </p>
        </div>
        <div className="grid flex-1 content-start gap-2.5 overflow-y-auto p-3.5">
          {summaryItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-card p-3 shadow-sm dark:border-border">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <item.icon className="size-4.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="font-mono text-lg font-bold text-foreground">{item.value}</span>
                  {item.unit ? <span className="text-[11px] font-medium text-muted-foreground">{item.unit}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    )
  }

  const theme = driverTheme[driver.colorKey]
  const capacityPct = Math.round((stop.weightKg / driver.capacityMaxKg) * 100)
  const deliveredAt = stop.status === 'completed' ? stop.eta : null

  const handleSendNotification = () => {
    setIsSendingNotification(true)
    setTimeout(() => {
      setIsSendingNotification(false)
      toast.info("Sürücüye e-posta bildirimi gönderildi.", {
        description: `${driver.fullName} (${driver.plate})`,
      })
    }, 1200)
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-border bg-card">
      <div className="shrink-0 border-b border-border px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Durak Detayı
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing((value) => !value)}
              aria-label={isEditing ? 'Düzenlemeyi bitir' : 'Durak detayını düzenle'}
              title={isEditing ? 'Düzenlemeyi bitir' : 'Düzenle'}
              className={cn(
                'grid size-6 place-items-center rounded-md transition-colors',
                isEditing
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Pencil className="size-3.5" />
            </button>
            <button type="button" onClick={onClose} aria-label="Durak detayını kapat" title="Kapat" className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-2.5">
          <span
            className={cn(
              'grid size-7 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold text-primary-foreground',
              theme.solid,
            )}
          >
            {stop.sequence}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-bold leading-tight text-foreground">
              {stop.customerName}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              Cari Kod: {stop.cariKod ?? '—'}
            </p>
            <p className="mt-1 flex items-start gap-1 text-[11px] text-muted-foreground">
              <MapPin className="mt-0.5 size-3 shrink-0" />
              <span className="whitespace-normal break-words text-sm font-medium leading-snug" title={stop.address}>
                {stop.address}{stop.district ? `, ${stop.district}` : ""}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto px-3.5">
        {/* Zaman Penceresi */}
        <fieldset className="py-3">
          <legend className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" />
            Zaman Penceresi
          </legend>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <label className="relative flex-1">
                <span className="sr-only">Başlangıç saati</span>
                <input type="text" inputMode="numeric" defaultValue={stop.windowStart} placeholder="SS:DD" className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-7 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                <Clock className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </label>
              <span className="text-muted-foreground">–</span>
              <label className="relative flex-1">
                <span className="sr-only">Bitiş saati</span>
                <input type="text" inputMode="numeric" defaultValue={stop.windowEnd} placeholder="SS:DD" className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-7 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                <Clock className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </label>
            </div>
          ) : (
            <p className="font-mono text-[14px] font-bold text-foreground">{stop.windowStart} <span className="mx-1 text-muted-foreground">–</span> {stop.windowEnd}</p>
          )}
          <div className="mt-2 flex items-center justify-between text-[12px]">
            <span className="text-[11px] font-medium text-muted-foreground">Planlanan ETA</span>
            <span
              className={cn(
                'font-mono text-[12px] font-bold',
                stop.status === 'risk' ? 'text-destructive' : 'text-success',
              )}
            >
              {stop.eta}
            </span>
          </div>
          {stop.status === 'risk' ? (
            <p className="mt-2 flex items-start gap-1.5 border-l-2 border-destructive bg-destructive/5 px-2 py-1.5 text-[11px] font-medium leading-relaxed text-destructive">
              <TriangleAlert className="mt-px size-3.5 shrink-0" />
              ETA, pencere bitişini 20 dk aşıyor.
            </p>
          ) : null}
        </fieldset>

        {/* Kapasite / Ağırlık */}
        <fieldset className={cn('py-3', capacityPct >= 90 && 'border-l-2 border-destructive bg-destructive/5 px-2')}>
          <legend className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Weight className="size-3.5" />
            Kapasite / Ağırlık
          </legend>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="relative">
                <input type="number" defaultValue={stop.weightKg} aria-label="Ağırlık (kg)" className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-8 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">kg</span>
              </div>
              <div className="relative">
                <input type="number" defaultValue={stop.volumeM3} step={0.1} aria-label="Hacim (m³)" className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-9 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20" />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">m³</span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-4 font-mono text-[14px] font-bold text-foreground">
              <span>{stop.weightKg.toLocaleString('tr-TR')} <span className="text-[11px] font-medium text-muted-foreground">kg</span></span>
              <span>{stop.volumeM3} <span className="text-[11px] font-medium text-muted-foreground">m³</span></span>
            </div>
          )}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-muted-foreground">Araç doluluk katkısı</span>
              <span className="font-mono font-bold text-foreground">%{capacityPct}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', theme.solid)}
                style={{ width: `${Math.min(capacityPct, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Boxes className="size-3" />
              {driver.capacityUsedKg.toLocaleString('tr-TR')} /{' '}
              {driver.capacityMaxKg.toLocaleString('tr-TR')} kg yüklü
            </p>
          </div>
        </fieldset>

        <div className="flex items-center justify-between py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" />
            Teslim Edilen Saat
          </span>
          <span className={cn('font-mono text-[13px] font-bold', deliveredAt ? 'text-success' : 'text-muted-foreground')}>
            {deliveredAt ?? 'Bekleniyor'}
          </span>
        </div>

        <details className="group py-3">
          <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wide text-muted-foreground marker:hidden">
            Sürücü Notu <span className="ml-1 text-muted-foreground/60 group-open:hidden">· Göster</span>
          </summary>
          <label className="mt-2 block">
            <span className="sr-only">Sürücü Notu</span>
          <textarea
            rows={2}
            defaultValue="Arka giriş kullanılacak, güvenlikten kayıt yapılmalı."
            className="w-full resize-none rounded-md border border-input bg-background p-2 text-[12px] leading-relaxed text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          </label>
        </details>
      </div>

      <details className="group shrink-0 border-t border-border px-3 py-3">
        <summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-wide text-muted-foreground marker:hidden">
          Hızlı İşlemler <span className="ml-1 text-muted-foreground/60 group-open:hidden">· Göster</span>
        </summary>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Sürücü bildirimi</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={isSendingNotification} onClick={handleSendNotification} aria-label="Sürücüye E-Mail Gönder" title="Sürücüye E-Mail Gönder" className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60">
              {isSendingNotification ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
            </button>
          </div>
        </div>

        {isEditing ? (
          <button
            type="button"
            onClick={() => {
              toast.success("Değişiklikler kaydedildi.", {
                description: `${stop.customerName} rotası güncellendi.`,
              })
              setIsEditing(false)
            }}
            className="w-full rounded-md bg-primary py-2 text-[12px] font-semibold text-primary-foreground transition-colors hover:brightness-110"
          >
            Değişiklikleri Kaydet
          </button>
        ) : null}
      </details>
    </aside>
  )
}

'use client'

import {
  BellRing,
  Boxes,
  Building2,
  Clock,
  FileCheck2,
  History,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Send,
  Timer,
  TriangleAlert,
  Truck,
  Wallet,
  Weight,
} from 'lucide-react'
import { toast } from "sonner"
import { driverTheme, drivers, statusMeta, type StopDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
  stop: StopDto | null
  driverId: string | null
}

const customerGroups = ['Zincir Market', 'Kurumsal Bayi', 'Yapı Marketi', 'Perakende'] as const

const paymentTypes = [
  { label: 'Çek Tahsilatı', collect: true },
  { label: 'Kapıda Nakit', collect: true },
  { label: 'Cari Hesap', collect: false },
] as const

/** ERP alanları demo verisinde bulunmadığı için durak kimliğinden türetilir. */
function erpInfo(stopId: string) {
  const seed = Number(stopId.replace(/\D/g, '')) || 1
  return {
    accountCode: `120.01.${String((seed % 89) + 10)}`,
    customerGroup: customerGroups[seed % customerGroups.length],
    payment: paymentTypes[seed % paymentTypes.length],
  }
}

export function DetailPanel({ stop, driverId }: DetailPanelProps) {
  const driver = drivers.find((d) => d.id === driverId) ?? null

  if (!stop || !driver) {
    return (
      <aside className="flex h-full flex-col items-center justify-center gap-3 border-l border-border bg-card px-6 text-center">
        <div className="grid size-11 place-items-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
          <MapPin className="size-5" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground">Durak seçilmedi</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Detayları görüntülemek ve düzenlemek için haritadan veya listeden bir durak seçin.
          </p>
        </div>
      </aside>
    )
  }

  const theme = driverTheme[driver.colorKey]
  const status = statusMeta[stop.status]
  const capacityPct = Math.round((stop.weightKg / driver.capacityMaxKg) * 100)
  const erp = erpInfo(stop.id)

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-border bg-card">
      {/* Başlık */}
      <div className="shrink-0 border-b border-border px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Durak Detayı
          </p>
          <span className="font-mono text-[10px] font-medium text-muted-foreground">{stop.id}</span>
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
            <p className="mt-0.5 flex flex-col gap-px text-[10px] font-medium leading-tight text-muted-foreground/70">
              <span className="block truncate font-mono">Cari Kod: {erp.accountCode}</span>
              <span className="block truncate">Müşteri Grubu: {erp.customerGroup}</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">
                {stop.address}, {stop.district}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold',
              status.className,
            )}
          >
            {status.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Package className="size-2.5" />
            {stop.orderNo}
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {stop.priority} öncelik
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
            <FileCheck2 className="size-2.5" />
            İrsaliye: Kesildi
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            <ReceiptText className="size-2.5" />
            e-Fatura: Oluşturuldu
          </span>
        </div>
      </div>

      {/* Düzenlenebilir alanlar */}
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-3.5 py-3">
        {/* Zaman Penceresi */}
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" />
            Zaman Penceresi
          </legend>
          <div className="flex items-center gap-1.5">
            <label className="relative flex-1">
              <span className="sr-only">Başlangıç saati</span>
              <input
                type="text"
                inputMode="numeric"
                defaultValue={stop.windowStart}
                placeholder="SS:DD"
                className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-7 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <Clock className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </label>
            <span className="text-muted-foreground">–</span>
            <label className="relative flex-1">
              <span className="sr-only">Bitiş saati</span>
              <input
                type="text"
                inputMode="numeric"
                defaultValue={stop.windowEnd}
                placeholder="SS:DD"
                className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-7 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <Clock className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
          <div className="mt-1.5 flex items-center justify-between rounded-md border border-border bg-secondary/50 px-2 py-1.5">
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
            <p className="mt-1.5 flex items-start gap-1.5 rounded-md border border-destructive/25 bg-destructive/5 px-2 py-1.5 text-[11px] font-medium leading-relaxed text-destructive">
              <TriangleAlert className="mt-px size-3.5 shrink-0" />
              ETA, pencere bitişini 20 dk aşıyor.
            </p>
          ) : null}
        </fieldset>

        {/* Servis Süresi */}
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Timer className="size-3.5" />
            Servis Süresi
          </legend>
          <div className="relative">
            <input
              type="number"
              defaultValue={stop.serviceMinutes}
              min={0}
              step={5}
              aria-label="Servis süresi (dakika)"
              className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-14 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
              dakika
            </span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {[10, 15, 20, 30, 45].map((preset) => (
              <button
                key={preset}
                type="button"
                className={cn(
                  'flex-1 rounded border py-1 font-mono text-[11px] font-semibold transition-colors',
                  preset === stop.serviceMinutes
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {preset}
              </button>
            ))}
          </div>
          <div
            className={cn(
              'mt-2 flex items-center gap-1.5 rounded-md border px-2 py-1.5',
              erp.payment.collect
                ? 'border-warning/30 bg-warning/10'
                : 'border-border bg-secondary/50',
            )}
          >
            <Wallet
              className={cn(
                'size-3.5 shrink-0',
                erp.payment.collect ? 'text-warning' : 'text-muted-foreground',
              )}
            />
            <span className="text-[11px] font-medium text-muted-foreground">Ödeme Tipi</span>
            <span
              className={cn(
                'ml-auto text-[12px] font-bold',
                erp.payment.collect ? 'text-warning' : 'text-foreground',
              )}
            >
              {erp.payment.label}
            </span>
          </div>
          {erp.payment.collect ? (
            <p className="mt-1 px-0.5 text-[10px] font-medium leading-relaxed text-muted-foreground">
              Sürücü sahada tahsilat yapacak.
            </p>
          ) : null}
        </fieldset>

        {/* Kapasite / Ağırlık */}
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Weight className="size-3.5" />
            Kapasite / Ağırlık
          </legend>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="relative">
              <input
                type="number"
                defaultValue={stop.weightKg}
                aria-label="Ağırlık (kg)"
                className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-8 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                kg
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                defaultValue={stop.volumeM3}
                step={0.1}
                aria-label="Hacim (m³)"
                className="h-9 w-full rounded-md border border-input bg-background pl-2 pr-9 font-mono text-[13px] font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
                m³
              </span>
            </div>
          </div>
          <div className="mt-2 rounded-md border border-border bg-secondary/50 p-2">
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

        {/* Atanan araç */}
        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <Truck className="size-3.5" />
            Atanan Araç
          </legend>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background p-2">
            <span className={cn('h-8 w-1 shrink-0 rounded-full', theme.solid)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-foreground">
                {driver.label} · {driver.fullName}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {driver.plate} · {driver.vehicleType}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Değiştir
            </button>
          </div>
        </fieldset>

        {/* İletişim */}
        <div className="space-y-1.5 rounded-md border border-border bg-secondary/40 p-2.5">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">Müşteri kodu</span>
            <span className="ml-auto font-mono">{stop.id.replace('ST', 'CUS')}</span>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">Telefon</span>
            <span className="ml-auto font-mono">{stop.phone}</span>
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <History className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">Son teslimat</span>
            <span className="ml-auto font-mono">18 Tem 2026</span>
          </p>
        </div>

        {/* Notlar */}
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Sürücü Notu
          </span>
          <textarea
            rows={2}
            defaultValue="Arka giriş kullanılacak, güvenlikten kayıt yapılmalı."
            className="w-full resize-none rounded-md border border-input bg-background p-2 text-[12px] leading-relaxed text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>
      </div>

      {/* Eylemler */}
      <div className="shrink-0 space-y-2 border-t border-border p-3">
        {/* Sürücüye Gönder Butonu */}
        <button
          type="button"
          onClick={() => {
            toast.success("Görev sürücüye başarıyla iletildi!", {
              description: `${driver.fullName} (${driver.plate}) - Cihazına gönderildi.`,
            })
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-[13px] font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Send className="size-4" />
          Sürücüye Gönder
        </button>
        
        {/* SMS/Mail Butonu */}
        <button
          type="button"
          onClick={() => {
            toast.info("Müşteriye yola çıktı bildirimi gönderildi.", {
              description: `SMS & Mail: ${stop.customerName} (${stop.phone})`,
            })
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-secondary/50 px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BellRing className="size-3.5 shrink-0" />
          <span className="text-balance text-center leading-tight">
            Sipariş Yola Çıktı (SMS/Mail) Bildirimi Gönder
          </span>
        </button>

        <div className="flex gap-2">
          {/* Kaydet Butonu */}
          <button
            type="button"
            onClick={() => {
              toast.success("Değişiklikler kaydedildi.", {
                description: `${stop.customerName} rotası güncellendi.`,
              })
            }}
            className="flex-1 rounded-md border border-input bg-background py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Değişiklikleri Kaydet
          </button>
          
          {/* Durağı Kaldır Butonu */}
          <button
            type="button"
            onClick={() => {
              toast.error("Durak rotadan çıkarıldı!", {
                description: `${stop.customerName} siparişi tekrar havuza düştü.`,
              })
            }}
            className="rounded-md border border-destructive/30 bg-background px-3 py-2 text-[12px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            Durağı Kaldır
          </button>
        </div>
      </div>
    </aside>
  )
}

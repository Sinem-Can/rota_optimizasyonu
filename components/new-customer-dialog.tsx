'use client'

import { ChevronDown, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { customers, type CustomerDto } from '@/lib/route-data'

const districts = Array.from(new Set(customers.map((c) => c.district))).sort((a, b) =>
  a.localeCompare(b, 'tr-TR'),
)

const priorities: CustomerDto['priority'][] = ['Yüksek', 'Normal', 'Düşük']

/** 07:00–20:00 arası yarım saatlik teslimat slotları (24 saat biçimi). */
const timeSlots = Array.from({ length: 27 }, (_, i) => {
  const minutes = 7 * 60 + i * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const selectClass =
  'h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'

export function NewCustomerDialog({
  triggerLabel = 'Yeni Müşteri',
  triggerClassName,
}: {
  /** Aksiyon çubuğunda kısa etiket ("Yeni") kullanmak için. */
  triggerLabel?: string
  triggerClassName?: string
} = {}) {
  const [open, setOpen] = useState(false)

  // Demo formu: kayıt backend'e bağlanana kadar yalnızca modalı kapatır.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          'ml-auto flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90'
        }
      >
        <Plus className="size-4" />
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                <MapPin className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold tracking-tight">
                  Yeni Müşteri Kaydı
                </DialogTitle>
                <DialogDescription className="text-[12px]">
                  Teslimat tercihlerini şimdi tanımlayın, rota planlaması otomatik uygular.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id="new-customer-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nc-name" className={labelClass}>
                Firma Adı
              </Label>
              <input
                id="nc-name"
                name="name"
                required
                placeholder="Örn. Anadolu Market A.Ş."
                className={fieldClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nc-district" className={labelClass}>
                  Bölge
                </Label>
                <div className="relative">
                  <select id="nc-district" name="district" defaultValue="" className={selectClass}>
                    <option value="" disabled>
                      İlçe seçin
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nc-priority" className={labelClass}>
                  Öncelik
                </Label>
                <div className="relative">
                  <select
                    id="nc-priority"
                    name="priority"
                    defaultValue="Normal"
                    className={selectClass}
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nc-address" className={labelClass}>
                Açık Adres
              </Label>
              <Textarea
                id="nc-address"
                name="address"
                rows={3}
                required
                placeholder="Mahalle, cadde/sokak, bina ve kapı no…"
                className="resize-none text-[13px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className={labelClass}>Varsayılan Zaman Penceresi</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    name="windowStart"
                    defaultValue="09:00"
                    aria-label="Zaman penceresi başlangıcı"
                    className={`${selectClass} font-mono`}
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <span className="shrink-0 text-[12px] font-medium text-muted-foreground">–</span>
                <div className="relative flex-1">
                  <select
                    name="windowEnd"
                    defaultValue="11:00"
                    aria-label="Zaman penceresi bitişi"
                    className={`${selectClass} font-mono`}
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>Vazgeç</DialogClose>
            <Button type="submit" form="new-customer-form" size="sm">
              Müşteriyi Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

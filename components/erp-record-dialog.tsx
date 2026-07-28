'use client'

import { Boxes, ChevronDown, Plus, Warehouse, Wallet } from 'lucide-react'
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
import {
  erpAccountTypes,
  erpStockCategories,
  erpUnits,
  erpWarehouseNames,
  type ErpRecordStatus,
} from '@/lib/erp-data'

export type ErpTabKey = 'cari' | 'stok' | 'depo'

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const selectClass =
  'h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'

const statuses: ErpRecordStatus[] = ['Aktif', 'Pasif', 'Bakımda']

const dialogMeta: Record<
  ErpTabKey,
  {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    submitLabel: string
  }
> = {
  cari: {
    title: 'Yeni Cari Kaydı',
    description: 'Muhasebe hesap kodu ve cari tipini tanımlayın.',
    icon: Wallet,
    submitLabel: 'Cariyi Kaydet',
  },
  stok: {
    title: 'Yeni Stok Kaydı',
    description: 'Ürün bilgilerini ve kritik stok eşiğini belirleyin.',
    icon: Boxes,
    submitLabel: 'Stoğu Kaydet',
  },
  depo: {
    title: 'Yeni Depo Kaydı',
    description: 'Depo lokasyonunu ve hacim kapasitesini girin.',
    icon: Warehouse,
    submitLabel: 'Depoyu Kaydet',
  },
}

/** Görsel tutarlılık için tekrar eden select sarmalayıcısı. */
function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  mono,
}: {
  id: string
  name: string
  label: string
  options: readonly string[]
  defaultValue?: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue ?? options[0]}
          className={mono ? `${selectClass} font-mono` : selectClass}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}

function TextField({
  id,
  name,
  label,
  placeholder,
  required,
  type = 'text',
  mono,
}: {
  id: string
  name: string
  label: string
  placeholder?: string
  required?: boolean
  type?: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={mono ? `${fieldClass} font-mono` : fieldClass}
      />
    </div>
  )
}

export function ErpRecordDialog({
  kind,
  triggerLabel = 'Yeni Kayıt Ekle',
  triggerClassName,
}: {
  kind: ErpTabKey
  /** Aksiyon çubuğunda kısa etiket ("Yeni") kullanmak için. */
  triggerLabel?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const meta = dialogMeta[kind]
  const Icon = meta.icon
  const formId = `erp-${kind}-form`

  // Demo formu: ERP servisine bağlanana kadar yalnızca modalı kapatır.
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
          'flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90'
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
                <Icon className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-[15px] font-semibold tracking-tight">
                  {meta.title}
                </DialogTitle>
                <DialogDescription className="text-[12px]">{meta.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
            {kind === 'cari' ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id="erp-cari-code"
                    name="code"
                    label="Cari Kodu"
                    placeholder="120.01.90"
                    required
                    mono
                  />
                  <SelectField
                    id="erp-cari-type"
                    name="type"
                    label="Cari Tipi"
                    options={erpAccountTypes}
                  />
                </div>
                <TextField
                  id="erp-cari-name"
                  name="name"
                  label="Cari Adı"
                  placeholder="Örn. Anadolu Market A.Ş."
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id="erp-cari-district"
                    name="district"
                    label="Bölge"
                    placeholder="Örn. Kadıköy"
                  />
                  <SelectField
                    id="erp-cari-status"
                    name="status"
                    label="Durum"
                    options={statuses.slice(0, 2)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="erp-cari-note" className={labelClass}>
                    Muhasebe Notu
                  </Label>
                  <Textarea
                    id="erp-cari-note"
                    name="note"
                    rows={3}
                    placeholder="Vergi dairesi, ödeme vadesi veya özel iskonto koşulları…"
                    className="resize-none text-[13px]"
                  />
                </div>
              </>
            ) : null}

            {kind === 'stok' ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id="erp-stok-code"
                    name="code"
                    label="Stok Kodu"
                    placeholder="GDA-1090"
                    required
                    mono
                  />
                  <SelectField
                    id="erp-stok-category"
                    name="category"
                    label="Kategori"
                    options={erpStockCategories}
                  />
                </div>
                <TextField
                  id="erp-stok-name"
                  name="name"
                  label="Ürün Adı"
                  placeholder="Örn. Ayçiçek Yağı 5 lt"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField id="erp-stok-unit" name="unit" label="Birim" options={erpUnits} />
                  <TextField
                    id="erp-stok-qty"
                    name="quantity"
                    label="Miktar"
                    type="number"
                    placeholder="0"
                    mono
                  />
                  <TextField
                    id="erp-stok-critical"
                    name="criticalLevel"
                    label="Kritik Eşik"
                    type="number"
                    placeholder="0"
                    mono
                  />
                </div>
                <SelectField
                  id="erp-stok-warehouse"
                  name="warehouse"
                  label="Depo"
                  options={erpWarehouseNames}
                />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="erp-stok-note" className={labelClass}>
                    Ürün Açıklaması
                  </Label>
                  <Textarea
                    id="erp-stok-note"
                    name="note"
                    rows={3}
                    placeholder="Saklama koşulu, raf ömrü veya tedarikçi bilgisi…"
                    className="resize-none text-[13px]"
                  />
                </div>
              </>
            ) : null}

            {kind === 'depo' ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id="erp-depo-code"
                    name="code"
                    label="Depo Kodu"
                    placeholder="KDK-01"
                    required
                    mono
                  />
                  <SelectField
                    id="erp-depo-status"
                    name="status"
                    label="Durum"
                    options={statuses}
                  />
                </div>
                <TextField
                  id="erp-depo-name"
                  name="name"
                  label="Depo Adı"
                  placeholder="Örn. Kadıköy Bölge Depo"
                  required
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    id="erp-depo-district"
                    name="district"
                    label="İlçe"
                    placeholder="Örn. Kadıköy"
                  />
                  <TextField
                    id="erp-depo-capacity"
                    name="capacityM3"
                    label="Kapasite (m³)"
                    type="number"
                    placeholder="0"
                    mono
                  />
                </div>
                <TextField
                  id="erp-depo-manager"
                  name="manager"
                  label="Depo Sorumlusu"
                  placeholder="Örn. Kemal Aydın"
                />
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="erp-depo-address" className={labelClass}>
                    Açık Adres
                  </Label>
                  <Textarea
                    id="erp-depo-address"
                    name="address"
                    rows={3}
                    required
                    placeholder="Mahalle, cadde/sokak, bina ve kapı no…"
                    className="resize-none text-[13px]"
                  />
                </div>
              </>
            ) : null}
          </form>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" />}>Vazgeç</DialogClose>
            <Button type="submit" form={formId} size="sm">
              {meta.submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

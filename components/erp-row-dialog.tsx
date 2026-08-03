'use client'

import { Eye, Pencil, Plus, TriangleAlert, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cellText, type ErpRow } from '@/lib/erp-modules'
import { erpAccounts } from '@/lib/erp-data'

export type ErpRowMode = 'inspect' | 'edit' | 'delete' | 'new'

interface ErpRowDialogProps {
  mode: ErpRowMode | null
  onClose: () => void
  /** Silme onaylandığında çağrılır. */
  onConfirmDelete: () => void
  columns: string[]
  row: ErpRow | null
  recordName: string
}

const fieldClass =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20'

const selectClass =
  'h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20'

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'

/** Alan adından güvenli bir input id'si üretir. */
const slug = (v: string, i: number) => `erp-field-${i}-${v.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`

// --- JENERİK FORM İÇİN SABİT VE DİNAMİK SEÇENEK LİSTELERİ ---
const uniqueDistricts = Array.from(new Set(erpAccounts.map((a) => a.district))).sort()
const priorityOptions = ['Normal', 'Yüksek', 'Düşük']
const statusOptions = ['Aktif', 'Pasif', 'İzinde', 'Arızalı', 'Bakımda', 'Beklemede', 'Onaylandı', 'Hazırlanıyor', 'Sevk Edildi', 'Teslim Edildi', 'İptal']
const cariKodlari = erpAccounts.map((a) => a.id)

/** Tekrar kullanılabilir, onChange destekli Select bileşeni */
function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  value,
  onChange,
}: {
  id: string
  name: string
  label: string
  options: readonly string[]
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className={labelClass}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue && options.includes(defaultValue) ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          className={selectClass}
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

export function ErpRowDialog({
  mode,
  onClose,
  onConfirmDelete,
  columns,
  row,
  recordName,
}: ErpRowDialogProps) {
  const open = mode !== null
  const values = row ? row.cells.map(cellText) : columns.map(() => '')

  // YENİ: Cari kodunu form içinde takip etmek için state ekliyoruz
  const cariCodeIndex = columns.findIndex((c) => c.toLowerCase() === 'cari kodu' || c.toLowerCase() === 'müşteri kodu')
  const defaultCariCode = cariCodeIndex !== -1 && mode === 'edit' ? values[cariCodeIndex] : cariKodlari[0]
  
  const [selectedCariId, setSelectedCariId] = useState(defaultCariCode)

  // Dialog her açıldığında varsayılan (veya editlenmiş) cari koduna sıfırla
  useEffect(() => {
    if (open) setSelectedCariId(defaultCariCode)
  }, [open, defaultCariCode])

  const meta =
    mode === 'inspect'
      ? {
          icon: Eye,
          title: `${recordName} Detayı`,
          description: 'Seçili kaydın tüm alanları salt okunur olarak listelenir.',
        }
      : mode === 'edit'
        ? {
            icon: Pencil,
            title: `${recordName} Kaydını Düzelt`,
            description: 'Alanları güncelleyip değişiklikleri kaydedin.',
          }
        : mode === 'delete'
          ? {
              icon: TriangleAlert,
              title: `${recordName} Kaydını Sil`,
              description: 'Bu işlem geri alınamaz.',
            }
          : {
              icon: Plus,
              title: `Yeni ${recordName} Kaydı`,
              description: 'Zorunlu alanları doldurup kaydı oluşturun.',
            }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border ${
                mode === 'delete'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-border bg-accent text-accent-foreground'
              }`}
            >
              <meta.icon className="size-4.5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[15px]">{meta.title}</DialogTitle>
              <DialogDescription className="mt-1 text-[12px]">
                {meta.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mode === 'delete' ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-[13px] leading-relaxed text-foreground">
              <span className="font-mono font-bold">{row?.id}</span> kodlu {recordName.toLowerCase()}{' '}
              kaydı kalıcı olarak silinecek. Bağlı hareketler varsa arşive taşınır.
            </p>
          </div>
        ) : mode === 'inspect' ? (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {columns.map((col, i) => (
              <div key={col} className="min-w-0 rounded-md border border-border bg-secondary/40 p-2.5">
                <dt className={labelClass}>{col}</dt>
                <dd className="mt-1 break-words text-[13px] font-medium text-foreground">
                  {values[i] || '—'}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <form
            id="erp-row-form"
            onSubmit={(e) => {
              e.preventDefault()
              onClose()
            }}
            className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2"
          >
            {columns.map((col, i) => {
              const lowerCol = col.toLocaleLowerCase('tr-TR')
              
              const isDistrict = lowerCol.includes('ilçe') || lowerCol.includes('bölge')
              const isPriority = lowerCol.includes('öncelik')
              const isStatus = lowerCol.includes('durum')
              const isCariKodu = lowerCol === 'cari kodu' || lowerCol === 'müşteri kodu'
              const isMusteriAdi = lowerCol === 'müşteri adı' || lowerCol === 'cari adı'

              const isHacim = lowerCol.includes('hacim') || lowerCol.includes('ağırlık') || lowerCol.includes('kapasite')
              const isPencere = lowerCol.includes('pencere') || lowerCol.includes('saat')

              // 1. CARİ KODU SEÇİMİ
              if (isCariKodu) {
                return (
                  <SelectField
                    key={col}
                    id={slug(col, i)}
                    name={slug(col, i)}
                    label={col}
                    options={cariKodlari}
                    value={selectedCariId}
                    onChange={(e) => setSelectedCariId(e.target.value)}
                  />
                )
              }

              // 2. OTOMATİK DOLDURULAN MÜŞTERİ ADI
              if (isMusteriAdi) {
                const matchedAccount = erpAccounts.find((a) => a.id === selectedCariId)
                const displayName = matchedAccount ? matchedAccount.name : ''
                
                return (
                  <div key={col} className="flex min-w-0 flex-col gap-1.5">
                    <Label htmlFor={slug(col, i)} className={labelClass}>
                      {col}
                    </Label>
                    <input
                      id={slug(col, i)}
                      name={slug(col, i)}
                      value={displayName}
                      readOnly
                      tabIndex={-1}
                      className={`${fieldClass} cursor-not-allowed bg-secondary/40 text-muted-foreground`}
                    />
                  </div>
                )
              }

              // 3. DİĞER AÇILIR LİSTELER
              if (isDistrict || isPriority || isStatus) {
                let options: string[] = []
                if (isDistrict) options = uniqueDistricts
                else if (isPriority) options = priorityOptions
                else if (isStatus) options = statusOptions

                return (
                  <SelectField
                    key={col}
                    id={slug(col, i)}
                    name={slug(col, i)}
                    label={col}
                    options={options}
                    defaultValue={mode === 'edit' ? values[i] : undefined}
                  />
                )
              }

              // 4. NORMAL / KISITLI İNPUTLAR
              return (
                <div key={col} className="flex min-w-0 flex-col gap-1.5">
                  <Label htmlFor={slug(col, i)} className={labelClass}>
                    {col}
                  </Label>
                  <input
                    id={slug(col, i)}
                    name={slug(col, i)}
                    defaultValue={mode === 'edit' ? values[i] : ''}
                    placeholder={isPencere ? "09:00 - 17:00" : col}
                    type={isHacim ? 'number' : 'text'}
                    step={isHacim ? 'any' : undefined}
                    pattern={isPencere ? "^[0-9]{2}:[0-9]{2}\\s*-\\s*[0-9]{2}:[0-9]{2}$" : undefined}
                    title={isPencere ? "Lütfen 09:00 - 17:00 formatında saat aralığı giriniz." : undefined}
                    className={fieldClass}
                  />
                </div>
              )
            })}
          </form>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {mode === 'inspect' ? 'Kapat' : 'İptal'}
          </Button>
          {mode === 'inspect' ? null : mode === 'delete' ? (
            <Button
              type="button"
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Kaydı Sil
            </Button>
          ) : (
            <Button type="submit" form="erp-row-form">
              {mode === 'edit' ? 'Değişiklikleri Kaydet' : 'Kaydet'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
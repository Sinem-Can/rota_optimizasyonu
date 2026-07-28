'use client'

import { Eye, Pencil, Plus, TriangleAlert } from 'lucide-react'
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

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'

/** Alan adından güvenli bir input id'si üretir. */
const slug = (v: string, i: number) => `erp-field-${i}-${v.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`

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
            {columns.map((col, i) => (
              <div key={col} className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor={slug(col, i)} className={labelClass}>
                  {col}
                </Label>
                <input
                  id={slug(col, i)}
                  name={slug(col, i)}
                  defaultValue={mode === 'edit' ? values[i] : ''}
                  placeholder={col}
                  className={fieldClass}
                />
              </div>
            ))}
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

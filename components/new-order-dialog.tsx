'use client'

import { useState, useMemo } from 'react'
import { Plus, X, Box, Scale } from 'lucide-react'
import { erpStockItems } from '@/lib/erp-data'
import { erpModules } from '@/lib/erp-modules'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { StopDto } from '@/lib/route-data'

interface NewOrderDialogProps {
  triggerLabel: string
  triggerClassName?: string
  onAddOrder?: (newOrder: StopDto) => void
}

// Güvenli tip tanımı
interface CariItem {
  id: string
  name: string
  code: string
}

export function NewOrderDialog({ triggerLabel, triggerClassName, onAddOrder }: NewOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])
  const [selectedCariId, setSelectedCariId] = useState('')

  // Projedeki cari modülünden verileri güvenle çekiyoruz
  // erpModules üzerinden cariler view'ına ulaşıyoruz.
  // Projedeki cari modülünden verileri çekiyoruz
  // Projedeki cari modülünden verileri güvenle çekiyoruz
  // YENİ: Bütün modülleri ve sayfaları tarayıp "Cari" sayfasını otomatik buluyoruz
  const allViews = erpModules.flatMap(m => m.views)
  const carisView = allViews.find(v => v.label.includes('Cari') || v.key.includes('cari'))

  const carisList: CariItem[] = carisView?.rows?.map((r: any) => {
    const codeCell = r.cells[0]
    const nameCell = r.cells[1]

    return {
      id: r.id,
      name: nameCell?.v || r.id,
      code: codeCell?.sub || codeCell?.v || r.id
    }
  }) || []

  const { totalKg, totalM3 } = useMemo(() => {
    const adet = selectedStocks.length
    const kg = adet * 12.5
    const m3 = adet * 0.05

    return {
      totalKg: kg,
      totalM3: m3.toFixed(2)
    }
  }, [selectedStocks])

  const handleClose = () => {
    setOpen(false)
    setSelectedStocks([])
    setSelectedCariId('')
  }

  const handleSave = () => {
    if (!selectedCariId) {
      toast.error('Lütfen bir müşteri (Cari) seçin!')
      return
    }

    if (selectedStocks.length === 0) {
      toast.error('Lütfen siparişe en az bir ürün ekleyin!')
      return
    }

    const seciliCari = carisList.find((c: CariItem) => c.id === selectedCariId)

    const yeniSiparisData = {
      cariId: selectedCariId,
      musteriAdi: seciliCari?.name,
      urunSayisi: selectedStocks.length,
      toplamKilo: totalKg,
      toplamHacim: totalM3,
      durum: 'Beklemede'
    }

    console.log("Sisteme Gönderilen Veri:", yeniSiparisData)

    if (onAddOrder) {
      onAddOrder({
        id: `ST-${Date.now()}`,
        sequence: 0,
        customerName: seciliCari?.name || 'Bilinmiyor',
        address: 'Bilinmeyen Adres',
        district: 'Merkez',
        eta: '10:00',
        windowStart: '09:00',
        windowEnd: '17:00',
        serviceMinutes: 15,
        weightKg: totalKg,
        volumeM3: parseFloat(totalM3),
        status: 'pending',
        priority: 'Normal',
        phone: '0555 000 0000',
        orderNo: `ORD-${Date.now()}`,
        x: 50,
        y: 50,
      })
    }

    toast.success('Sipariş başarıyla oluşturuldu!', {
      description: `${yeniSiparisData.musteriAdi} için ${totalKg} kg yük sisteme eklendi.`
    })

    handleClose()
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <Plus className="size-4" />
        {triggerLabel}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">

        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Yeni Sipariş Oluştur</h2>
            <p className="text-sm text-muted-foreground">Müşteri seçin ve stoktan eklenecek ürünleri belirleyin.</p>
          </div>
          <button onClick={handleClose} className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">Müşteri (Cari) Seçimi</label>
                <select
                  value={selectedCariId}
                  onChange={(e) => setSelectedCariId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="" disabled>Lütfen Bir Müşteri Seçin...</option>
                  {carisList.map((cari: CariItem) => (
                    <option key={cari.id} value={cari.id}>
                      {cari.name} ({cari.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase text-muted-foreground">Teslimat Penceresi</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  defaultValue="09:00 - 17:00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[11px] font-semibold uppercase text-muted-foreground">
                <span>Siparişe Eklenecek Ürünler</span>
                <span>{selectedStocks.length} Seçili</span>
              </label>

              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2 bg-background/50">
                {erpStockItems.map((item) => {
                  const isOutOfStock = item.quantity <= 0
                  const isSelected = selectedStocks.includes(item.id)

                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 transition-colors",
                        isOutOfStock ? "cursor-not-allowed border-transparent opacity-60 bg-secondary/20" : "cursor-pointer border-transparent hover:bg-secondary/50",
                        isSelected && !isOutOfStock ? "border-primary/50 bg-primary/5" : ""
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={isOutOfStock}
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStocks([...selectedStocks, item.id])
                          else setSelectedStocks(selectedStocks.filter(id => id !== item.id))
                        }}
                        className="size-4 cursor-pointer rounded border-border disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", isOutOfStock ? "text-muted-foreground line-through" : "text-foreground")}>
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{item.code} • {item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold", isOutOfStock ? "text-destructive" : "text-success")}>
                          {isOutOfStock ? "Stokta Yok" : `${item.quantity} ${item.unit}`}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-4">

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Scale className="size-4" />
              <span className="font-mono font-medium text-foreground">{totalKg} <span className="text-xs text-muted-foreground">kg</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Box className="size-4" />
              <span className="font-mono font-medium text-foreground">{totalM3} <span className="text-xs text-muted-foreground">m³</span></span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleClose} className="rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary">
              İptal
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Siparişi Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
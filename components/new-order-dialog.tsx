"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function NewOrderDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    setIsOpen(false)
    toast.success("Sipariş başarıyla havuza eklendi!", {
      description: "Sipariş numarası: SP-99842",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex w-full items-center justify-center gap-1.5 rounded-md border border-success/40 bg-transparent py-2 text-[12px] font-semibold text-success transition-colors hover:bg-success/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40">
        <Plus className="size-3.5 shrink-0" />
        Acil Sipariş Ekle
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Sipariş Ekle</DialogTitle>
          <DialogDescription>
            Sisteme manuel olarak eklenecek teslimatın detaylarını girin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="customer" className="text-right text-sm font-medium">
              Müşteri
            </label>
            <input id="customer" placeholder="Örn: Ataşehir Migros" className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="weight" className="text-right text-sm font-medium">
              Ağırlık (kg)
            </label>
            <input id="weight" type="number" min="1" placeholder="Örn: 250" className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Zaman
            </label>
            <div className="col-span-3 flex items-center gap-2">
              <input type="time" defaultValue="14:00" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              <span className="text-muted-foreground">-</span>
              <input type="time" defaultValue="16:00" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>

          {/* Yeni Eklenen Öncelik Alanı */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right text-sm font-medium">
              Öncelik
            </label>
            <select id="priority" defaultValue="Yüksek" className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="Yüksek">Yüksek</option>
              <option value="Normal">Normal</option>
              <option value="Düşük">Düşük</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <button type="button" onClick={() => setIsOpen(false)} className="h-9 px-4 py-2 rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            İptal
          </button>
          <button type="button" onClick={handleSave} className="h-9 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow">
            Havuza Gönder
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import type { StopDto } from "@/lib/route-data"

interface NewOrderDialogProps {
  onAddOrder?: (order: StopDto) => void
}

export function NewOrderDialog({ onAddOrder }: NewOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Form verilerini tutacağımız state'ler
  const [customerName, setCustomerName] = useState("")
  const [weight, setWeight] = useState("250")
  const [volume, setVolume] = useState("2.5")
  const [windowStart, setWindowStart] = useState("14:00")
  const [windowEnd, setWindowEnd] = useState("16:00")
  const [priority, setPriority] = useState("Yüksek")

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error("Lütfen müşteri adını giriniz.")
      return
    }

    // Yeni sipariş objesini oluşturuyoruz
    const orderNo = `SP-${Math.floor(10000 + Math.random() * 90000)}`
    const newOrder: StopDto = {
      id: `UA-MANUAL-${Date.now()}`,
      sequence: 0, // Havuzda sıra numarası önemsiz
      customerName: customerName,
      address: "Manuel Giriş",
      district: "Merkez",
      eta: windowStart,
      windowStart: windowStart,
      windowEnd: windowEnd,
      serviceMinutes: 15,
      weightKg: parseInt(weight) || 0,
      volumeM3: parseFloat(volume) || 0,
      status: "pending",
      priority: priority as any,
      phone: "0555 000 0000",
      orderNo: orderNo,
      x: 52 + Math.random() * 5, // Haritada depoya yakın rastgele bir yere düşsün
      y: 52 + Math.random() * 5,
    }

    // TaskPanel'e yeni siparişi gönderiyoruz
    if (onAddOrder) {
      onAddOrder(newOrder)
    }

    setIsOpen(false)
    setCustomerName("") // Formu temizle
    
    toast.success("Acil sipariş havuza eklendi!", {
      description: `${customerName} (Sipariş No: ${orderNo}) atanmayı bekliyor.`,
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
            Sisteme manuel olarak eklenecek teslimatın detaylarını ve algoritma kısıtlarını girin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="customer" className="text-right text-sm font-medium">
              Müşteri
            </label>
            <input 
              id="customer" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Örn: Ataşehir Migros" 
              className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="weight" className="text-right text-sm font-medium">
              Ağırlık (kg)
            </label>
            <input 
              id="weight" 
              type="number" 
              min="1" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Örn: 250" 
              className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="volume" className="text-right text-sm font-medium">
              Hacim (m³)
            </label>
            <input 
              id="volume" 
              type="number" 
              step="0.1" 
              min="0.1" 
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Örn: 2.5" 
              className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Zaman
            </label>
            <div className="col-span-3 flex items-center gap-2">
              <input 
                type="time" 
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" 
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="time" 
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono" 
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right text-sm font-medium">
              Öncelik
            </label>
            <select 
              id="priority" 
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
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
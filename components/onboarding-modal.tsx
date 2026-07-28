"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Map, Server, Wrench } from "lucide-react"

export function OnboardingModal() {
  // Modalın açık mı kapalı mı olduğunu tutan state (SwiftUI'daki @State isPresented gibi)
  const [isOpen, setIsOpen] = useState(false)

  // Sayfa yüklendiğinde (onAppear gibi) yarım saniye bekleyip modalı açan fonksiyon
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Yeni Nesil Komuta Merkezine Hoş Geldiniz
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            Sistemi kullanmaya başlamadan önce öne çıkan 3 kritik özelliğe göz atın.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Harita Üzerinden Planlama</h4>
              <p className="text-sm text-muted-foreground">Sürükle-bırak ile rotaları optimize edin ve zaman pencerelerini yönetin.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Server className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Merkezi ERP Entegrasyonu</h4>
              <p className="text-sm text-muted-foreground">Cari, stok ve fatura verilerini LioXERP uyumlu tek noktadan yönetin.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Wrench className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold">Anlık Arıza Takibi</h4>
              <p className="text-sm text-muted-foreground">Araç arızalarını anında bildirip kalan siparişleri açığa düşürün.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
            Hadi Başlayalım
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
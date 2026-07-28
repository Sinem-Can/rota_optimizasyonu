"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ListTodo, MapPin, PlayCircle } from "lucide-react"

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Operasyon Ekranına Hoş Geldiniz
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            Günlük rota planlamanızı başlatmak için aşağıdaki 3 adımı izleyin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <ListTodo className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">1. Siparişleri Kontrol Edin</h4>
              <p className="text-sm text-muted-foreground">Sol paneldeki "Atanmamışlar" listesinden bekleyen teslimatları ve aciliyet durumlarını inceleyin.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">2. Araçlara Görev Dağıtın</h4>
              <p className="text-sm text-muted-foreground">Siparişleri sürükleyerek veya harita üzerinden seçerek uygun kapasitedeki araçlara atayın.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <PlayCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-semibold">3. Rotaları Başlatın</h4>
              <p className="text-sm text-muted-foreground">Atamalar bitince üstteki "Rotaları Optimize Et" butonuna basarak şoförlerin iş emirlerini sisteme gönderin.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
            Planlamaya Başla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
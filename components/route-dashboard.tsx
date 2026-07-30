'use client'

import { useCallback, useState } from 'react'
import { DetailPanel } from '@/components/detail-panel'
import { ErpPanel } from '@/components/erp-panel'
import { MapPanel } from '@/components/map-panel'
import { TaskPanel } from '@/components/task-panel'
import { TimelinePanel } from '@/components/timeline-panel'
import { TopBar, type TabKey } from '@/components/top-bar'
import { drivers, type StopDto } from '@/lib/route-data'
import { toast } from "sonner"

export function RouteDashboard() {
  // Varsayılan seçim: gecikme riski taşıyan durak
  const [selection, setSelection] = useState<{ stop: StopDto; driverId: string }>(() => {
    const driver = drivers[1]
    return { stop: driver.stops[2], driverId: driver.id }
  })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('planlama')
  // 06:00 cut-off sonrası havuz kilitli başlar; acil müdahale ile geçici olarak açılabilir.
  const [isPoolLocked, setIsPoolLocked] = useState(true)

  const handleSelectStop = useCallback((stop: StopDto, driverId: string) => {
    setSelection({ stop, driverId })
  }, [])

  const handleOptimize = useCallback(() => {
    // Havuz kilitliyse hata bildirimi ver
    if (isPoolLocked) {
      toast.error("Havuz kilitli! Optimizasyon için önce kilidi açın.")
      return
    }
    
    setIsOptimizing(true)
    // İşlem başlarken mavi bir bilgi mesajı çıkar
    toast.info("Yapay zeka rotaları hesaplıyor...", { duration: 2000 })
    
    // 2.2 saniye sonra (sanki backend'den cevap gelmiş gibi)
    window.setTimeout(() => {
      setIsOptimizing(false)
      // İşlem bitince o jilet gibi yeşil başarı mesajını çıkar
      toast.success("Rotalar başarıyla optimize edildi!")
    }, 2200)
  }, [isPoolLocked])

  // TypeScript sussun ve hata gitsin diye eklediğimiz boş fonksiyon
  const handleImportTasks = () => {}

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onImportTasks={handleImportTasks}
      />

      {activeTab === 'erp' ? (
        <ErpPanel />
      ) : (
        <>
          <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[30%_50%_20%]">
            <TaskPanel
              selectedStopId={selection.stop.id}
              onSelectStop={handleSelectStop}
              isOptimizing={isOptimizing}
              onOptimize={handleOptimize}
              isPoolLocked={isPoolLocked}
              onPoolLockChange={setIsPoolLocked}
            />
            <MapPanel
              selectedStopId={selection.stop.id}
              onSelectStop={handleSelectStop}
              isOptimizing={isOptimizing}
            />
            <DetailPanel stop={selection.stop} driverId={selection.driverId} />
          </main>

          <TimelinePanel selectedStopId={selection.stop.id} onSelectStop={handleSelectStop} />
        </>
      )}
    </div>
  )
}

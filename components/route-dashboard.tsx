'use client'

import { useCallback, useState } from 'react'
import { DetailPanel } from '@/components/detail-panel'
import { ErpPanel } from '@/components/erp-panel'
import { MapPanel } from '@/components/map-panel'
import { TaskPanel } from '@/components/task-panel'
import { TimelinePanel } from '@/components/timeline-panel'
import { TopBar, type TabKey } from '@/components/top-bar'
import { drivers, type StopDto } from '@/lib/route-data'

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
    // Havuz kilitliyken manuel optimizasyon tetiklenemez.
    if (isPoolLocked) return
    setIsOptimizing(true)
    // Gerçek uygulamada: POST /api/v1/optimization/solve (C# .NET)
    window.setTimeout(() => setIsOptimizing(false), 2200)
  }, [isPoolLocked])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />

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

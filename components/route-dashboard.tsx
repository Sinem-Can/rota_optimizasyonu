'use client'

import { useCallback, useState, useEffect } from 'react'
import { DetailPanel } from '@/components/detail-panel'
import { ErpPanel } from '@/components/erp-panel'
import { MapPanel } from '@/components/map-panel'
import { TaskPanel } from '@/components/task-panel'
import { TimelinePanel } from '@/components/timeline-panel'
import { TopBar, type TabKey } from '@/components/top-bar'
import { drivers, unassignedTasks, type StopDto, type DriverDto } from '@/lib/route-data'
import { toast } from "sonner"

export function RouteDashboard() {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('planlama')
  const [searchQuery, setSearchQuery] = useState('')

  const [localDrivers, setLocalDrivers] = useState<DriverDto[]>([])
  const [localUnassigned, setLocalUnassigned] = useState<StopDto[]>([])

  // Türetilmiş state: Seçili araç ve durak
  const activeDriver = localDrivers.find(d => d.id === selectedDriverId) || localDrivers[0]
  const activeStop = activeDriver?.stops?.find(s => s.id === selectedStopId) || activeDriver?.stops?.[0] || null
  const activeStopId = activeStop?.id || null
  const activeDriverId = activeDriver?.id || null

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/initial-state')
        if (response.ok) {
          const data = await response.json()
          setLocalDrivers(data.drivers)
          setLocalUnassigned(data.unassigned)
        }
      } catch (error) {
        console.error("Başlangıç verisi çekilemedi:", error)
        setLocalUnassigned(unassignedTasks as unknown as StopDto[])
        setLocalDrivers(drivers)
      }
    }
    fetchInitialState()
  }, [])

  const handleSelectStop = useCallback((stop: StopDto, driverId: string) => {
    setSelectedStopId(stop.id)
    setSelectedDriverId(driverId)
  }, [])

  const handleOptimize = async () => {
    setIsOptimizing(true)
    toast.info("Yapay zeka rotaları hesaplıyor...", { duration: 2000 })
    
    try {
      const response = await fetch('http://localhost:5000/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Optimizasyon motoru bir hata döndürdü.')
      }

      const optimizedDrivers = await response.json()
      setLocalDrivers(optimizedDrivers)
      setLocalUnassigned([])
      toast.success("Rotalar başarıyla oluşturuldu!", {
        description: "C# OR-Tools motorundan veriler çekildi.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Optimizasyon Hatası", {
        description: "Sunucu ile bağlantı kurulamadı veya bir hata oluştu.",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  // TypeScript sussun ve hata gitsin diye eklediğimiz boş fonksiyon
  const handleImportTasks = () => {}

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onImportTasks={handleImportTasks}
        drivers={localDrivers}
        onSearch={setSearchQuery}
      />

      {activeTab === 'erp' ? (
        <ErpPanel />
      ) : (
        <>
          <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[30%_50%_20%]">
            <TaskPanel
              selectedStopId={activeStopId}
              onSelectStop={handleSelectStop}
              isOptimizing={isOptimizing}
              onOptimize={handleOptimize}
              drivers={localDrivers}
              unassigned={localUnassigned}
              setUnassigned={setLocalUnassigned}
              setDrivers={setLocalDrivers}
              searchQuery={searchQuery}
            />
            <MapPanel
              selectedStopId={activeStopId}
              onSelectStop={handleSelectStop}
              isOptimizing={isOptimizing}
              drivers={localDrivers}
            />
            <DetailPanel stop={activeStop} driverId={activeDriverId} drivers={localDrivers} />
          </main>

          <TimelinePanel 
            selectedStopId={activeStopId} 
            onSelectStop={handleSelectStop} 
            drivers={localDrivers}
          />
        </>
      )}
    </div>
  )
}

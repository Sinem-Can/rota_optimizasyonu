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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('planlama')
  const [searchQuery, setSearchQuery] = useState('')

  const [localDrivers, setLocalDrivers] = useState<DriverDto[]>(drivers)
  const [localUnassigned, setLocalUnassigned] = useState<StopDto[]>(unassignedTasks as unknown as StopDto[])

  // Türetilmiş state: Seçili araç ve durak
  const activeDriver = selectedDriverId ? localDrivers.find(d => d.id === selectedDriverId) ?? null : null
  const activeStop = activeDriver && selectedStopId ? activeDriver.stops.find(s => s.id === selectedStopId) ?? null : null
  const activeStopId = selectedStopId
  const activeDriverId = selectedDriverId

const handleClearSelection = useCallback(() => { setSelectedStopId(null); setSelectedDriverId(null) }, []); const handleSelectStop = useCallback((stop: StopDto, driverId: string) => { setSelectedStopId(stop.id); setSelectedDriverId(driverId) }, []); useEffect(() => { void (async () => { try { const response = await fetch(apiUrl + "/api/initial-state"); if (!response.ok) throw new Error(`Başlangıç verisi yüklenemedi`); const data = await response.json(); if (!Array.isArray(data.drivers) || data.drivers.length === 0) throw new Error(`Boş başlangıç verisi`); const colorKeys = [`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`]; const coloredDrivers = data.drivers.map((driver: any, index: number) => ({ ...driver, colorKey: colorKeys[index % colorKeys.length] })); setLocalDrivers(coloredDrivers); setLocalUnassigned(data.unassigned ?? []); } catch (error) { console.error(`Başlangıç verisi çekilemedi:`, error); setLocalUnassigned(unassignedTasks as unknown as StopDto[]); setLocalDrivers(drivers); } })() }, [apiUrl])

  const handleOptimize = async () => {
    setIsOptimizing(true)
    toast.info("Yapay zeka rotaları hesaplıyor...", { duration: 2000 })
    
    try {
      const response = await fetch(`${apiUrl}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Optimizasyon motoru bir hata döndürdü.')
      }

      const optimizedDrivers = await response.json()
      // RENK MÜDAHALESİ: Optimizasyon sonrası gelen yeni rotalara da renkleri dağıtıyoruz
      const colorKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
      const coloredDrivers = optimizedDrivers.map((driver: any, index: number) => ({
        ...driver,
        colorKey: colorKeys[index % colorKeys.length]
      }))
      setLocalDrivers(coloredDrivers)
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
            <DetailPanel stop={activeStop} driverId={activeDriverId} drivers={localDrivers} onClose={handleClearSelection} />
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

'use client'

import { useCallback, useState, useEffect } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { DetailPanel } from '@/components/detail-panel'
import { ErpPanel } from '@/components/erp-panel'
import { MapPanel } from '@/components/map-panel'
import { TaskPanel } from '@/components/task-panel'
import { TimelinePanel } from '@/components/timeline-panel'
import { TopBar, type TabKey } from '@/components/top-bar'
import { drivers, unassignedTasks, type StopDto, type DriverDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'
import { toast } from "sonner"

export function RouteDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('planlama')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false)

  const [localDrivers, setLocalDrivers] = useState<DriverDto[]>([])
  const [localUnassigned, setLocalUnassigned] = useState<StopDto[]>([])

  // Türetilmiş state: Seçili araç ve durak
  const activeDriver = selectedDriverId ? localDrivers.find(d => d.id === selectedDriverId) ?? null : null
  const activeStop = activeDriver && selectedStopId ? activeDriver.stops.find(s => s.id === selectedStopId) ?? null : null
  const activeStopId = selectedStopId
  const activeDriverId = selectedDriverId

  const handleClearSelection = useCallback(() => {
    setSelectedStopId(null)
    setSelectedDriverId(null)
  }, [])

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/initial-state`)
        if (!response.ok) throw new Error('Başlangıç verisi yüklenemedi.')

        const data = await response.json()
        if (!Array.isArray(data.drivers) || data.drivers.length === 0) {
          throw new Error('Başlangıç verisi boş geldi.')
        }

        const colorKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
        const coloredDrivers = data.drivers.map((driver: DriverDto, index: number) => ({
          ...driver,
          colorKey: colorKeys[index % colorKeys.length],
        }))
        setLocalDrivers(coloredDrivers)
        setLocalUnassigned(data.unassigned ?? [])
      } catch (error) {
        console.error("Başlangıç verisi çekilemedi:", error)
        setLocalUnassigned(unassignedTasks as unknown as StopDto[])
        setLocalDrivers(drivers)
      }
    }
    fetchInitialState()
  }, [apiUrl])

  const handleSelectStop = useCallback((stop: StopDto, driverId: string) => {
    setSelectedStopId(stop.id)
    setSelectedDriverId(driverId)
  }, [])

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
      const colorKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
      const coloredDrivers = optimizedDrivers.map((driver: DriverDto, index: number) => ({
        ...driver,
        colorKey: colorKeys[index % colorKeys.length],
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
          <main
            className={cn(
              'grid min-h-0 flex-1 grid-cols-1 transition-[grid-template-columns] duration-300 ease-in-out',
              isLeftPanelOpen
                ? 'lg:grid-cols-[30%_50%_20%]'
                : 'lg:grid-cols-[44px_minmax(0,1fr)_20%]',
            )}
          >
            {isLeftPanelOpen ? (
              <aside className="relative min-w-0 overflow-hidden border-r border-border">
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
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(false)}
                  aria-label="Araç panelini daralt"
                  title="Araç panelini daralt"
                  className="absolute right-2 top-2 z-20 grid size-8 place-items-center rounded-md border border-border bg-card/95 text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PanelLeftClose className="size-4" />
                </button>
              </aside>
            ) : (
              <aside className="flex min-w-0 justify-center border-r border-border bg-card pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(true)}
                  aria-label="Araç panelini aç"
                  title="Araç panelini aç"
                  className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              </aside>
            )}
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
            isOpen={isBottomPanelOpen}
            onToggle={() => setIsBottomPanelOpen((isOpen) => !isOpen)}
          />
        </>
      )}
    </div>
  )
}

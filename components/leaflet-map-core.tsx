'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { driverTheme, getCoordinatesForStop, getCoordinatesForDepot, type StopDto, type DriverDto } from '@/lib/route-data'
import { fetchRealRoadRoute, fetchExactLocations } from '@/lib/route-service'

interface LeafletMapCoreProps {
    drivers: DriverDto[]
    selectedStopId: string | null
    activeDriverId?: string
    onSelectStop: (stop: StopDto, driverId: string) => void
}

function MapResizeHandler() {
    const map = useMap()
    useEffect(() => {
        const container = map.getContainer()
        if (!container) return
        const observer = new ResizeObserver(() => {
            setTimeout(() => { map.invalidateSize() }, 100)
        })
        observer.observe(container)
        return () => observer.disconnect()
    }, [map])
    return null
}

function MapZoomObserver({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    useMapEvents({
        zoomend: (e) => { onZoomChange(e.target.getZoom()) },
    })
    return null
}

export default function LeafletMapCore({
    drivers,
    selectedStopId,
    activeDriverId,
    onSelectStop,
}: LeafletMapCoreProps) {
    const istanbulCenter: [number, number] = [41.0082, 28.9784]
    const [currentZoom, setCurrentZoom] = useState<number>(11)

    // Veritabanından gelen dinamik konum sözlüğü state'i
    const [exactLocations, setExactLocations] = useState<Record<string, { lat: number; lng: number }>>({})

    // Her sürücünün gerçek yol koordinatlarını tutacağımız state
    const [routeGeometries, setRouteGeometries] = useState<Record<string, [number, number][]>>({})

    // 1. Bileşen ilk açıldığında veritabanından koordinatları çek
    useEffect(() => {
        fetchExactLocations().then((data) => {
            if (Object.keys(data).length > 0) {
                setExactLocations(data)
            }
        })
    }, [])

    // Yardımcı: Durum koordinatlarını veritabanı öncelikli çözümler
    const resolveStopCoords = (stop: StopDto) => {
        if (stop?.lat && stop?.lng) {
            return { lat: Number(stop.lat), lng: Number(stop.lng) }
        }
        const targetKey = stop?.cariKod || stop?.id
        const cleanKey = targetKey ? String(targetKey).trim().toUpperCase() : ''
        if (cleanKey && exactLocations[cleanKey]) {
            return exactLocations[cleanKey]
        }
        return getCoordinatesForStop(stop)
    }

    // Yardımcı: Depo koordinatlarını veritabanı öncelikli çözümler
    const resolveDepotCoords = (depotName: string) => {
        const name = (depotName || '').toLowerCase()
        if (name.includes('üsküdar') && exactLocations['DP002']) {
            return exactLocations['DP002']
        }
        if (exactLocations['DP001']) {
            return exactLocations['DP001']
        }
        return getCoordinatesForDepot(depotName)
    }

    // 2. Sürücüler veya veritabanı konumları yüklendiğinde OSRM'den gerçek yolları çekelim
    useEffect(() => {
        async function loadAllRoutes() {
            const newGeometries: Record<string, [number, number][]> = {}

            for (const driver of drivers) {
                const depotCoords = resolveDepotCoords(driver.depotName || 'Avcılar')
                const stopCoordsList = driver.stops.map((stop) => resolveStopCoords(stop))

                // Rota sırası: Depo -> Duraklar -> Depo (Döngü)
                const fullWaypoints = [
                    { lat: depotCoords.lat, lng: depotCoords.lng },
                    ...stopCoordsList,
                    { lat: depotCoords.lat, lng: depotCoords.lng }
                ]

                const realPoints = await fetchRealRoadRoute(fullWaypoints)
                newGeometries[driver.id] = realPoints
            }

            setRouteGeometries(newGeometries)
        }

        loadAllRoutes()
    }, [drivers, exactLocations])

    const depotScale = currentZoom < 11 ? Math.max(0.25, Math.pow(currentZoom / 11, 2)) : 1

    return (
        <MapContainer
            center={istanbulCenter}
            zoom={11}
            scrollWheelZoom={true}
            className="size-full z-10"
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapResizeHandler />
            <MapZoomObserver onZoomChange={setCurrentZoom} />

            {/* GERÇEK KARAYOLU ROTA ÇİZGİLERİ */}
            {drivers.map((driver) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false
                const positions = routeGeometries[driver.id] || []

                if (positions.length === 0) return null

                return (
                    <Polyline
                        key={`route-${driver.id}`}
                        positions={positions}
                        pathOptions={{
                            color: theme.cssVar,
                            weight: activeDriverId === driver.id ? 5 : 3,
                            opacity: isFaded ? 0.15 : 0.85,
                        }}
                    />
                )
            })}

            {/* MERKEZ DEPOLAR */}
            {[
                { name: 'Avcılar Merkez Depo', ...resolveDepotCoords('Avcılar') },
                { name: 'Üsküdar Merkez Depo', ...resolveDepotCoords('Üsküdar') }
            ].map((depot) => (
                <Marker
                    key={depot.name}
                    position={[depot.lat, depot.lng]}
                    icon={L.divIcon({
                        className: 'custom-depot-marker',
                        html: `
              <div style="transform: scale(${depotScale}); transform-origin: center;" class="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-md transition-transform duration-200">
                <svg class="size-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span class="text-[10px] font-bold tracking-wider text-foreground">${depot.name}</span>
              </div>
            `,
                        iconSize: [140, 32],
                        iconAnchor: [70, 16],
                    })}
                />
            ))}

            {/* DURAK PİNLERİ */}
            {drivers.map((driver) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false

                return driver.stops.map((stop) => {
                    const coords = resolveStopCoords(stop)
                    const isSelected = selectedStopId === stop.id
                    const isRisk = stop.status === 'risk'

                    const customHtmlPin = L.divIcon({
                        className: 'custom-tailwind-marker',
                        html: `
              <div class="group relative transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'} ${isFaded ? 'opacity-25 grayscale saturate-0' : 'opacity-100'}">
                <span class="relative flex flex-col items-center">
                  <span class="grid size-7 place-items-center rounded-full font-mono text-[11px] font-bold shadow-md text-white ${theme.solid} ${isSelected ? 'ring-4 ring-foreground ring-offset-1 ring-offset-background' : 'ring-2 ring-background/40'}">
                    ${stop.sequence}
                  </span>
                  <span class="-mt-0.5 size-2 rotate-45 border-b-2 border-r-2 border-background ${theme.solid}"></span>
                  ${isRisk && !isFaded ? `
                    <span class="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full border border-background bg-destructive shadow">
                      <span class="text-[9px] text-white font-bold">!</span>
                    </span>
                  ` : ''}
                </span>
              </div>
            `,
                        iconSize: [28, 40],
                        iconAnchor: [14, 40],
                        popupAnchor: [0, -40],
                    })

                    return (
                        <Marker
                            key={stop.id}
                            position={[coords.lat, coords.lng]}
                            icon={customHtmlPin}
                            eventHandlers={{
                                click: () => onSelectStop(stop, driver.id),
                            }}
                        >
                            <Popup>
                                <div className="font-sans text-xs">
                                    <strong>{stop.customerName}</strong>
                                    <p className="text-muted-foreground">{stop.address}</p>
                                    <p className="mt-1 font-semibold">Sıra: {stop.sequence} · ETA: {stop.eta}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })
            })}
        </MapContainer>
    )
}
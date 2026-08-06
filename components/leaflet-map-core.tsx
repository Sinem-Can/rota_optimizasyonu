'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { driverTheme, getCoordinatesForStop, getCoordinatesForDepot, type StopDto, type DriverDto } from '@/lib/route-data'

interface LeafletMapCoreProps {
    drivers: DriverDto[]
    selectedStopId: string | null
    activeDriverId?: string
    onSelectStop: (stop: StopDto, driverId: string) => void
}

/** ✨ Konteyner boyut değişikliklerini (panel açılma/kapanma) algılayıp haritayı tazele yen gözlemci */
function MapResizeHandler() {
    const map = useMap()

    useEffect(() => {
        const container = map.getContainer()
        if (!container) return

        const observer = new ResizeObserver(() => {
            setTimeout(() => {
                map.invalidateSize()
            }, 100)
        })

        observer.observe(container)

        return () => {
            observer.disconnect()
        }
    }, [map])

    return null
}

function MapZoomObserver({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
    const map = useMapEvents({
        zoomend: () => {
            onZoomChange(map.getZoom())
        },
    })
    return null
}

function generateCurvedPoints(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    bendDirection = 1,
    numPoints = 20
): [number, number][] {
    const points: [number, number][] = []
    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2

    const dLat = lat2 - lat1
    const dLng = lng2 - lng1
    const dist = Math.sqrt(dLat * dLat + dLng * dLng)

    const offset = dist * 0.18 * bendDirection
    const perpLat = -dLng * (offset / (dist || 1))
    const perpLng = dLat * (offset / (dist || 1))

    const ctrlLat = midLat + perpLat
    const ctrlLng = midLng + perpLng

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const u = 1 - t
        const tt = t * t
        const uu = u * u

        const currLat = uu * lat1 + 2 * u * t * ctrlLat + tt * lat2
        const currLng = uu * lng1 + 2 * u * t * ctrlLng + tt * lng2
        points.push([currLat, currLng])
    }

    return points
}

export default function LeafletMapCore({
    drivers,
    selectedStopId,
    activeDriverId,
    onSelectStop,
}: LeafletMapCoreProps) {
    const istanbulCenter: [number, number] = [41.0082, 28.9784]
    const [currentZoom, setCurrentZoom] = useState<number>(11)

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

            {/* ROTA ÇİZGİLERİ (Çevrim Döngüleri) */}
            {drivers.map((driver, driverIdx) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false

                const depotCoords = getCoordinatesForDepot(driver.depotName || 'Avcılar')
                const depotLatLng: [number, number] = [depotCoords.lat, depotCoords.lng]

                const stopCoordsList = driver.stops.map((stop) => {
                    return getCoordinatesForStop(stop)
                })

                const fullRoutePoints: [number, number][] = []
                let currentLat = depotLatLng[0]
                let currentLng = depotLatLng[1]

                const allNodes = [...stopCoordsList, { lat: depotLatLng[0], lng: depotLatLng[1] }]
                const driverBend = driverIdx % 2 === 0 ? 1 : -1

                allNodes.forEach((node) => {
                    const segment = generateCurvedPoints(currentLat, currentLng, node.lat, node.lng, driverBend)
                    fullRoutePoints.push(...segment)
                    currentLat = node.lat
                    currentLng = node.lng
                })

                return (
                    <div key={`route-${driver.id}`}>
                        <Polyline
                            positions={fullRoutePoints}
                            pathOptions={{
                                color: theme.cssVar,
                                weight: activeDriverId === driver.id ? 5 : 3,
                                opacity: isFaded ? 0.15 : 0.85,
                            }}
                        />
                    </div>
                )
            })}

            {/* MERKEZ DEPOLAR */}
            {[
                { name: 'Avcılar Merkez Depo', ...getCoordinatesForDepot('Avcılar') },
                { name: 'Üsküdar Merkez Depo', ...getCoordinatesForDepot('Üsküdar') }
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

            {/* MÜŞTERİ DURAK PİNLERİ */}
            {drivers.map((driver) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false

                return driver.stops.map((stop) => {
                    const coords = getCoordinatesForStop(stop)
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
'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { driverTheme, getCoordinatesForAddress, type StopDto, type DriverDto } from '@/lib/route-data'

interface LeafletMapCoreProps {
    drivers: DriverDto[]
    selectedStopId: string | null
    activeDriverId?: string
    onSelectStop: (stop: StopDto, driverId: string) => void
}

/** 
 * Graf teorisi stili için kavisli (bezier) ara noktalar üretir.
 */
function generateCurvedPoints(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    curveDirection = 1,
    numPoints = 15
): [number, number][] {
    const points: [number, number][] = []
    const midLat = (lat1 + lat2) / 2
    const midLng = (lng1 + lng2) / 2

    const dLat = lat2 - lat1
    const dLng = lng2 - lng1

    const offsetFactor = 0.12 * curveDirection
    const perpLat = -dLng * offsetFactor
    const perpLng = dLat * offsetFactor

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

    return (
        <MapContainer
            center={istanbulCenter}
            zoom={11}
            scrollWheelZoom={true}
            className="size-full z-10"
            attributionControl={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* 1. ROTA ÇİZGİLERİ (Depodan Başlar, Durakları Dolaşır, Tekrar Depoya Döner - Çevrim) */}
            {drivers.map((driver, driverIdx) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false

                // Sürücünün deposunun koordinatları (Varsayılan Avrupa veya özel tanımlı)
                const depotCoords = getCoordinatesForAddress(driver.depotName || 'Avcılar Merkez Depo', driver.id)
                const depotLatLng: [number, number] = [driver.depotLat || depotCoords.lat, driver.depotLng || depotCoords.lng]

                // Durakların gerçek ilçe koordinatları
                const stopCoordsList = driver.stops.map((stop) => {
                    return (stop.lat && stop.lng)
                        ? { lat: stop.lat, lng: stop.lng }
                        : getCoordinatesForAddress(stop.address, stop.id)
                })

                // Çevrim zinciri: Depo -> Durak 1 -> Durak 2 ... -> Depo
                const fullRoutePoints: [number, number][] = []
                let currentLat = depotLatLng[0]
                let currentLng = depotLatLng[1]

                const allNodes = [...stopCoordsList, { lat: depotLatLng[0], lng: depotLatLng[1] }]

                allNodes.forEach((node, nodeIdx) => {
                    const direction = (driverIdx + nodeIdx) % 2 === 0 ? 1 : -1
                    const segment = generateCurvedPoints(currentLat, currentLng, node.lat, node.lng, direction)
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

            {/* 2. MERKEZ DEPOLAR PİNİ */}
            {[
                { name: 'Avcılar Merkez Depo', ...getCoordinatesForAddress('Avcılar Merkez Depo', 'DP001') },
                { name: 'Üsküdar Merkez Depo', ...getCoordinatesForAddress('Üsküdar Merkez Depo', 'DP002') }
            ].map((depot) => (
                <Marker
                    key={depot.name}
                    position={[depot.lat, depot.lng]}
                    icon={L.divIcon({
                        className: 'custom-depot-marker',
                        html: `
              <div class="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
                <svg class="size-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span class="text-[10px] font-bold tracking-wider text-foreground">${depot.name}</span>
              </div>
            `,
                        iconSize: [140, 32],
                        iconAnchor: [70, 16],
                    })}
                />
            ))}

            {/* 3. DİNAMİK MÜŞTERİ DURAK PİNLERİ */}
            {drivers.map((driver) => {
                const theme = driverTheme[driver.colorKey]
                const isFaded = activeDriverId ? activeDriverId !== driver.id : false

                return driver.stops.map((stop) => {
                    const coords = (stop.lat && stop.lng)
                        ? { lat: stop.lat, lng: stop.lng }
                        : getCoordinatesForAddress(stop.address, stop.id)

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
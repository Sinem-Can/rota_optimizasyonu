'use client'

import { useState } from 'react'
import { Route, Layers, Ruler, Crosshair, Maximize2, Navigation, TriangleAlert, Warehouse, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { driverTheme, type StopDto, type DriverDto } from '@/lib/route-data'
import dynamic from 'next/dynamic'

// Leaflet'i SSR kapalı şekilde dinamik olarak yüklüyoruz
const LeafletMapCore = dynamic(() => import('./leaflet-map-core'), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">Harita yükleniyor...</div>
})

interface MapPanelProps {
    selectedStopId: string | null
    onSelectStop: (stop: StopDto, driverId: string) => void
    isOptimizing: boolean
    drivers: DriverDto[]
}

export function MapPanel({ selectedStopId, onSelectStop, isOptimizing, drivers }: MapPanelProps) {
    // HANGİ ARACIN ODAKTA OLDUĞUNU BULUYORUZ
    const activeDriver = drivers.find((d) => d.stops.some((s) => s.id === selectedStopId))
    const activeDriverId = activeDriver?.id

    const activeRouteCount = drivers.filter(d => d.stops.length > 0).length
    const activeStopCount = drivers.reduce((acc, d) => acc + d.stops.length, 0)

    // Riskli durak kontrolü (örnek simülasyon için)
    const riskStop = drivers.flatMap(d => d.stops).find(s => s.status === 'risk')
    const riskDriver = drivers.find(d => d.stops.some(s => s.id === riskStop?.id))
    const riskDriverLabel = riskDriver ? riskDriver.label : 'Araç'

    return (
        <section
            aria-label="Rota haritası"
            className="relative flex h-full min-h-0 flex-col overflow-hidden bg-muted"
        >
            {/* Harita araç çubuğu */}
            <div className="absolute left-3 top-3 z-30">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-sm backdrop-blur">
                    {[
                        { icon: Route, label: 'Rotalar', active: true },
                        { icon: Layers, label: 'Katmanlar', active: false },
                        { icon: Ruler, label: 'Mesafe ölç', active: false },
                        { icon: Crosshair, label: 'Konum seç', active: false },
                    ].map((tool) => (
                        <button
                            key={tool.label}
                            type="button"
                            title={tool.label}
                            aria-label={tool.label}
                            className={cn(
                                'grid size-7 place-items-center rounded transition-colors',
                                tool.active
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                            )}
                        >
                            <tool.icon className="size-3.5" />
                        </button>
                    ))}
                    <div className="mx-0.5 h-5 w-px bg-border" />
                    <span className="pr-1.5 font-mono text-[11px] font-semibold text-muted-foreground">
                        İstanbul · Gerçek Harita (OSM)
                    </span>
                    <div className="mx-0.5 h-5 w-px bg-border" />
                    <div className="flex items-center gap-2 px-1.5">
                        <Navigation className="size-3.5 text-primary" />
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                            {activeRouteCount} rota · {activeStopCount} aktif durak
                        </span>
                    </div>
                    <div className="mx-0.5 h-5 w-px bg-border" />
                    <button
                        type="button"
                        aria-label="Tam ekran"
                        className="grid size-7 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Maximize2 className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Harita Gövdesi: Leaflet Entegre Edilmiş Alan */}
            <div className="relative min-h-0 flex-1">
                <LeafletMapCore
                    drivers={drivers}
                    selectedStopId={selectedStopId}
                    activeDriverId={activeDriverId}
                    onSelectStop={onSelectStop}
                />

                {/* Gecikme uyarı balonu */}
                {riskStop ? (
                    <div className="absolute bottom-16 left-3 z-30 flex max-w-[19rem] items-start gap-2.5 rounded-md border border-destructive/30 bg-card/95 p-2.5 shadow-md backdrop-blur">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-destructive/10">
                            <TriangleAlert className="size-3.5 text-destructive" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold text-foreground">Zaman penceresi ihlali</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                {riskDriverLabel} · {riskStop.customerName} durağı gecikme riski taşıyor. Trafik yoğunluğu nedeniyle rota yeniden hesaplanmalı.
                            </p>
                            <button
                                type="button"
                                className="mt-1.5 text-[11px] font-bold text-primary underline-offset-2 hover:underline"
                            >
                                Yeniden hesapla →
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
    Maximize2,
    Navigation,
    Route,
    TriangleAlert,
} from 'lucide-react'
import { driverTheme, type StopDto, type DriverDto } from '@/lib/route-data'
import { cn } from '@/lib/utils'

// Leaflet bileşenini sunucu tarafında (SSR) devre dışı bırakarak sadece tarayıcılarda yüklüyoruz
const LeafletMapCore = dynamic(() => import('@/components/leaflet-map-core'), {
    ssr: false,
    loading: () => (
        <div className="flex size-full items-center justify-center bg-muted/20 text-xs text-muted-foreground">
            Harita Yükleniyor...
        </div>
    ),
})

interface MapPanelProps {
    selectedStopId: string | null
    onSelectStop: (stop: StopDto, driverId: string) => void
    isOptimizing: boolean
    drivers: DriverDto[]
}

export function MapPanel({ selectedStopId, onSelectStop, isOptimizing, drivers }: MapPanelProps) {
    // --- DİNAMİK VERİ HESAPLAMALARI ---
    const activeRouteCount = drivers.length
    const activeStopCount = drivers.reduce((sum, driver) => sum + driver.stops.length, 0)

    // Sistemdeki tüm durakları tarayıp 'risk' statüsünde olan İLK durağı bul
    let riskStop: StopDto | null = null
    let riskDriverLabel = ''

    for (const driver of drivers) {
        const foundRisk = driver.stops.find((s) => s.status === 'risk')
        if (foundRisk) {
            riskStop = foundRisk
            riskDriverLabel = driver.label
            break
        }
    }

    // HANGİ ARACIN ODAKTA OLDUĞUNU BULUYORUZ
    const activeDriver = drivers.find((d) => d.stops.some((s) => s.id === selectedStopId))
    const activeDriverId = activeDriver?.id

    return (
        <section
            aria-label="Rota haritası"
            className="relative flex h-full min-h-0 flex-col overflow-hidden bg-muted"
        >
            {/* Harita araç çubuğu (En üst katman - z-30) */}
            <div className="absolute left-14 right-3 top-3 z-30 flex items-start justify-between gap-2 pointer-events-none">
                <div className="rounded-md border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur pointer-events-auto">
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        İstanbul · Gerçek Harita (OSM)
                    </span>
                </div>

                <div className="flex items-center gap-1.5 pointer-events-auto">
                    <div className="flex items-center gap-2 rounded-md border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
                        <Navigation className="size-3.5 text-primary" />
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                            {activeRouteCount} rota · {activeStopCount} aktif durak
                        </span>
                    </div>

                    <button
                        type="button"
                        aria-label="Tam ekran"
                        className="grid size-8 place-items-center rounded-md border border-border bg-card/95 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
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

                {/* DİNAMİK: Gecikme uyarı balonu */}
                {riskStop ? (
                    <div className="absolute bottom-16 left-3 z-30 flex max-w-[19rem] items-start gap-2.5 rounded-md border border-destructive/30 bg-card/95 p-2.5 shadow-md backdrop-blur">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded bg-destructive/10">
                            <TriangleAlert className="size-3.5 text-destructive" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold text-foreground">Zaman penceresi ihlali</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                {riskDriverLabel} · {riskStop.customerName.substring(0, 20)}... durağı gecikme riski taşıyor. Trafik yoğunluğu nedeniyle rota yeniden hesaplanmalı.
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

                {/* Lejant */}
                <div className="absolute bottom-3 left-3 z-30 rounded-md border border-border bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Rota Lejantı
                    </p>
                    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {drivers.map((driver) => (
                            <li key={driver.id} className="flex items-center gap-1.5">
                                <span
                                    className={cn('h-1 w-4 rounded-full', driverTheme[driver.colorKey].solid)}
                                />
                                <span className="text-[11px] font-medium text-foreground">{driver.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Optimizasyon örtüsü */}
                {isOptimizing ? (
                    <div className="absolute inset-0 z-40 grid place-items-center bg-background/55 backdrop-blur-[2px]">
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
                            <Route className="size-5 animate-pulse text-primary" />
                            <div>
                                <p className="text-[13px] font-bold text-foreground">
                                    Rotalar yeniden hesaplanıyor
                                </p>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                    VRP çözücü çalışıyor · {activeStopCount} durak / {activeRouteCount} araç
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    )
}

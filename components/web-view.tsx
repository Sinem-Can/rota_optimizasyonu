'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Next.js / Leaflet ikon yolu sorununu çözen standart düzeltme
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapView() {
    // Haritanın başlangıç konumu (Örn: İstanbul / Merkez Depo bölgesi)
    const center: [number, number] = [41.0082, 28.9784]

    return (
        <div className="size-full overflow-hidden rounded-lg border border-border shadow-sm">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                className="size-full min-h-[450px]"
            >
                {/* Ücretsiz ve açık kaynaklı OpenStreetMap Katmanı */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Örnek Merkez Depo Pini (İleride burayı veritabanından gelen verilerle dinamik yapacağız) */}
                <Marker position={center}>
                    <Popup>
                        <div className="font-sans">
                            <strong>Merkez Depo (Avcılar / Üsküdar)</strong>
                            <p className="text-xs text-muted-foreground">Aktif Rota Planlama Merkezi</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}
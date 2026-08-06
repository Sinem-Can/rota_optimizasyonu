export async function fetchRealRoadRoute(coordinates: { lat: number; lng: number }[]): Promise<[number, number][]> {
    if (coordinates.length < 2) return []

    // OSRM formatı: "lng1,lat1;lng2,lat2;lng3,lat3"
    const coordsString = coordinates.map((c) => `${c.lng},${c.lat}`).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // OSRM [lng, lat] döner, Leaflet [lat, lng] bekler. Bu yüzden ters çeviriyoruz.
            return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
        }
    } catch (error) {
        console.error('OSRM rota çekme hatası:', error)
    }

    // Hata durumunda düz çizgi fallback (yedek)
    return coordinates.map((c) => [c.lat, c.lng])
}
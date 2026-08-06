// Veri sözleşmeleri C# .NET backend DTO'ları ile birebir eşleşecek şekilde tanımlanmıştır.

export type DriverKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l'

export type StopStatus = 'completed' | 'enroute' | 'pending' | 'risk'

export interface StopDto {
    id: string
    cariKod?: string
    sequence: number
    customerName: string
    address: string
    district: string
    eta: string
    windowStart: string
    windowEnd: string
    serviceMinutes: number
    weightKg: number
    volumeM3: number
    status: StopStatus
    priority: 'Yüksek' | 'Normal' | 'Düşük'
    phone: string
    orderNo: string
    x: number
    y: number
    lat?: number
    lng?: number
}

export interface DriverDto {
    id: string
    label: string
    fullName: string
    plate: string
    vehicleType: string
    colorKey: DriverKey
    totalDistanceKm: number
    totalDurationMin: number
    capacityUsedKg: number
    capacityMaxKg: number
    shiftStart: string
    shiftEnd: string
    depotName?: string
    depotX?: number
    depotY?: number
    depotLat?: number
    depotLng?: number
    stops: StopDto[]
}

export interface UnassignedTaskDto {
    id: string
    customerName: string
    address: string
    district: string
    windowStart: string
    windowEnd: string
    weightKg: number
    serviceMinutes: number
    priority: 'Yüksek' | 'Normal' | 'Düşük'
    orderNo: string
}

/** Sürücü rengi -> statik Tailwind sınıf eşlemesi */
export const driverTheme: Record<string, { solid: string, soft: string, border: string, text: string, cssVar: string }> = {
    a: { solid: 'bg-blue-500', soft: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', cssVar: '#3b82f6' },
    b: { solid: 'bg-emerald-500', soft: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-500', cssVar: '#10b981' },
    c: { solid: 'bg-orange-500', soft: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', cssVar: '#f97316' },
    d: { solid: 'bg-fuchsia-500', soft: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-500', cssVar: '#d946ef' },
    e: { solid: 'bg-purple-500', soft: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500', cssVar: '#a855f7' },
    f: { solid: 'bg-yellow-500', soft: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500', cssVar: '#eab308' },
    g: { solid: 'bg-cyan-500', soft: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-500', cssVar: '#06b6d4' },
    h: { solid: 'bg-rose-500', soft: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', cssVar: '#f43f5e' },
    i: { solid: 'bg-lime-500', soft: 'bg-lime-500/10', border: 'border-lime-500/20', text: 'text-lime-500', cssVar: '#84cc16' },
    j: { solid: 'bg-indigo-500', soft: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-500', cssVar: '#6366f1' },
    k: { solid: 'bg-pink-500', soft: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-500', cssVar: '#ec4899' },
    l: { solid: 'bg-teal-500', soft: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-500', cssVar: '#14b8a6' },
}

/** 
 * Semt ve İlçe Bazlı Detaylı İstanbul Koordinat Sözlüğü
 */
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
    // Depolar
    'Avcılar Merkez Depo': { lat: 40.9850, lng: 28.7200 },
    'Üsküdar Merkez Depo': { lat: 41.0280, lng: 29.0200 },

    // Özel Semtler ve Mahalleler
    'eminönü': { lat: 41.0150, lng: 28.9700 },
    'sefaköy': { lat: 40.9922, lng: 28.7832 },
    'mecidiyeköy': { lat: 41.0652, lng: 28.9920 },
    'fenerbahçe': { lat: 40.9780, lng: 29.0420 },
    'bostancı': { lat: 40.9570, lng: 29.1020 },
    'içerenköy': { lat: 40.9700, lng: 29.1120 },
    'kayışdağı': { lat: 40.9750, lng: 29.1500 },
    'çakmak': { lat: 41.0150, lng: 29.1300 },
    'kavacık': { lat: 41.0920, lng: 29.0780 },
    'çengelköy': { lat: 41.0450, lng: 29.0480 },
    'altunizade': { lat: 41.0220, lng: 29.0350 },
    'levent': { lat: 41.0762, lng: 29.0148 },
    'sarıyer': { lat: 41.1660, lng: 29.0500 },

    // Genel İlçeler
    'bahçelievler': { lat: 40.9981, lng: 28.8592 },
    'bakırköy': { lat: 40.9785, lng: 28.8772 },
    'beşiktaş': { lat: 41.0422, lng: 29.0077 },
    'şişli': { lat: 41.0602, lng: 28.9877 },
    'fatih': { lat: 41.0102, lng: 28.9500 },
    'eyüpsultan': { lat: 41.0470, lng: 28.9330 },
    'bayrampaşa': { lat: 41.0390, lng: 28.9050 },
    'bağcılar': { lat: 41.0322, lng: 28.8561 },
    'küçükçekmece': { lat: 40.9952, lng: 28.7752 },
    'beylikdüzü': { lat: 41.0015, lng: 28.6423 },
    'kadıköy': { lat: 40.9901, lng: 29.0264 },
    'maltepe': { lat: 40.9273, lng: 29.1352 },
    'pendik': { lat: 40.8756, lng: 29.2343 },
    'tuzla': { lat: 40.8147, lng: 29.3039 },
    'ümraniye': { lat: 41.0270, lng: 29.1000 },
    'ataşehir': { lat: 40.9850, lng: 29.1150 },
    'çekmeköy': { lat: 41.0390, lng: 29.1760 },
    'beykoz': { lat: 41.1150, lng: 29.0980 },
    'üsküdar': { lat: 41.0264, lng: 29.0154 },
}

/** 
 * Kesin Nokta Atışı Koordinat Sözlüğü (Sürücülerdeki C-xx ve CAR kodları için)
 */
const exactLocations: Record<string, { lat: number; lng: number }> = {
    'DP001': { lat: 40.9850, lng: 28.7200 },
    'DP002': { lat: 41.0280, lng: 29.0200 },
    'C-11': { lat: 41.0150, lng: 28.9700 }, // Eminönü Toptancı
    'C-19': { lat: 40.9922, lng: 28.7832 }, // Sefaköy CarrefourSA
    'C-03': { lat: 40.9785, lng: 28.8772 }, // Bakırköy Migros
    'C-20': { lat: 40.9952, lng: 28.7752 }, // Küçükçekmece Çağrı
    'C-08': { lat: 41.0762, lng: 29.0148 }, // Levent File
    'C-10': { lat: 41.1660, lng: 29.0500 }, // Sarıyer Bakkal
    'CAR001': { lat: 40.9958, lng: 28.8415 },
    'CAR002': { lat: 40.9785, lng: 28.8772 },
    'CAR003': { lat: 41.0438, lng: 29.0078 },
    'CAR004': { lat: 41.0552, lng: 28.9859 },
    'CAR005': { lat: 41.0648, lng: 28.9932 },
    'CAR006': { lat: 41.0762, lng: 29.0148 },
    'CAR007': { lat: 41.0183, lng: 28.9482 },
    'CAR008': { lat: 41.0482, lng: 28.9348 },
    'CAR009': { lat: 41.0412, lng: 28.8955 },
    'CAR010': { lat: 41.0332, lng: 28.8552 },
    'CAR011': { lat: 40.9922, lng: 28.7832 },
    'CAR012': { lat: 40.9952, lng: 28.7752 },
    'CAR013': { lat: 41.0022, lng: 28.6452 },
    'CAR014': { lat: 40.9782, lng: 29.0382 },
    'CAR015': { lat: 40.9572, lng: 29.1022 },
    'CAR016': { lat: 40.9252, lng: 29.1332 },
    'CAR017': { lat: 40.8752, lng: 29.2342 },
    'CAR018': { lat: 40.8142, lng: 29.3032 },
    'CAR019': { lat: 41.0272, lng: 29.1002 },
    'CAR020': { lat: 41.0152, lng: 29.1282 },
    'CAR021': { lat: 40.9852, lng: 29.1152 },
    'CAR022': { lat: 40.9732, lng: 29.1502 },
    'CAR023': { lat: 40.9702, lng: 29.1122 },
    'CAR024': { lat: 41.0392, lng: 29.1762 },
    'CAR025': { lat: 41.0922, lng: 29.0782 },
    'CAR026': { lat: 41.0452, lng: 29.0482 },
    'CAR027': { lat: 41.0222, lng: 29.0352 },
}

/** 
 * Adres içerisindeki özel semt veya ilçeyi akıllıca eşitleyen fonksiyon
 */
export function getCoordinatesForAddress(address: string, fallbackId: string): { lat: number; lng: number } {
    for (const [key, coords] of Object.entries(locationCoordinates)) {
        if (address.toLowerCase().includes(key.toLowerCase())) {
            return coords
        }
    }

    // Bulunamazsa ID bazlı güvenli mikro sapma
    let hash = 0
    for (let i = 0; i < fallbackId.length; i++) {
        hash = fallbackId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return {
        lat: 41.0082 + ((Math.abs(hash) % 20) - 10) * 0.001,
        lng: 28.9784 + ((Math.abs(hash * 17) % 20) - 10) * 0.001,
    }
}

/** 
 * Harita bileşeninin doğrudan kullandığı durak koordinat çözücü.
 * Birebir aynı noktaya düşen durakları ID hash değerine göre çok küçük bir sapma ile ayırır.
 */
export function getCoordinatesForStop(stop: { id: string; address?: string; district?: string; lat?: number; lng?: number }): { lat: number; lng: number } {
    let base: { lat: number; lng: number }

    if (stop.lat && stop.lng) {
        base = { lat: stop.lat, lng: stop.lng }
    } else if (exactLocations[stop.id]) {
        base = exactLocations[stop.id]
    } else {
        const fullSearchText = `${stop.address || ''} ${stop.district || ''}`
        base = getCoordinatesForAddress(fullSearchText, stop.id)
    }

    // Aynı koordinata denk gelen farklı ID'li duraklar için kararlı mikro sapma (Çakışma Önleyici)
    let hash = 0
    for (let i = 0; i < stop.id.length; i++) {
        hash = stop.id.charCodeAt(i) + ((hash << 5) - hash)
    }

    // ~10-15 metre oynatan çok küçük ve güvenli ofset katsayısı
    const jitterLat = ((Math.abs(hash) % 10) - 5) * 0.00012
    const jitterLng = ((Math.abs(hash * 13) % 10) - 5) * 0.00012

    return {
        lat: base.lat + jitterLat,
        lng: base.lng + jitterLng,
    }
}

export function getCoordinatesForDepot(depotName: string): { lat: number; lng: number } {
    if ((depotName || '').toLowerCase().includes('üsküdar')) {
        return exactLocations['DP002']
    }
    return exactLocations['DP001']
}

export const kpiSummary = {
    totalDistanceKm: 340,
    totalDuration: '24s 15d',
    vehicleCount: 5,
    successRate: 98,
    plannedStops: 42,
    fuelEstimateL: 51.4,
    costEstimate: '₺4.820',
    optimizationGain: 18.4,
}

export const drivers: DriverDto[] = [
    {
        id: 'VHC-001',
        label: 'Sürücü A',
        fullName: 'Ahmet Yılmaz',
        plate: '54 LIX 01',
        vehicleType: 'Panelvan (Mini)',
        shiftStart: '08:00',
        shiftEnd: '17:30',
        capacityMaxKg: 750,
        capacityUsedKg: 440,
        totalDistanceKm: 31,
        totalDurationMin: 98,
        colorKey: 'a',
        stops: [
            {
                id: 'C-11',
                sequence: 1,
                customerName: 'Müşteri 11 (Eminönü Toptancı)',
                address: 'Eminönü Meydanı',
                district: 'Fatih',
                eta: '08:45',
                windowStart: '08:00',
                windowEnd: '12:00',
                serviceMinutes: 15,
                weightKg: 440,
                volumeM3: 3,
                status: 'completed',
                priority: 'Normal',
                phone: '0555 111 2233',
                orderNo: 'SP-10011',
                x: 52,
                y: 48,
            }
        ],
    },
    {
        id: 'VHC-002',
        label: 'Sürücü B',
        fullName: 'Mehmet Demir',
        plate: '54 LIX 02',
        vehicleType: 'Panelvan (Orta)',
        shiftStart: '08:30',
        shiftEnd: '18:00',
        capacityMaxKg: 1000,
        capacityUsedKg: 880,
        totalDistanceKm: 36,
        totalDurationMin: 328,
        colorKey: 'b',
        stops: [
            {
                id: 'C-19',
                sequence: 1,
                customerName: 'Müşteri 19 (Sefaköy CarrefourSA)',
                address: 'Sefaköy Merkez',
                district: 'Küçükçekmece',
                eta: '10:14',
                windowStart: '09:00',
                windowEnd: '12:00',
                serviceMinutes: 15,
                weightKg: 400,
                volumeM3: 3,
                status: 'enroute',
                priority: 'Normal',
                phone: '0555 222 3344',
                orderNo: 'SP-10019',
                x: 22,
                y: 62,
            },
            {
                id: 'C-03',
                sequence: 2,
                customerName: 'Müşteri 3 (Bakırköy Migros)',
                address: 'İncirli Cad.',
                district: 'Bakırköy',
                eta: '12:44',
                windowStart: '11:00',
                windowEnd: '15:00',
                serviceMinutes: 15,
                weightKg: 480,
                volumeM3: 3,
                status: 'pending',
                priority: 'Yüksek',
                phone: '0555 333 4455',
                orderNo: 'SP-10003',
                x: 30,
                y: 74,
            }
        ],
    },
    {
        id: 'VHC-008',
        label: 'Sürücü C',
        fullName: 'Hasan Yılmaz',
        plate: '54 LIX 08',
        vehicleType: 'Kamyon (Ağır)',
        shiftStart: '09:00',
        shiftEnd: '17:00',
        capacityMaxKg: 12000,
        capacityUsedKg: 3720,
        totalDistanceKm: 103,
        totalDurationMin: 385,
        colorKey: 'c',
        stops: [
            {
                id: 'C-20',
                sequence: 1,
                customerName: 'Müşteri 20 (Küçükçekmece Çağrı)',
                address: 'Merkez',
                district: 'Küçükçekmece',
                eta: '09:09',
                windowStart: '08:00',
                windowEnd: '17:00',
                serviceMinutes: 20,
                weightKg: 1000,
                volumeM3: 5,
                status: 'completed',
                priority: 'Normal',
                phone: '0555 444 5566',
                orderNo: 'SP-10020',
                x: 20,
                y: 60,
            },
            {
                id: 'C-08',
                sequence: 2,
                customerName: 'Müşteri 8 (Levent File)',
                address: 'Levent Çarşı',
                district: 'Beşiktaş',
                eta: '10:18',
                windowStart: '10:00',
                windowEnd: '14:00',
                serviceMinutes: 25,
                weightKg: 1520,
                volumeM3: 10,
                status: 'enroute',
                priority: 'Yüksek',
                phone: '0555 555 6677',
                orderNo: 'SP-10008',
                x: 46,
                y: 33,
            },
            {
                id: 'C-10',
                sequence: 3,
                customerName: 'Müşteri 10 (Sarıyer Bakkal)',
                address: 'Sarıyer Merkez',
                district: 'Sarıyer',
                eta: '11:20',
                windowStart: '11:00',
                windowEnd: '16:00',
                serviceMinutes: 20,
                weightKg: 1200,
                volumeM3: 8,
                status: 'pending',
                priority: 'Normal',
                phone: '0555 666 7788',
                orderNo: 'SP-10010',
                x: 74,
                y: 30,
            }
        ],
    }
]

export const unassignedTasks: UnassignedTaskDto[] = [
    {
        id: 'UA-7001',
        customerName: 'Ümraniye Yapı Market',
        address: 'Alemdağ Cad. No:88',
        district: 'Ümraniye',
        windowStart: '10:00',
        windowEnd: '12:00',
        weightKg: 540,
        serviceMinutes: 20,
        priority: 'Yüksek',
        orderNo: 'SP-98301',
    },
    {
        id: 'UA-7002',
        customerName: 'Beylikdüzü Toptan Gıda',
        address: 'Yakuplu Mah. 14',
        district: 'Beylikdüzü',
        windowStart: '13:00',
        windowEnd: '16:00',
        weightKg: 1240,
        serviceMinutes: 35,
        priority: 'Normal',
        orderNo: 'SP-98305',
    },
]

export interface CustomerDto {
    id: string
    name: string
    district: string
    address: string
    avgVolumeM3: number
    windowStart: string
    windowEnd: string
    priority: 'Yüksek' | 'Normal' | 'Düşük'
}

export const customers: CustomerDto[] = [
    { id: 'CAR001', name: 'Şirinevler Şok Market', district: 'Şirinevler', address: 'Şirinevler Mah. Merkez Cad. No:99', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 0.7, priority: 'Normal' },
    { id: 'CAR002', name: 'Bakırköy Migros', district: 'Bakırköy', address: 'Bakırköy Mah. Merkez Cad. No:49', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 1.7, priority: 'Normal' },
]

export const customerSummary = {
    total: customers.length,
    highPriority: customers.filter((c) => c.priority === 'Yüksek').length,
    activeDistricts: new Set(customers.map((c) => c.district)).size,
}

export const priorityMeta: Record<CustomerDto['priority'], { label: string; className: string }> = {
    Yüksek: { label: 'Yüksek', className: 'bg-destructive/10 text-destructive border-destructive/25' },
    Normal: { label: 'Normal', className: 'bg-primary/10 text-primary border-primary/25' },
    Düşük: { label: 'Düşük', className: 'bg-muted text-muted-foreground border-border' },
}

export type FleetStatus = 'Aktif' | 'Arızalı' | 'İzinde'
export type FleetFeature = 'Soğutuculu' | 'Asansörlü' | 'Tehlikeli Madde' | 'Palet Taşıma'

export const fleetFeatureList: FleetFeature[] = ['Soğutuculu', 'Asansörlü', 'Tehlikeli Madde', 'Palet Taşıma']

export interface FleetVehicleDto {
    id: string
    driverName: string
    plate: string
    depot: 'Avcılar' | 'Üsküdar'
    vehicleType: string
    capacityMaxKg: number
    capacityMaxM3: number
    features: FleetFeature[]
    status: FleetStatus
}

export const fleetVehicles: FleetVehicleDto[] = [
    {
        id: 'ARC-001',
        driverName: 'Ahmet Yılmaz',
        plate: '34 ABC 123',
        depot: 'Avcılar',
        vehicleType: 'Panelvan',
        capacityMaxKg: 1500,
        capacityMaxM3: 8,
        features: ['Soğutuculu'],
        status: 'Aktif',
    },
]

export const fleetStatusMeta: Record<FleetStatus, { label: string; className: string; dotClassName: string }> = {
    Aktif: { label: 'Aktif', className: 'bg-primary/10 text-primary border-primary/25', dotClassName: 'bg-primary' },
    Arızalı: { label: 'Arızalı', className: 'bg-destructive/10 text-destructive border-destructive/25', dotClassName: 'bg-destructive' },
    İzinde: { label: 'İzinde', className: 'bg-warning/10 text-warning border-warning/30', dotClassName: 'bg-warning' },
}

export const fleetSummary = {
    total: fleetVehicles.length,
    active: fleetVehicles.filter((v) => v.status === 'Aktif').length,
    onLeave: fleetVehicles.filter((v) => v.status === 'İzinde').length,
    broken: fleetVehicles.filter((v) => v.status === 'Arızalı').length,
    totalCapacityKg: fleetVehicles.reduce((sum, v) => sum + v.capacityMaxKg, 0),
}

export const reportMetrics = [
    { label: 'Aylık Yakıt Tasarrufu', value: '₺38.400', delta: '+%12,4', deltaTone: 'up' as const, caption: 'Geçen aya göre' },
    { label: 'Zamanında Teslimat Oranı', value: '%98', delta: '+1,2 puan', deltaTone: 'up' as const, caption: 'Hedef: %95' },
    { label: 'Depo Çıkış Hacmi', value: '1.284 m³', delta: '+%8,1', deltaTone: 'up' as const, caption: 'Bu ay toplam' },
    { label: 'Ortalama Rota Verimi', value: '%91,6', delta: '-0,4 puan', deltaTone: 'down' as const, caption: 'Kapasite kullanımı' },
]

export const monthlyVolume = [
    { label: 'Oca', value: 940 },
    { label: 'Şub', value: 1010 },
    { label: 'Mar', value: 880 },
    { label: 'Nis', value: 1120 },
    { label: 'May', value: 1240 },
    { label: 'Haz', value: 1180 },
    { label: 'Tem', value: 1284 },
]

export const onTimeTrend = [
    { label: 'H1', value: 94 },
    { label: 'H2', value: 95 },
    { label: 'H3', value: 93 },
    { label: 'H4', value: 96 },
    { label: 'H5', value: 97 },
    { label: 'H6', value: 96 },
    { label: 'H7', value: 98 },
    { label: 'H8', value: 98 },
]

export const statusMeta: Record<StopStatus, { label: string; className: string }> = {
    completed: { label: 'Tamamlandı', className: 'bg-success/10 text-success border-success/25' },
    enroute: { label: 'Yolda', className: 'bg-primary/10 text-primary border-primary/25' },
    pending: { label: 'Bekliyor', className: 'bg-muted text-muted-foreground border-border' },
    risk: { label: 'Gecikme Riski', className: 'bg-destructive/10 text-destructive border-destructive/25' },
}

export function formatDuration(minutes: number) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}s ${m.toString().padStart(2, '0')}d`
}

export function toMinutes(time: string) {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}
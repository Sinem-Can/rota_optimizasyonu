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
    /** Teslim onayının verildiği yerel saat (sayfa yenilenene kadar tutulur). */
    deliveredAt?: string
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
 * Semt and İlçe Bazlı Detaylı İstanbul Koordinat Sözlüğü (Yedek / Akıllı Eşleşme)
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
 * Kesin Nokta Atışı Koordinat Sözlüğü (CAR001 - CAR027 ve Depolar için)
 */
const exactLocations: Record<string, { lat: number; lng: number }> = {
    'DP001': { lat: 40.9850, lng: 28.7200 }, // Avcılar Depo 
    'DP002': { lat: 41.0280, lng: 29.0200 }, // Üsküdar Depo
    'CAR001': { lat: 40.992404131764815, lng: 28.844353794325045 }, // Şirinevler Şok
    'CAR002': { lat: 40.97840849053126, lng: 28.87284091951669 }, // Bakırköy Migros
    'CAR003': { lat: 41.0460943758809, lng: 29.007194281826056 }, // Beşiktaş Macrocenter
    'CAR004': { lat: 41.05554647951909, lng: 28.987209886020832 }, // Şişli CarrefourSA
    'CAR005': { lat: 41.067101927524476, lng: 28.999953539498645 }, // Mecidiyeköy Çağrı
    'CAR006': { lat: 41.075458877522614, lng: 29.019000854842666 }, // Levent File
    'CAR007': { lat: 41.021434505681825, lng: 28.946206056692148 }, // Fatih BİM
    'CAR008': { lat: 41.04838123081621, lng: 28.93217598367751 }, // Eyüp Şok
    'CAR009': { lat: 41.05099747465778, lng: 28.88871180335774 }, // Bayrampaşa Hal İçi (Yorum satırında koordinat yok, pas geçildi)
    'CAR010': { lat: 41.034358971410576, lng: 28.858157115835283 }, // Bağcılar Migros
    'CAR011': { lat: 41.02552735191915, lng: 28.796229241348684 }, // Sefaköy CarrefourSA
    'CAR012': { lat: 41.021075684528746, lng: 28.788965170184387 }, // Küçükçekmece Çağrı
    'CAR013': { lat: 41.00503654713486, lng: 28.65968775484004 }, // Beylikdüzü Migros 5M
    'CAR014': { lat: 40.977187370855795, lng: 29.047530268331165 }, // Fenerbahçe Şok
    'CAR015': { lat: 40.957908580665695, lng: 29.085188241346142 }, // Bostancı Migros
    'CAR016': { lat: 40.90239897587793, lng: 29.14607558215053 }, // Maltepe CarrefourSA
    'CAR017': { lat: 40.89523643145974, lng: 29.248460897164286 }, // Pendik File
    'CAR018': { lat: 40.81700988501976, lng: 29.296462701849556 }, // Tuzla Çağrı
    'CAR019': { lat: 41.02569876344699, lng: 29.096772088584558 }, // Ümraniye Çarşı Migros
    'CAR020': { lat: 41.02531915519853, lng: 29.098778619760292 }, // Çakmak Şok
    'CAR021': { lat: 40.99415446338037, lng: 29.12197097798803 }, // Ataşehir Migros
    'CAR022': { lat: 40.98588454824705, lng: 29.17597147997232 }, // Kayışdağı BİM
    'CAR023': { lat: 40.98181325756917, lng: 29.112914068331474 }, // İçerenköy CarrefourSA
    'CAR024': { lat: 41.028635125252045, lng: 29.17342908182534 }, // Çekmeköy File
    'CAR025': { lat: 41.09523740949902, lng: 29.097574397171503 }, // Kavacık Migros
    'CAR026': { lat: 41.04962093156573, lng: 29.054415621039627 }, // Çengelköy Şok
    'CAR027': { lat: 41.02197118952549, lng: 29.045063449556718 }, // Altunizade Çağrı
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

    let hash = 0
    for (let i = 0; i < fallbackId.length; i++) {
        hash = fallbackId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return {
        lat: 41.0082 + ((Math.abs(hash) % 20) - 10) * 0.001,
        lng: 28.9784 + ((Math.abs(hash * 17) % 20) - 10) * 0.001,
    }
}

export function getCoordinatesForStop(stop: { id?: string; cariKod?: string; lat?: number; lng?: number }): { lat: number; lng: number } {
    // 1. Doğrudan lat/lng varsa kullan
    if (stop?.lat && stop?.lng) {
        return { lat: Number(stop.lat), lng: Number(stop.lng) }
    }

    // 2. Önce cariKod'a bak (Örn: CAR013), yoksa id'ye bak
    const targetKey = stop?.cariKod || stop?.id;
    const cleanKey = targetKey ? String(targetKey).trim().toUpperCase() : '';

    if (cleanKey && exactLocations[cleanKey]) {
        return exactLocations[cleanKey]
    }

// Hiçbiri tutmazsa
    return { lat: 41.0082, lng: 28.9784 }
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
                id: 'CAR001',
                sequence: 1,
                customerName: 'Şirinevler Şok Market',
                address: 'Şirinevler Mah. Meriç Sok. No:15',
                district: 'Bahçelievler',
                eta: '08:45',
                windowStart: '13:00',
                windowEnd: '18:00',
                serviceMinutes: 15,
                weightKg: 2,
                volumeM3: 0.7,
                status: 'completed',
                priority: 'Normal',
                phone: '0555 111 2233',
                orderNo: 'SP-10001',
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
                id: 'CAR002',
                sequence: 1,
                customerName: 'Bakırköy Migros',
                address: 'Zeytinlik Mah. Fişekhane Cad. No:22',
                district: 'Bakırköy',
                eta: '10:14',
                windowStart: '08:00',
                windowEnd: '12:00',
                serviceMinutes: 15,
                weightKg: 3,
                volumeM3: 1.7,
                status: 'enroute',
                priority: 'Normal',
                phone: '0555 222 3344',
                orderNo: 'SP-10002',
                x: 22,
                y: 62,
            },
            {
                id: 'CAR003',
                sequence: 2,
                customerName: 'Beşiktaş Macrocenter',
                address: 'Sinanpaşa Mah. Barbaros Bulvarı No:45',
                district: 'Beşiktaş',
                eta: '12:44',
                windowStart: '09:00',
                windowEnd: '17:00',
                serviceMinutes: 15,
                weightKg: 5,
                volumeM3: 2.0,
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
                id: 'CAR004',
                sequence: 1,
                customerName: 'Şişli CarrefourSA',
                address: 'Merkez Mah. Halaskargazi Cad. No:112',
                district: 'Şişli',
                eta: '09:09',
                windowStart: '13:00',
                windowEnd: '18:00',
                serviceMinutes: 20,
                weightKg: 6,
                volumeM3: 2.5,
                status: 'completed',
                priority: 'Normal',
                phone: '0555 444 5566',
                orderNo: 'SP-10004',
                x: 20,
                y: 60,
            },
            {
                id: 'CAR005',
                sequence: 2,
                customerName: 'Mecidiyeköy Çağrı Market',
                address: 'Mecidiyeköy Mah. Büyükdere Cad. No:85',
                district: 'Şişli',
                eta: '10:18',
                windowStart: '08:00',
                windowEnd: '12:00',
                serviceMinutes: 25,
                weightKg: 7,
                volumeM3: 3.0,
                status: 'enroute',
                priority: 'Yüksek',
                phone: '0555 555 6677',
                orderNo: 'SP-10005',
                x: 46,
                y: 33,
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

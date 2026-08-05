// Veri sözleşmeleri C# .NET backend DTO'ları ile birebir eşleşecek şekilde tanımlanmıştır.
// Örn: GET /api/v1/optimization/plans/{planId}

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
  /** Harita katmanı için normalize koordinat (yüzde) */
  x: number
  y: number
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

/** Sürücü rengi -> statik Tailwind sınıf eşlemesi (dinamik sınıf üretimi yapılmaz) */
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
    colorKey: 'a', // DÜZELTİLDİ
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
    colorKey: 'b', // DÜZELTİLDİ
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
    colorKey: 'c', // DÜZELTİLDİ
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
  {
    id: 'UA-7003',
    customerName: 'Zeytinburnu Tekstil',
    address: 'Merkezefendi Mah. 3',
    district: 'Zeytinburnu',
    windowStart: '09:00',
    windowEnd: '11:00',
    weightKg: 320,
    serviceMinutes: 15,
    priority: 'Yüksek',
    orderNo: 'SP-98309',
  },
  {
    id: 'UA-7004',
    customerName: 'Maltepe Kırtasiye Deposu',
    address: 'Bağlarbaşı Mah. 41',
    district: 'Maltepe',
    windowStart: '14:00',
    windowEnd: '17:00',
    weightKg: 180,
    serviceMinutes: 10,
    priority: 'Düşük',
    orderNo: 'SP-98312',
  },
  {
    id: 'UA-7005',
    customerName: 'Avcılar Soğuk Zincir',
    address: 'Denizköşkler Mah. 9',
    district: 'Avcılar',
    windowStart: '08:00',
    windowEnd: '10:30',
    weightKg: 760,
    serviceMinutes: 25,
    priority: 'Yüksek',
    orderNo: 'SP-98316',
  },
  {
    id: 'UA-7006',
    customerName: 'Tuzla Liman Depo',
    address: 'Aydınlı Mah. 27',
    district: 'Tuzla',
    windowStart: '11:00',
    windowEnd: '14:00',
    weightKg: 1480,
    serviceMinutes: 40,
    priority: 'Normal',
    orderNo: 'SP-98320',
  },
]

export interface CustomerDto {
  id: string
  name: string
  district: string
  /** Açık adres (mahalle, cadde, no) */
  address: string
  avgVolumeM3: number
  windowStart: string
  windowEnd: string
  priority: 'Yüksek' | 'Normal' | 'Düşük'
  // DİKKAT: 'orderCount' alanını sildik çünkü artık sipariş sayılarını göstermiyoruz!
}

export const customers: CustomerDto[] = [
  { id: 'CAR001', name: 'Şirinevler Şok Market', district: 'Şirinevler', address: 'Şirinevler Mah. Merkez Cad. No:99', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 0.7, priority: 'Normal' },
  { id: 'CAR002', name: 'Bakırköy Migros', district: 'Bakırköy', address: 'Bakırköy Mah. Merkez Cad. No:49', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 1.7, priority: 'Normal' },
  { id: 'CAR003', name: 'Beşiktaş Macrocenter', district: 'Beşiktaş', address: 'Beşiktaş Mah. Merkez Cad. No:7', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 3.0, priority: 'Normal' },
  { id: 'CAR004', name: 'Şişli CarrefourSA', district: 'Şişli', address: 'Şişli Mah. Merkez Cad. No:43', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 1.1, priority: 'Düşük' },
  { id: 'CAR005', name: 'Mecidiyeköy Çağrı Market', district: 'Mecidiyeköy', address: 'Mecidiyeköy Mah. Merkez Cad. No:100', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 1.2, priority: 'Yüksek' },
  { id: 'CAR006', name: 'Levent File Market', district: 'Levent', address: 'Levent Mah. Merkez Cad. No:9', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 4.5, priority: 'Yüksek' },
  { id: 'CAR007', name: 'Fatih BİM', district: 'Fatih', address: 'Fatih Mah. Merkez Cad. No:14', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 1.9, priority: 'Yüksek' },
  { id: 'CAR008', name: 'Eyüp Şok Market', district: 'Eyüp', address: 'Eyüp Mah. Merkez Cad. No:17', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 0.9, priority: 'Normal' },
  { id: 'CAR009', name: 'Bayrampaşa Hal İçi Market', district: 'Bayrampaşa', address: 'Bayrampaşa Mah. Merkez Cad. No:74', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 1.8, priority: 'Yüksek' },
  { id: 'CAR010', name: 'Bağcılar Migros', district: 'Bağcılar', address: 'Bağcılar Mah. Merkez Cad. No:99', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 1.7, priority: 'Normal' },
  { id: 'CAR011', name: 'Sefaköy CarrefourSA', district: 'Sefaköy', address: 'Sefaköy Mah. Merkez Cad. No:27', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 2.0, priority: 'Yüksek' },
  { id: 'CAR012', name: 'Küçükçekmece Çağrı Market', district: 'Küçükçekmece', address: 'Küçükçekmece Mah. Merkez Cad. No:2', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 3.0, priority: 'Normal' },
  { id: 'CAR013', name: 'Beylikdüzü Migros 5M', district: 'Beylikdüzü', address: 'Beylikdüzü Mah. Merkez Cad. No:56', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 4.5, priority: 'Düşük' },
  { id: 'CAR014', name: 'Fenerbahçe Şok', district: 'Fenerbahçe', address: 'Fenerbahçe Mah. Merkez Cad. No:63', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 3.4, priority: 'Düşük' },
  { id: 'CAR015', name: 'Bostancı Migros', district: 'Bostancı', address: 'Bostancı Mah. Merkez Cad. No:66', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 3.5, priority: 'Normal' },
  { id: 'CAR016', name: 'Maltepe CarrefourSA', district: 'Maltepe', address: 'Maltepe Mah. Merkez Cad. No:93', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 4.3, priority: 'Normal' },
  { id: 'CAR017', name: 'Pendik File Market', district: 'Pendik', address: 'Pendik Mah. Merkez Cad. No:22', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 4.6, priority: 'Normal' },
  { id: 'CAR018', name: 'Tuzla Çağrı Market', district: 'Tuzla', address: 'Tuzla Mah. Merkez Cad. No:10', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 2.0, priority: 'Yüksek' },
  { id: 'CAR019', name: 'Ümraniye Çarşı Migros', district: 'Ümraniye', address: 'Ümraniye Mah. Merkez Cad. No:3', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 2.2, priority: 'Normal' },
  { id: 'CAR020', name: 'Çakmak Şok Market', district: 'Çakmak', address: 'Çakmak Mah. Merkez Cad. No:2', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 3.1, priority: 'Normal' },
  { id: 'CAR021', name: 'Ataşehir Migros', district: 'Ataşehir', address: 'Ataşehir Mah. Merkez Cad. No:69', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 5.0, priority: 'Yüksek' },
  { id: 'CAR022', name: 'Kayışdağı BİM', district: 'Kayışdağı', address: 'Kayışdağı Mah. Merkez Cad. No:82', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 3.8, priority: 'Normal' },
  { id: 'CAR023', name: 'İçerenköy CarrefourSA', district: 'İçerenköy', address: 'İçerenköy Mah. Merkez Cad. No:70', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 5.0, priority: 'Normal' },
  { id: 'CAR024', name: 'Çekmeköy File Market', district: 'Çekmeköy', address: 'Çekmeköy Mah. Merkez Cad. No:69', windowStart: '13:00', windowEnd: '18:00', avgVolumeM3: 4.9, priority: 'Normal' },
  { id: 'CAR025', name: 'Kavacık Migros', district: 'Kavacık', address: 'Kavacık Mah. Merkez Cad. No:6', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 2.2, priority: 'Yüksek' },
  { id: 'CAR026', name: 'Çengelköy Şok', district: 'Çengelköy', address: 'Çengelköy Mah. Merkez Cad. No:3', windowStart: '08:00', windowEnd: '12:00', avgVolumeM3: 1.1, priority: 'Normal' },
  { id: 'CAR027', name: 'Altunizade Çağrı Market', district: 'Altunizade', address: 'Altunizade Mah. Merkez Cad. No:56', windowStart: '09:00', windowEnd: '17:00', avgVolumeM3: 4.1, priority: 'Normal' },
]

/** Müşteriler sekmesi özet metrikleri. */
export const customerSummary = {
  total: customers.length,
  highPriority: customers.filter((c) => c.priority === 'Yüksek').length,
  activeDistricts: new Set(customers.map((c) => c.district)).size,
  // DİKKAT: totalOrders hesaplamasını da buradan sildik
}

export const priorityMeta: Record<
  CustomerDto['priority'],
  { label: string; className: string }
> = {
  Yüksek: {
    label: 'Yüksek',
    className: 'bg-destructive/10 text-destructive border-destructive/25',
  },
  Normal: {
    label: 'Normal',
    className: 'bg-primary/10 text-primary border-primary/25',
  },
  Düşük: {
    label: 'Düşük',
    className: 'bg-muted text-muted-foreground border-border',
  },
}

export type FleetStatus = 'Aktif' | 'Arızalı' | 'İzinde'

/** Araç donanım özellikleri (ADR, soğuk zincir, kuyruk asansörü vb.) */
export type FleetFeature = 'Soğutuculu' | 'Asansörlü' | 'Tehlikeli Madde' | 'Palet Taşıma'

export const fleetFeatureList: FleetFeature[] = [
  'Soğutuculu',
  'Asansörlü',
  'Tehlikeli Madde',
  'Palet Taşıma',
]

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
    features: ['Soğutuculu'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-002',
    driverName: 'Mehmet Demir',
    plate: '34 DEF 456',
    depot: 'Üsküdar',
    vehicleType: 'Kamyonet',
    capacityMaxKg: 3500,
    capacityMaxM3: 16,
    features: ['Asansörlü', 'Palet Taşıma'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-003',
    driverName: 'Zeynep Kaya',
    plate: '34 GHI 789',
    depot: 'Avcılar',
    vehicleType: 'Panelvan',
    capacityMaxKg: 1200,
    capacityMaxM3: 6,
    features: ['Soğutuculu', 'Asansörlü'] as FleetFeature[],
    status: 'İzinde',
  },
  {
    id: 'ARC-004',
    driverName: 'Emre Şahin',
    plate: '34 JKL 012',
    depot: 'Üsküdar',
    vehicleType: 'Kamyonet',
    capacityMaxKg: 2800,
    capacityMaxM3: 14,
    features: ['Tehlikeli Madde'] as FleetFeature[],
    status: 'Arızalı',
  },
  {
    id: 'ARC-005',
    driverName: 'Fatma Aydın',
    plate: '34 MNO 345',
    depot: 'Avcılar',
    vehicleType: 'Panelvan',
    capacityMaxKg: 1500,
    capacityMaxM3: 8,
    features: [] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-006',
    driverName: 'Burak Doğan',
    plate: '34 STU 678',
    depot: 'Üsküdar',
    vehicleType: 'Kamyon',
    capacityMaxKg: 7500,
    capacityMaxM3: 32,
    features: ['Asansörlü', 'Palet Taşıma', 'Tehlikeli Madde'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-007',
    driverName: 'Selin Arslan',
    plate: '34 VYZ 901',
    depot: 'Avcılar',
    vehicleType: 'Kamyon',
    capacityMaxKg: 7500,
    capacityMaxM3: 32,
    features: ['Soğutuculu', 'Palet Taşıma'] as FleetFeature[],
    status: 'İzinde',
  },
  {
    id: 'ARC-008',
    driverName: 'Onur Güneş',
    plate: '34 ABD 234',
    depot: 'Üsküdar',
    vehicleType: 'Kamyonet',
    capacityMaxKg: 3500,
    capacityMaxM3: 16,
    features: ['Asansörlü'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-009',
    driverName: 'Deniz Koç',
    plate: '34 EFG 567',
    depot: 'Avcılar',
    vehicleType: 'Panelvan',
    capacityMaxKg: 1500,
    capacityMaxM3: 8,
    features: ['Soğutuculu'] as FleetFeature[],
    status: 'Arızalı',
  },
  {
    id: 'ARC-010',
    driverName: 'Gökhan Yıldız',
    plate: '34 HİJ 890',
    depot: 'Üsküdar',
    vehicleType: 'Kamyon',
    capacityMaxKg: 7500,
    capacityMaxM3: 32,
    features: ['Palet Taşıma', 'Tehlikeli Madde'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-011',
    driverName: 'Merve Aksoy',
    plate: '34 KLM 123',
    depot: 'Avcılar',
    vehicleType: 'Kamyonet',
    capacityMaxKg: 3500,
    capacityMaxM3: 16,
    features: ['Asansörlü', 'Soğutuculu'] as FleetFeature[],
    status: 'Aktif',
  },
  {
    id: 'ARC-012',
    driverName: 'Kaan Öztürk',
    plate: '34 NOP 456',
    depot: 'Üsküdar',
    vehicleType: 'Panelvan',
    capacityMaxKg: 1200,
    capacityMaxM3: 6,
    features: [] as FleetFeature[],
    status: 'İzinde',
  },
]

export const fleetStatusMeta: Record<
  FleetStatus,
  { label: string; className: string; dotClassName: string }
> = {
  Aktif: {
    label: 'Aktif',
    className: 'bg-primary/10 text-primary border-primary/25',
    dotClassName: 'bg-primary',
  },
  Arızalı: {
    label: 'Arızalı',
    className: 'bg-destructive/10 text-destructive border-destructive/25',
    dotClassName: 'bg-destructive',
  },
  İzinde: {
    label: 'İzinde',
    className: 'bg-warning/10 text-warning border-warning/30',
    dotClassName: 'bg-warning',
  },
}

/** Filo sekmesi özet metrikleri (araç sayıları ve toplam kapasite). */
export const fleetSummary = {
  total: fleetVehicles.length,
  active: fleetVehicles.filter((v) => v.status === 'Aktif').length,
  onLeave: fleetVehicles.filter((v) => v.status === 'İzinde').length,
  broken: fleetVehicles.filter((v) => v.status === 'Arızalı').length,
  totalCapacityKg: fleetVehicles.reduce((sum, v) => sum + v.capacityMaxKg, 0),
}

export const reportMetrics = [
  {
    label: 'Aylık Yakıt Tasarrufu',
    value: '₺38.400',
    delta: '+%12,4',
    deltaTone: 'up' as const,
    caption: 'Geçen aya göre',
  },
  {
    label: 'Zamanında Teslimat Oranı',
    value: '%98',
    delta: '+1,2 puan',
    deltaTone: 'up' as const,
    caption: 'Hedef: %95',
  },
  {
    label: 'Depo Çıkış Hacmi',
    value: '1.284 m³',
    delta: '+%8,1',
    deltaTone: 'up' as const,
    caption: 'Bu ay toplam',
  },
  {
    label: 'Ortalama Rota Verimi',
    value: '%91,6',
    delta: '-0,4 puan',
    deltaTone: 'down' as const,
    caption: 'Kapasite kullanımı',
  },
]

/** Aylık depo çıkış hacmi (bar grafik mockup) */
export const monthlyVolume = [
  { label: 'Oca', value: 940 },
  { label: 'Şub', value: 1010 },
  { label: 'Mar', value: 880 },
  { label: 'Nis', value: 1120 },
  { label: 'May', value: 1240 },
  { label: 'Haz', value: 1180 },
  { label: 'Tem', value: 1284 },
]

/** Haftalık zamanında teslimat oranı (line grafik mockup, yüzde) */
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
  completed: {
    label: 'Tamamlandı',
    className: 'bg-success/10 text-success border-success/25',
  },
  enroute: {
    label: 'Yolda',
    className: 'bg-primary/10 text-primary border-primary/25',
  },
  pending: {
    label: 'Bekliyor',
    className: 'bg-muted text-muted-foreground border-border',
  },
  risk: {
    label: 'Gecikme Riski',
    className: 'bg-destructive/10 text-destructive border-destructive/25',
  },
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}s ${m.toString().padStart(2, '0')}d`
}

/** "HH:mm" -> gün içi dakika */
export function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

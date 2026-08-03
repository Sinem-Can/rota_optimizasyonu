// Veri sözleşmeleri C# .NET backend DTO'ları ile birebir eşleşecek şekilde tanımlanmıştır.
// Örn: GET /api/v1/optimization/plans/{planId}

export type DriverKey = 'a' | 'b' | 'c' | 'd' | 'e'

export type StopStatus = 'completed' | 'enroute' | 'pending' | 'risk'

export interface StopDto {
  id: string
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
export const driverTheme: Record<
  DriverKey,
  {
    solid: string
    text: string
    soft: string
    border: string
    ring: string
    cssVar: string
  }
> = {
  a: {
    solid: 'bg-driver-a',
    text: 'text-driver-a',
    soft: 'bg-driver-a/10',
    border: 'border-driver-a',
    ring: 'ring-driver-a/30',
    cssVar: 'var(--driver-a)',
  },
  b: {
    solid: 'bg-driver-b',
    text: 'text-driver-b',
    soft: 'bg-driver-b/10',
    border: 'border-driver-b',
    ring: 'ring-driver-b/30',
    cssVar: 'var(--driver-b)',
  },
  c: {
    solid: 'bg-driver-c',
    text: 'text-driver-c',
    soft: 'bg-driver-c/10',
    border: 'border-driver-c',
    ring: 'ring-driver-c/30',
    cssVar: 'var(--driver-c)',
  },
  d: {
    solid: 'bg-driver-d',
    text: 'text-driver-d',
    soft: 'bg-driver-d/10',
    border: 'border-driver-d',
    ring: 'ring-driver-d/30',
    cssVar: 'var(--driver-d)',
  },
  e: {
    solid: 'bg-driver-e',
    text: 'text-driver-e',
    soft: 'bg-driver-e/10',
    border: 'border-driver-e',
    ring: 'ring-driver-e/30',
    cssVar: 'var(--driver-e)',
  },
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
  orderCount: number
}

export const customers: CustomerDto[] = [
  {
    id: 'MST-001',
    name: 'Anadolu Market A.Ş.',
    district: 'Kadıköy',
    address: 'Caferağa Mah. Sakız Sok. No:14/A, Kadıköy',
    avgVolumeM3: 1.2,
    windowStart: '09:00',
    windowEnd: '11:00',
    priority: 'Normal',
    orderCount: 42,
  },
  {
    id: 'MST-002',
    name: 'Deniz Lojistik Depo',
    district: 'Üsküdar',
    address: 'Kısıklı Mah. Alemdağ Cad. No:112, Üsküdar',
    avgVolumeM3: 2.4,
    windowStart: '10:00',
    windowEnd: '12:30',
    priority: 'Yüksek',
    orderCount: 68,
  },
  {
    id: 'MST-003',
    name: 'Boğaz Cafe Zinciri',
    district: 'Beşiktaş',
    address: 'Bebek Mah. Cevdetpaşa Cad. No:8, Beşiktaş',
    avgVolumeM3: 0.9,
    windowStart: '14:00',
    windowEnd: '16:00',
    priority: 'Normal',
    orderCount: 31,
  },
  {
    id: 'MST-004',
    name: 'Levent Ofis Tedarik',
    district: 'Beşiktaş',
    address: 'Levent Mah. Sülün Sok. No:23 Kat:4, Beşiktaş',
    avgVolumeM3: 1.8,
    windowStart: '15:00',
    windowEnd: '17:00',
    priority: 'Düşük',
    orderCount: 19,
  },
  {
    id: 'MST-005',
    name: 'Bahçelievler Toptan Gıda',
    district: 'Bahçelievler',
    address: 'Şirinevler Mah. Meriç Cad. No:47, Bahçelievler',
    avgVolumeM3: 4.1,
    windowStart: '09:00',
    windowEnd: '10:30',
    priority: 'Yüksek',
    orderCount: 84,
  },
  {
    id: 'MST-006',
    name: 'Ataköy Yapı Market',
    district: 'Bakırköy',
    address: 'Ataköy 7-8-9. Kısım Mah. Çobançeşme E-5 Yanyol No:20, Bakırköy',
    avgVolumeM3: 5.6,
    windowStart: '14:00',
    windowEnd: '16:00',
    priority: 'Yüksek',
    orderCount: 57,
  },
  {
    id: 'MST-007',
    name: 'Şişli Eczane Deposu',
    district: 'Şişli',
    address: 'Halaskargazi Mah. Rumeli Cad. No:31/B, Şişli',
    avgVolumeM3: 0.4,
    windowStart: '09:30',
    windowEnd: '11:30',
    priority: 'Yüksek',
    orderCount: 96,
  },
  {
    id: 'MST-008',
    name: 'Mecidiyeköy Teknoloji',
    district: 'Şişli',
    address: 'Mecidiyeköy Mah. Büyükdere Cad. No:85 Kat:2, Şişli',
    avgVolumeM3: 1.5,
    windowStart: '12:00',
    windowEnd: '14:00',
    priority: 'Normal',
    orderCount: 24,
  },
  {
    id: 'MST-009',
    name: 'Maslak Plaza Kurye',
    district: 'Sarıyer',
    address: 'Maslak Mah. Ahi Evran Cad. Polaris Plaza No:1, Sarıyer',
    avgVolumeM3: 1.9,
    windowStart: '14:30',
    windowEnd: '16:30',
    priority: 'Düşük',
    orderCount: 12,
  },
  {
    id: 'MST-010',
    name: 'Pendik Sanayi Tedarik',
    district: 'Pendik',
    address: 'Dumlupınar Mah. Sanayi Cad. No:64, Pendik',
    avgVolumeM3: 4.8,
    windowStart: '08:00',
    windowEnd: '10:00',
    priority: 'Normal',
    orderCount: 45,
  },
  {
    id: 'MST-011',
    name: 'Kartal Zincir Market',
    district: 'Kartal',
    address: 'Cevizli Mah. Bağdat Cad. No:203, Kartal',
    avgVolumeM3: 4.2,
    windowStart: '11:00',
    windowEnd: '13:00',
    priority: 'Yüksek',
    orderCount: 73,
  },
  {
    id: 'MST-012',
    name: 'Eyüpsultan Fırın Grubu',
    district: 'Eyüpsultan',
    address: 'Akşemsettin Mah. Fevzi Çakmak Cad. No:19, Eyüpsultan',
    avgVolumeM3: 1.1,
    windowStart: '10:00',
    windowEnd: '12:00',
    priority: 'Normal',
    orderCount: 38,
  },
  {
    id: 'MST-013',
    name: 'Sarıyer Otel Tedarik',
    district: 'Sarıyer',
    address: 'Tarabya Mah. Haydar Aliyev Cad. No:76, Sarıyer',
    avgVolumeM3: 1.7,
    windowStart: '13:00',
    windowEnd: '15:00',
    priority: 'Düşük',
    orderCount: 21,
  },
  {
    id: 'MST-014',
    name: 'Beylikdüzü Toptan Gıda',
    district: 'Beylikdüzü',
    address: 'Barış Mah. Hürriyet Bulvarı No:158, Beylikdüzü',
    avgVolumeM3: 3.4,
    windowStart: '13:00',
    windowEnd: '16:00',
    priority: 'Normal',
    orderCount: 52,
  },
]

/** Müşteriler sekmesi özet metrikleri. */
export const customerSummary = {
  total: customers.length,
  highPriority: customers.filter((c) => c.priority === 'Yüksek').length,
  activeDistricts: new Set(customers.map((c) => c.district)).size,
  totalOrders: customers.reduce((sum, c) => sum + c.orderCount, 0),
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

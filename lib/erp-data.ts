/**
 * ERP Yönetimi modülü demo verisi.
 * Cari (muhasebe), stok ve depo kayıtları; gerçek uygulamada ERP servisinden gelir.
 */

export type ErpRecordStatus = 'Aktif' | 'Pasif' | 'Bakımda'

/* ---------------------------------- Cari ---------------------------------- */

export type ErpAccountType = 'Alıcı' | 'Satıcı' | 'Alıcı + Satıcı'

export interface ErpAccountDto {
  id: string
  /** Muhasebe hesap kodu, örn. 120.01.45 */
  code: string
  name: string
  type: ErpAccountType
  district: string
  /** Bakiye TL. Pozitif = alacak, negatif = borç. */
  balance: number
  status: ErpRecordStatus
}

export const erpAccountTypes: ErpAccountType[] = ['Alıcı', 'Satıcı', 'Alıcı + Satıcı']

export const erpAccounts: ErpAccountDto[] = [
  {
    id: 'CAR-001',
    code: '120.01.45',
    name: 'Ataköy Yapı Market',
    type: 'Alıcı',
    district: 'Bakırköy',
    balance: 145250,
    status: 'Aktif',
  },
  {
    id: 'CAR-002',
    code: '120.01.12',
    name: 'Kadıköy Gıda Toptan',
    type: 'Alıcı',
    district: 'Kadıköy',
    balance: 89400,
    status: 'Aktif',
  },
  {
    id: 'CAR-003',
    code: '320.02.08',
    name: 'Marmara Ambalaj San. Tic.',
    type: 'Satıcı',
    district: 'Pendik',
    balance: -62300,
    status: 'Aktif',
  },
  {
    id: 'CAR-004',
    code: '120.01.77',
    name: 'Beşiktaş Zincir Market',
    type: 'Alıcı',
    district: 'Beşiktaş',
    balance: 210900,
    status: 'Aktif',
  },
  {
    id: 'CAR-005',
    code: '320.02.15',
    name: 'Anadolu Akaryakıt A.Ş.',
    type: 'Satıcı',
    district: 'Ümraniye',
    balance: -178640,
    status: 'Aktif',
  },
  {
    id: 'CAR-006',
    code: '120.03.09',
    name: 'Levent Ofis Tedarik',
    type: 'Alıcı + Satıcı',
    district: 'Beşiktaş',
    balance: 12750,
    status: 'Aktif',
  },
  {
    id: 'CAR-007',
    code: '120.01.31',
    name: 'Şişli Restoran Grubu',
    type: 'Alıcı',
    district: 'Şişli',
    balance: 54120,
    status: 'Aktif',
  },
  {
    id: 'CAR-008',
    code: '320.02.22',
    name: 'İstanbul Palet Lojistik',
    type: 'Satıcı',
    district: 'Beylikdüzü',
    balance: -35800,
    status: 'Aktif',
  },
  {
    id: 'CAR-009',
    code: '120.01.58',
    name: 'Sarıyer Otel Zinciri',
    type: 'Alıcı',
    district: 'Sarıyer',
    balance: 167300,
    status: 'Aktif',
  },
  {
    id: 'CAR-010',
    code: '120.01.64',
    name: 'Pendik Sanayi Market',
    type: 'Alıcı',
    district: 'Pendik',
    balance: 43980,
    status: 'Pasif',
  },
]

/* ---------------------------------- Stok ---------------------------------- */

export type ErpUnit = 'Adet' | 'Koli' | 'Palet' | 'Kg' | 'Litre' | 'Çuval'

export interface ErpStockItemDto {
  id: string
  code: string
  name: string
  category: string
  unit: ErpUnit
  /** Eldeki miktar */
  quantity: number
  /** Kritik eşik; altına düşünce uyarı verilir. */
  criticalLevel: number
  warehouse: string
}

export const erpUnits: ErpUnit[] = ['Adet', 'Koli', 'Palet', 'Kg', 'Litre', 'Çuval']

export const erpStockCategories = [
  'Gıda',
  'İçecek',
  'Ambalaj',
  'Temizlik',
  'Yapı Malzemesi',
  'Sarf Malzeme',
]

export const erpStockItems: ErpStockItemDto[] = [
  {
    id: 'STK-001',
    code: 'GDA-1045',
    name: 'Ayçiçek Yağı 5 lt',
    category: 'Gıda',
    unit: 'Koli',
    quantity: 1240,
    criticalLevel: 300,
    warehouse: 'Avcılar Ana Depo',
  },
  {
    id: 'STK-002',
    code: 'GDA-2210',
    name: 'Buğday Unu 25 kg',
    category: 'Gıda',
    unit: 'Çuval',
    quantity: 180,
    criticalLevel: 250,
    warehouse: 'Avcılar Ana Depo',
  },
  {
    id: 'STK-003',
    code: 'ICE-3308',
    name: 'Maden Suyu 6x1,5 lt',
    category: 'İçecek',
    unit: 'Koli',
    quantity: 2860,
    criticalLevel: 500,
    warehouse: 'Üsküdar Bölge Depo',
  },
  {
    id: 'STK-004',
    code: 'AMB-4102',
    name: 'Oluklu Mukavva Kutu 40x30',
    category: 'Ambalaj',
    unit: 'Adet',
    quantity: 9450,
    criticalLevel: 2000,
    warehouse: 'Beylikdüzü Transfer Merkezi',
  },
  {
    id: 'STK-005',
    code: 'TEM-5017',
    name: 'Endüstriyel Yüzey Temizleyici 20 lt',
    category: 'Temizlik',
    unit: 'Litre',
    quantity: 640,
    criticalLevel: 200,
    warehouse: 'Avcılar Ana Depo',
  },
  {
    id: 'STK-006',
    code: 'YAP-6023',
    name: 'Seramik Yapıştırıcı 25 kg',
    category: 'Yapı Malzemesi',
    unit: 'Palet',
    quantity: 42,
    criticalLevel: 60,
    warehouse: 'Pendik Soğuk Hava Deposu',
  },
  {
    id: 'STK-007',
    code: 'GDA-1188',
    name: 'Dondurulmuş Sebze Karışımı 10 kg',
    category: 'Gıda',
    unit: 'Kg',
    quantity: 3120,
    criticalLevel: 800,
    warehouse: 'Pendik Soğuk Hava Deposu',
  },
  {
    id: 'STK-008',
    code: 'SRF-7745',
    name: 'Streç Film 500 mm',
    category: 'Sarf Malzeme',
    unit: 'Adet',
    quantity: 96,
    criticalLevel: 150,
    warehouse: 'Beylikdüzü Transfer Merkezi',
  },
  {
    id: 'STK-009',
    code: 'ICE-3390',
    name: 'Meyve Suyu 12x200 ml',
    category: 'İçecek',
    unit: 'Koli',
    quantity: 1730,
    criticalLevel: 400,
    warehouse: 'Üsküdar Bölge Depo',
  },
  {
    id: 'STK-010',
    code: 'AMB-4260',
    name: 'Ahşap Euro Palet 120x80',
    category: 'Ambalaj',
    unit: 'Adet',
    quantity: 510,
    criticalLevel: 120,
    warehouse: 'Avcılar Ana Depo',
  },
]

/* ---------------------------------- Depo ---------------------------------- */

export interface ErpWarehouseDto {
  id: string
  code: string
  name: string
  district: string
  address: string
  manager: string
  capacityM3: number
  usedM3: number
  status: ErpRecordStatus
}

export const erpWarehouses: ErpWarehouseDto[] = [
  {
    id: 'DPO-001',
    code: 'AVC-01',
    name: 'Avcılar Ana Depo',
    district: 'Avcılar',
    address: 'Ambarlı Mah. Liman Cad. No:14, Avcılar',
    manager: 'Kemal Aydın',
    capacityM3: 4800,
    usedM3: 3960,
    status: 'Aktif',
  },
  {
    id: 'DPO-002',
    code: 'USK-01',
    name: 'Üsküdar Bölge Depo',
    district: 'Üsküdar',
    address: 'Kısıklı Mah. Alemdağ Cad. No:220, Üsküdar',
    manager: 'Serpil Yıldız',
    capacityM3: 2600,
    usedM3: 1820,
    status: 'Aktif',
  },
  {
    id: 'DPO-003',
    code: 'PND-01',
    name: 'Pendik Soğuk Hava Deposu',
    district: 'Pendik',
    address: 'Dumlupınar Mah. Sanayi Cad. No:88, Pendik',
    manager: 'Hakan Demirci',
    capacityM3: 1500,
    usedM3: 1395,
    status: 'Aktif',
  },
  {
    id: 'DPO-004',
    code: 'BYL-01',
    name: 'Beylikdüzü Transfer Merkezi',
    district: 'Beylikdüzü',
    address: 'Barış Mah. Hürriyet Bulvarı No:340, Beylikdüzü',
    manager: 'Nurcan Şahin',
    capacityM3: 1900,
    usedM3: 610,
    status: 'Aktif',
  },
  {
    id: 'DPO-005',
    code: 'SRY-01',
    name: 'Sarıyer Ara Depo',
    district: 'Sarıyer',
    address: 'Tarabya Mah. Haydar Aliyev Cad. No:12, Sarıyer',
    manager: 'Emre Kılıç',
    capacityM3: 800,
    usedM3: 250,
    status: 'Bakımda',
  },
]

/* ------------------------------- Araç Kartları ------------------------------ */
// (Hata çıkmaması için araçları özetlerin üstüne taşıdık!)

export interface ErpVehicleDto {
  id: string
  plate: string
  driver: string
  type: string
  depot: string
  capacityKg: number
  volumeM3: number
  status: 'Aktif' | 'İzinde' | 'Arızalı'
  features: string
}

export const erpVehicles: ErpVehicleDto[] = [
  {
    id: 'VHC-001',
    plate: '54 LIX 01',
    driver: 'Ahmet Yılmaz',
    type: 'Panelvan',
    depot: 'Avcılar',
    capacityKg: 750,
    volumeM3: 3.2,
    status: 'Aktif',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-002',
    plate: '54 LIX 02',
    driver: 'Mehmet Demir',
    type: 'Panelvan',
    depot: 'Üsküdar',
    capacityKg: 1000,
    volumeM3: 6.0,
    status: 'Aktif',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-003',
    plate: '54 LIX 03',
    driver: 'Zeynep Kaya',
    type: 'Panelvan',
    depot: 'Avcılar',
    capacityKg: 1300,
    volumeM3: 10.8,
    status: 'İzinde',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-004',
    plate: '54 LIX 04',
    driver: 'Emre Şahin',
    type: 'Panelvan',
    depot: 'Üsküdar',
    capacityKg: 1600,
    volumeM3: 15.5,
    status: 'Arızalı',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-005',
    plate: '54 LIX 05',
    driver: 'Fatma Aydın',
    type: 'Kamyonet',
    depot: 'Avcılar',
    capacityKg: 3200,
    volumeM3: 18.0,
    status: 'Aktif',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-006',
    plate: '54 LIX 06',
    driver: 'Burak Doğan',
    type: 'Kamyonet',
    depot: 'Üsküdar',
    capacityKg: 3500,
    volumeM3: 22.0,
    status: 'Aktif',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-007',
    plate: '54 LIX 07',
    driver: 'Selin Arslan',
    type: 'Kamyon',
    depot: 'Avcılar',
    capacityKg: 6500,
    volumeM3: 35.0,
    status: 'İzinde',
    features: 'Palet Taşıma',
  },
  {
    id: 'VHC-008',
    plate: '54 LIX 08',
    driver: 'Hasan Yılmaz',
    type: 'Kamyon',
    depot: 'Üsküdar',
    capacityKg: 12000,
    volumeM3: 45.0,
    status: 'Aktif',
    features: 'Palet Taşıma',
  },
]


/* --------------------------------- Özetler -------------------------------- */

export const erpWarehouseNames = erpWarehouses.map((w) => w.name)

/** ERP sekmesi KPI özetleri. */
export const erpSummary = {
  accountCount: erpAccounts.length,
  receivableTotal: erpAccounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0),
  stockItemCount: erpStockItems.length,
  criticalStockCount: erpStockItems.filter((s) => s.quantity < s.criticalLevel).length,
  warehouseCount: erpWarehouses.length,
  vehicleCount: erpVehicles.length, 
  activeVehicleCount: erpVehicles.filter((v) => v.status === 'Aktif').length, 
  occupancyPct: Math.round(
    (erpWarehouses.reduce((sum, w) => sum + w.usedM3, 0) /
      erpWarehouses.reduce((sum, w) => sum + w.capacityM3, 0)) *
      100,
  ),
}

export const erpStatusMeta: Record<ErpRecordStatus, { className: string; dotClassName: string }> = {
  Aktif: {
    className: 'bg-success/10 text-success border-success/30',
    dotClassName: 'bg-success',
  },
  Pasif: {
    className: 'bg-muted text-muted-foreground border-border',
    dotClassName: 'bg-muted-foreground',
  },
  Bakımda: {
    className: 'bg-warning/10 text-warning border-warning/30',
    dotClassName: 'bg-warning',
  },
}
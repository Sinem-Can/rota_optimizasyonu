/**
 * ERP Yönetimi modülü demo verisi.
 * Cari (muhasebe), stok ve depo kayıtları; gerçek uygulamada ERP servisinden gelir.
 */

export type ErpRecordStatus = 'Aktif' | 'Pasif' | 'Bakımda'

/* ---------------------------------- Cari ---------------------------------- */

// YENİ: Alıcı/Satıcı yerine Müşteri/Tedarikçi terimleri kullanılıyor
export type ErpAccountType = 'Müşteri' | 'Tedarikçi' | 'Müşteri + Tedarikçi'

export interface ErpAccountDto {
  id: string
  /** Muhasebe hesap kodu, Müşteri için 120.xx.xx, Tedarikçi için 320.xx.xx */
  code: string
  name: string
  type: ErpAccountType
  district: string
  /** Bakiye TL. Pozitif = alacak, negatif = borç. */
  balance: number
  status: ErpRecordStatus
}

// Yeni Cari Kaydı formundaki dropdown seçenekleri buradan beslenir:
export const erpAccountTypes: ErpAccountType[] = ['Müşteri', 'Tedarikçi', 'Müşteri + Tedarikçi']

// YENİ: Excel'deki 27 müşterinin tamamı (120'li kodlar ve gerçeğe uygun bakiyelerle)
export const erpAccounts: ErpAccountDto[] = [
  {
    id: 'CAR001',
    code: '120.82.15',
    name: 'Şirinevler Şok Market',
    type: 'Müşteri',
    district: 'Şirinevler',
    balance: 11556,
    status: 'Aktif',
  },
  {
    id: 'CAR002',
    code: '120.95.36',
    name: 'Bakırköy Migros',
    type: 'Müşteri',
    district: 'Bakırköy',
    balance: 69196,
    status: 'Aktif',
  },
  {
    id: 'CAR003',
    code: '120.29.18',
    name: 'Beşiktaş Macrocenter',
    type: 'Müşteri',
    district: 'Beşiktaş',
    balance: 198061,
    status: 'Aktif',
  },
  {
    id: 'CAR004',
    code: '120.14.87',
    name: 'Şişli CarrefourSA',
    type: 'Müşteri',
    district: 'Şişli',
    balance: 199161,
    status: 'Aktif',
  },
  {
    id: 'CAR005',
    code: '120.70.12',
    name: 'Mecidiyeköy Çağrı Market',
    type: 'Müşteri',
    district: 'Mecidiyeköy',
    balance: 159794,
    status: 'Aktif',
  },
  {
    id: 'CAR006',
    code: '120.55.05',
    name: 'Levent File Market',
    type: 'Müşteri',
    district: 'Levent',
    balance: 12811,
    status: 'Aktif',
  },
  {
    id: 'CAR007',
    code: '120.12.28',
    name: 'Fatih BİM',
    type: 'Müşteri',
    district: 'Fatih',
    balance: 65990,
    status: 'Aktif',
  },
  {
    id: 'CAR008',
    code: '120.65.78',
    name: 'Eyüp Şok Market',
    type: 'Müşteri',
    district: 'Eyüp',
    balance: 11956,
    status: 'Aktif',
  },
  {
    id: 'CAR009',
    code: '120.72.26',
    name: 'Bayrampaşa Hal İçi Market',
    type: 'Müşteri',
    district: 'Bayrampaşa',
    balance: 192700,
    status: 'Aktif',
  },
  {
    id: 'CAR010',
    code: '120.84.90',
    name: 'Bağcılar Migros',
    type: 'Müşteri',
    district: 'Bağcılar',
    balance: 147853,
    status: 'Aktif',
  },
  {
    id: 'CAR011',
    code: '120.54.29',
    name: 'Sefaköy CarrefourSA',
    type: 'Müşteri',
    district: 'Sefaköy',
    balance: 122757,
    status: 'Aktif',
  },
  {
    id: 'CAR012',
    code: '120.76.36',
    name: 'Küçükçekmece Çağrı Market',
    type: 'Müşteri',
    district: 'Küçükçekmece',
    balance: 217187,
    status: 'Aktif',
  },
  {
    id: 'CAR013',
    code: '120.01.98',
    name: 'Beylikdüzü Migros 5M',
    type: 'Müşteri',
    district: 'Beylikdüzü',
    balance: 216240,
    status: 'Aktif',
  },
  {
    id: 'CAR014',
    code: '120.21.90',
    name: 'Fenerbahçe Şok',
    type: 'Müşteri',
    district: 'Fenerbahçe',
    balance: 115785,
    status: 'Aktif',
  },
  {
    id: 'CAR015',
    code: '120.44.36',
    name: 'Bostancı Migros',
    type: 'Müşteri',
    district: 'Bostancı',
    balance: 45758,
    status: 'Aktif',
  },
  {
    id: 'CAR016',
    code: '120.28.98',
    name: 'Maltepe CarrefourSA',
    type: 'Müşteri',
    district: 'Maltepe',
    balance: 93236,
    status: 'Aktif',
  },
  {
    id: 'CAR017',
    code: '120.14.12',
    name: 'Pendik File Market',
    type: 'Müşteri',
    district: 'Pendik',
    balance: 104595,
    status: 'Aktif',
  },
  {
    id: 'CAR018',
    code: '120.13.46',
    name: 'Tuzla Çağrı Market',
    type: 'Müşteri',
    district: 'Tuzla',
    balance: 227165,
    status: 'Aktif',
  },
  {
    id: 'CAR019',
    code: '120.45.78',
    name: 'Ümraniye Çarşı Migros',
    type: 'Müşteri',
    district: 'Ümraniye',
    balance: 74342,
    status: 'Aktif',
  },
  {
    id: 'CAR020',
    code: '120.06.94',
    name: 'Çakmak Şok Market',
    type: 'Müşteri',
    district: 'Çakmak',
    balance: 125435,
    status: 'Aktif',
  },
  {
    id: 'CAR021',
    code: '120.69.16',
    name: 'Ataşehir Migros',
    type: 'Müşteri',
    district: 'Ataşehir',
    balance: 246774,
    status: 'Aktif',
  },
  {
    id: 'CAR022',
    code: '120.49.11',
    name: 'Kayışdağı BİM',
    type: 'Müşteri',
    district: 'Kayışdağı',
    balance: 149714,
    status: 'Aktif',
  },
  {
    id: 'CAR023',
    code: '120.38.81',
    name: 'İçerenköy CarrefourSA',
    type: 'Müşteri',
    district: 'İçerenköy',
    balance: 167141,
    status: 'Aktif',
  },
  {
    id: 'CAR024',
    code: '120.47.74',
    name: 'Çekmeköy File Market',
    type: 'Müşteri',
    district: 'Çekmeköy',
    balance: 55407,
    status: 'Aktif',
  },
  {
    id: 'CAR025',
    code: '120.91.09',
    name: 'Kavacık Migros',
    type: 'Müşteri',
    district: 'Kavacık',
    balance: 17012,
    status: 'Aktif',
  },
  {
    id: 'CAR026',
    code: '120.85.30',
    name: 'Çengelköy Şok',
    type: 'Müşteri',
    district: 'Çengelköy',
    balance: 207655,
    status: 'Aktif',
  },
  {
    id: 'CAR027',
    code: '120.38.11',
    name: 'Altunizade Çağrı Market',
    type: 'Müşteri',
    district: 'Altunizade',
    balance: 229216,
    status: 'Aktif',
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
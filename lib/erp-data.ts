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

export type ErpUnit = 'Adet' | 'Koli' | 'Çuval' | 'Litre' | 'Palet' | 'Kg'

export interface ErpStockItemDto {
  id: string
  code: string
  name: string
  category: string
  unit: ErpUnit
  quantity: number
  criticalLevel: number
  warehouse: string
  // Excel'den gelen ekstra veri alanlarımız
  weightKg?: number
  volumeM3?: number
}

// YENİ: Excel'e uygun Kategori, Birim ve Depo seçenekleri
export const erpUnits: ErpUnit[] = ['Adet']
export const erpStockCategories = ['İçecek']

// YENİ: Excel tablosundan birebir alınmış 40 kalemlik (20 Avcılar + 20 Üsküdar) stok listesi!
export const erpStockItems: ErpStockItemDto[] = [
  { id: 'STK-001', code: 'CC-1001', name: 'Coca-Cola 1 L', category: 'İçecek', unit: 'Adet', quantity: 637, criticalLevel: 181, warehouse: 'Avcılar Merkez Depo', weightKg: 5, volumeM3: 0.01 },
  { id: 'STK-002', code: 'CC-1002', name: 'Coca-Cola Zero 1 L', category: 'İçecek', unit: 'Adet', quantity: 2208, criticalLevel: 231, warehouse: 'Avcılar Merkez Depo', weightKg: 8, volumeM3: 0.015 },
  { id: 'STK-003', code: 'FNT-1001', name: 'Fanta 1 L', category: 'İçecek', unit: 'Adet', quantity: 2800, criticalLevel: 126, warehouse: 'Avcılar Merkez Depo', weightKg: 12, volumeM3: 0.02 },
  { id: 'STK-004', code: 'SPR-1001', name: 'Sprite 1 L', category: 'İçecek', unit: 'Adet', quantity: 3771, criticalLevel: 157, warehouse: 'Avcılar Merkez Depo', weightKg: 15, volumeM3: 0.025 },
  { id: 'STK-005', code: 'FT-1001', name: 'Fuse Tea Şeftali', category: 'İçecek', unit: 'Adet', quantity: 3815, criticalLevel: 253, warehouse: 'Avcılar Merkez Depo', weightKg: 20, volumeM3: 0.03 },
  { id: 'STK-006', code: 'FT-1002', name: 'Fuse Tea Limon', category: 'İçecek', unit: 'Adet', quantity: 2695, criticalLevel: 242, warehouse: 'Avcılar Merkez Depo', weightKg: 25, volumeM3: 0.04 },
  { id: 'STK-007', code: 'CPY-1001', name: 'Cappy Karışık', category: 'İçecek', unit: 'Adet', quantity: 1872, criticalLevel: 300, warehouse: 'Avcılar Merkez Depo', weightKg: 30, volumeM3: 0.05 },
  { id: 'STK-008', code: 'DML-1001', name: 'Damla 1.5 L', category: 'İçecek', unit: 'Adet', quantity: 2495, criticalLevel: 240, warehouse: 'Avcılar Merkez Depo', weightKg: 18, volumeM3: 0.018 },
  { id: 'STK-009', code: 'PWR-1001', name: 'Powerade', category: 'İçecek', unit: 'Adet', quantity: 3600, criticalLevel: 287, warehouse: 'Avcılar Merkez Depo', weightKg: 10, volumeM3: 0.012 },
  { id: 'STK-010', code: 'MNS-1001', name: 'Monster', category: 'İçecek', unit: 'Adet', quantity: 3330, criticalLevel: 296, warehouse: 'Avcılar Merkez Depo', weightKg: 40, volumeM3: 0.06 },
  { id: 'STK-011', code: 'CC-1003', name: 'Coca-Cola 330 ml', category: 'İçecek', unit: 'Adet', quantity: 2160, criticalLevel: 292, warehouse: 'Avcılar Merkez Depo', weightKg: 5, volumeM3: 0.01 },
  { id: 'STK-012', code: 'FNT-1002', name: 'Fanta 330 ml', category: 'İçecek', unit: 'Adet', quantity: 3316, criticalLevel: 250, warehouse: 'Avcılar Merkez Depo', weightKg: 8, volumeM3: 0.015 },
  { id: 'STK-013', code: 'SPR-1002', name: 'Sprite 330 ml', category: 'İçecek', unit: 'Adet', quantity: 1956, criticalLevel: 161, warehouse: 'Avcılar Merkez Depo', weightKg: 12, volumeM3: 0.02 },
  { id: 'STK-014', code: 'SCH-1001', name: 'Schweppes', category: 'İçecek', unit: 'Adet', quantity: 160, criticalLevel: 257, warehouse: 'Avcılar Merkez Depo', weightKg: 15, volumeM3: 0.025 },
  { id: 'STK-015', code: 'CPY-1002', name: 'Cappy Portakal', category: 'İçecek', unit: 'Adet', quantity: 480, criticalLevel: 128, warehouse: 'Avcılar Merkez Depo', weightKg: 20, volumeM3: 0.03 },
  { id: 'STK-016', code: 'CC-1004', name: 'Coca-Cola 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 1326, criticalLevel: 125, warehouse: 'Avcılar Merkez Depo', weightKg: 25, volumeM3: 0.04 },
  { id: 'STK-017', code: 'FNT-1003', name: 'Fanta 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 1991, criticalLevel: 102, warehouse: 'Avcılar Merkez Depo', weightKg: 30, volumeM3: 0.05 },
  { id: 'STK-018', code: 'SPR-1003', name: 'Sprite 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 3487, criticalLevel: 275, warehouse: 'Avcılar Merkez Depo', weightKg: 18, volumeM3: 0.018 },
  { id: 'STK-019', code: 'BRN-1001', name: 'Burn', category: 'İçecek', unit: 'Adet', quantity: 2158, criticalLevel: 273, warehouse: 'Avcılar Merkez Depo', weightKg: 10, volumeM3: 0.012 },
  { id: 'STK-020', code: 'DML-1002', name: 'Damla 0.5 L', category: 'İçecek', unit: 'Adet', quantity: 1437, criticalLevel: 153, warehouse: 'Avcılar Merkez Depo', weightKg: 40, volumeM3: 0.06 },
  { id: 'STK-021', code: 'CC-1001', name: 'Coca-Cola 1 L', category: 'İçecek', unit: 'Adet', quantity: 1777, criticalLevel: 164, warehouse: 'Üsküdar Merkez Depo', weightKg: 5, volumeM3: 0.01 },
  { id: 'STK-022', code: 'CC-1002', name: 'Coca-Cola Zero 1 L', category: 'İçecek', unit: 'Adet', quantity: 1574, criticalLevel: 191, warehouse: 'Üsküdar Merkez Depo', weightKg: 8, volumeM3: 0.015 },
  { id: 'STK-023', code: 'FNT-1001', name: 'Fanta 1 L', category: 'İçecek', unit: 'Adet', quantity: 3447, criticalLevel: 196, warehouse: 'Üsküdar Merkez Depo', weightKg: 12, volumeM3: 0.02 },
  { id: 'STK-024', code: 'SPR-1001', name: 'Sprite 1 L', category: 'İçecek', unit: 'Adet', quantity: 3205, criticalLevel: 231, warehouse: 'Üsküdar Merkez Depo', weightKg: 15, volumeM3: 0.025 },
  { id: 'STK-025', code: 'FT-1001', name: 'Fuse Tea Şeftali', category: 'İçecek', unit: 'Adet', quantity: 2762, criticalLevel: 119, warehouse: 'Üsküdar Merkez Depo', weightKg: 20, volumeM3: 0.03 },
  { id: 'STK-026', code: 'FT-1002', name: 'Fuse Tea Limon', category: 'İçecek', unit: 'Adet', quantity: 3111, criticalLevel: 187, warehouse: 'Üsküdar Merkez Depo', weightKg: 25, volumeM3: 0.04 },
  { id: 'STK-027', code: 'CPY-1001', name: 'Cappy Karışık', category: 'İçecek', unit: 'Adet', quantity: 517, criticalLevel: 242, warehouse: 'Üsküdar Merkez Depo', weightKg: 30, volumeM3: 0.05 },
  { id: 'STK-028', code: 'DML-1001', name: 'Damla 1.5 L', category: 'İçecek', unit: 'Adet', quantity: 2353, criticalLevel: 174, warehouse: 'Üsküdar Merkez Depo', weightKg: 18, volumeM3: 0.018 },
  { id: 'STK-029', code: 'PWR-1001', name: 'Powerade', category: 'İçecek', unit: 'Adet', quantity: 1328, criticalLevel: 217, warehouse: 'Üsküdar Merkez Depo', weightKg: 10, volumeM3: 0.012 },
  { id: 'STK-030', code: 'MNS-1001', name: 'Monster', category: 'İçecek', unit: 'Adet', quantity: 727, criticalLevel: 265, warehouse: 'Üsküdar Merkez Depo', weightKg: 40, volumeM3: 0.06 },
  { id: 'STK-031', code: 'CC-1003', name: 'Coca-Cola 330 ml', category: 'İçecek', unit: 'Adet', quantity: 3033, criticalLevel: 283, warehouse: 'Üsküdar Merkez Depo', weightKg: 5, volumeM3: 0.01 },
  { id: 'STK-032', code: 'FNT-1002', name: 'Fanta 330 ml', category: 'İçecek', unit: 'Adet', quantity: 2515, criticalLevel: 179, warehouse: 'Üsküdar Merkez Depo', weightKg: 8, volumeM3: 0.015 },
  { id: 'STK-033', code: 'SPR-1002', name: 'Sprite 330 ml', category: 'İçecek', unit: 'Adet', quantity: 251, criticalLevel: 281, warehouse: 'Üsküdar Merkez Depo', weightKg: 12, volumeM3: 0.02 },
  { id: 'STK-034', code: 'SCH-1001', name: 'Schweppes', category: 'İçecek', unit: 'Adet', quantity: 1660, criticalLevel: 193, warehouse: 'Üsküdar Merkez Depo', weightKg: 15, volumeM3: 0.025 },
  { id: 'STK-035', code: 'CPY-1002', name: 'Cappy Portakal', category: 'İçecek', unit: 'Adet', quantity: 2038, criticalLevel: 208, warehouse: 'Üsküdar Merkez Depo', weightKg: 20, volumeM3: 0.03 },
  { id: 'STK-036', code: 'CC-1004', name: 'Coca-Cola 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 521, criticalLevel: 202, warehouse: 'Üsküdar Merkez Depo', weightKg: 25, volumeM3: 0.04 },
  { id: 'STK-037', code: 'FNT-1003', name: 'Fanta 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 3799, criticalLevel: 249, warehouse: 'Üsküdar Merkez Depo', weightKg: 30, volumeM3: 0.05 },
  { id: 'STK-038', code: 'SPR-1003', name: 'Sprite 2.5 L', category: 'İçecek', unit: 'Adet', quantity: 2421, criticalLevel: 227, warehouse: 'Üsküdar Merkez Depo', weightKg: 18, volumeM3: 0.018 },
  { id: 'STK-039', code: 'BRN-1001', name: 'Burn', category: 'İçecek', unit: 'Adet', quantity: 3702, criticalLevel: 129, warehouse: 'Üsküdar Merkez Depo', weightKg: 10, volumeM3: 0.012 },
  { id: 'STK-040', code: 'DML-1002', name: 'Damla 0.5 L', category: 'İçecek', unit: 'Adet', quantity: 1892, criticalLevel: 229, warehouse: 'Üsküdar Merkez Depo', weightKg: 40, volumeM3: 0.06 },
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
    code: 'DP001', // Excel'deki koda güncellendi
    name: 'Avcılar Merkez Depo', // Excel'deki isme güncellendi
    district: 'Avcılar',
    address: 'Ambarlı Mah. Liman Cad. No:14, Avcılar',
    manager: 'Kemal Aydın',
    capacityM3: 4800,
    usedM3: 3960,
    status: 'Aktif',
  },
  {
    id: 'DPO-002',
    code: 'DP002', // Excel'deki koda güncellendi
    name: 'Üsküdar Merkez Depo', // Excel'deki isme güncellendi
    district: 'Üsküdar',
    address: 'Kısıklı Mah. Alemdağ Cad. No:220, Üsküdar',
    manager: 'Serpil Yıldız',
    capacityM3: 2600,
    usedM3: 1820,
    status: 'Aktif',
  }
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

/* ------------------------------- Satış & Sipariş ------------------------------ */

export interface ErpOfferDto {
  id: string
  cariCode: string
  cariName: string
  status: 'Onaylandı' | 'Beklemede' | 'Reddedildi'
}

// 27 Müşteriye ait karışık durumlu Teklif Listesi
export const erpOffers: ErpOfferDto[] = [
  { id: 'TKL0001', cariCode: 'CAR001', cariName: 'Şirinevler Şok Market', status: 'Onaylandı' },
  { id: 'TKL0002', cariCode: 'CAR002', cariName: 'Bakırköy Migros', status: 'Beklemede' },
  { id: 'TKL0003', cariCode: 'CAR003', cariName: 'Beşiktaş Macrocenter', status: 'Onaylandı' },
  { id: 'TKL0004', cariCode: 'CAR004', cariName: 'Şişli CarrefourSA', status: 'Beklemede' },
  { id: 'TKL0005', cariCode: 'CAR005', cariName: 'Mecidiyeköy Çağrı Market', status: 'Onaylandı' },
  { id: 'TKL0006', cariCode: 'CAR006', cariName: 'Levent File Market', status: 'Onaylandı' },
  { id: 'TKL0007', cariCode: 'CAR007', cariName: 'Fatih BİM', status: 'Reddedildi' },
  { id: 'TKL0008', cariCode: 'CAR008', cariName: 'Eyüp Şok Market', status: 'Onaylandı' },
  { id: 'TKL0009', cariCode: 'CAR009', cariName: 'Bayrampaşa Hal İçi Market', status: 'Onaylandı' },
  { id: 'TKL0010', cariCode: 'CAR010', cariName: 'Bağcılar Migros', status: 'Beklemede' },
  { id: 'TKL0011', cariCode: 'CAR011', cariName: 'Sefaköy CarrefourSA', status: 'Onaylandı' },
  { id: 'TKL0012', cariCode: 'CAR012', cariName: 'Küçükçekmece Çağrı Market', status: 'Beklemede' },
  { id: 'TKL0013', cariCode: 'CAR013', cariName: 'Beylikdüzü Migros 5M', status: 'Onaylandı' },
  { id: 'TKL0014', cariCode: 'CAR014', cariName: 'Fenerbahçe Şok', status: 'Onaylandı' },
  { id: 'TKL0015', cariCode: 'CAR015', cariName: 'Bostancı Migros', status: 'Reddedildi' },
  { id: 'TKL0016', cariCode: 'CAR016', cariName: 'Maltepe CarrefourSA', status: 'Beklemede' },
  { id: 'TKL0017', cariCode: 'CAR017', cariName: 'Pendik File Market', status: 'Onaylandı' },
  { id: 'TKL0018', cariCode: 'CAR018', cariName: 'Tuzla Çağrı Market', status: 'Onaylandı' },
  { id: 'TKL0019', cariCode: 'CAR019', cariName: 'Ümraniye Çarşı Migros', status: 'Beklemede' },
  { id: 'TKL0020', cariCode: 'CAR020', cariName: 'Çakmak Şok Market', status: 'Onaylandı' },
  { id: 'TKL0021', cariCode: 'CAR021', cariName: 'Ataşehir Migros', status: 'Beklemede' },
  { id: 'TKL0022', cariCode: 'CAR022', cariName: 'Kayışdağı BİM', status: 'Onaylandı' },
  { id: 'TKL0023', cariCode: 'CAR023', cariName: 'İçerenköy CarrefourSA', status: 'Onaylandı' },
  { id: 'TKL0024', cariCode: 'CAR024', cariName: 'Çekmeköy File Market', status: 'Reddedildi' },
  { id: 'TKL0025', cariCode: 'CAR025', cariName: 'Kavacık Migros', status: 'Onaylandı' },
  { id: 'TKL0026', cariCode: 'CAR026', cariName: 'Çengelköy Şok', status: 'Onaylandı' },
  { id: 'TKL0027', cariCode: 'CAR027', cariName: 'Altunizade Çağrı Market', status: 'Onaylandı' },
]

export interface ErpOrderLine {
  stockCode: string
  stockName: string
  quantity: number
}

export interface ErpOrderDto {
  id: string
  offerId: string
  cariCode: string
  cariName: string
  vehicleCode: string
  vehiclePlate: string
  totalKg: number
  totalM3: number
  capacityStatus: 'Uygun' | 'Kapasite Kritik'
  status: 'Teslim Edildi' | 'Yolda' | 'Hazırlanıyor' | 'Onay Bekliyor'
  windowStart: string
  windowEnd: string
  // YENİ: Siparişin içindeki ürünleri tutan liste
  lines: ErpOrderLine[] 
}

// Sadece "Onaylandı" durumundaki teklifleri siparişe dönüştürüyoruz
export const erpOrders: ErpOrderDto[] = erpOffers
  .filter((offer) => offer.status === 'Onaylandı')
  .map((offer, index) => {
    const vehicleNumber = (index % 8) + 1;
    const totalKg = 320 + (index * 65);
    const totalM3 = Number((totalKg * 0.007).toFixed(1));
    
    // YENİ: Birden fazla ürün ekleme simülasyonu (Her siparişe Stoklardan rastgele 2 ürün ekliyoruz)
    const item1 = erpStockItems[(index * 2) % erpStockItems.length];
    const item2 = erpStockItems[(index * 2 + 1) % erpStockItems.length];

    return {
      id: `KLO${String(index + 1).padStart(4, '0')}`,
      offerId: offer.id,
      cariCode: offer.cariCode,
      cariName: offer.cariName,
      vehicleCode: `VHC-00${vehicleNumber}`,
      vehiclePlate: `54 LIX 0${vehicleNumber}`,
      totalKg: totalKg,
      totalM3: totalM3,
      capacityStatus: totalKg > 1000 ? 'Kapasite Kritik' : 'Uygun',
      status: index < 5 ? 'Teslim Edildi' : 'Yolda',
      windowStart: '09:00',
      windowEnd: '17:00',
      // YENİ: Siparişin içine tam notlardaki gibi Adet, Stok Kodu ve Stok Adı ekleniyor
      lines: [
        { stockCode: item1.code, stockName: item1.name, quantity: 50 + index * 10 },
        { stockCode: item2.code, stockName: item2.name, quantity: 120 + index * 5 }
      ]
    }
  })

/* --------------------------------- Özetler -------------------------------- */

// (Buradaki export const erpWarehouseNames... satırını sildik!)
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
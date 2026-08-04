/**
 * GİB e-İrsaliye / e-Fatura belge modeli.
 *
 * Fatura ve irsaliye tohum verileri burada tutulur (tek kaynak) ve
 * `buildGibDocument` ile resmi matbu evrak görünümü için gereken tüm alanlar
 * deterministik olarak türetilir. Böylece aynı belge no her zaman aynı
 * kalemleri ve taşıyıcı bilgisini üretir.
 */

import { erpStockItems } from '@/lib/erp-data'
import { fleetVehicles } from '@/lib/route-data'

export type ErpDocKind = 'irsaliye' | 'fatura'

export interface DocSeed {
  no: string
  cari: string
  date: string
  /** İrsaliyede sevk aracı; faturada boş olabilir. */
  plate?: string
  /** Kalem sayısı. */
  lines: number
  state: string
  /** Faturada Satış/Alış ayrımı. */
  kind?: string
  total?: number
}

/* ------------------------------ Tohum veriler ----------------------------- */

export const faturaSeeds: DocSeed[] = [
  { no: 'FTR-2026-004182', cari: 'Ataköy Yapı Market', date: '24.07.2026', total: 99415, kind: 'Satış', state: 'Ödendi', lines: 8 },
  { no: 'FTR-2026-004183', cari: 'Kadıköy Gıda Toptan', date: '24.07.2026', total: 156822, kind: 'Satış', state: 'Vadesi Geldi', lines: 11 },
  { no: 'FTR-2026-004184', cari: 'Anadolu Akaryakıt A.Ş.', date: '25.07.2026', total: 210795, kind: 'Alış', state: 'Ödendi', lines: 5 },
  { no: 'FTR-2026-004185', cari: 'Beşiktaş Zincir Market', date: '25.07.2026', total: 72546, kind: 'Satış', state: 'Gecikmiş', lines: 7 },
  { no: 'FTR-2026-004186', cari: 'Marmara Ambalaj San. Tic.', date: '26.07.2026', total: 64674, kind: 'Alış', state: 'Vadesi Geldi', lines: 6 },
  { no: 'FTR-2026-004187', cari: 'Sarıyer Otel Zinciri', date: '26.07.2026', total: 234348, kind: 'Satış', state: 'Ödendi', lines: 12 },
  { no: 'FTR-2026-004188', cari: 'Pendik Sanayi Market', date: '27.07.2026', total: 56581, kind: 'Satış', state: 'Gecikmiş', lines: 6 },
]

export const irsaliyeSeeds: DocSeed[] = [
  { no: 'IRS-2026-01974', cari: 'Ataköy Yapı Market', date: '24.07.2026', plate: '34 ABC 123', lines: 12, state: 'Teslim Edildi' },
  { no: 'IRS-2026-01975', cari: 'Kadıköy Gıda Toptan', date: '24.07.2026', plate: '34 DEF 456', lines: 24, state: 'Yolda' },
  { no: 'IRS-2026-01976', cari: 'Şişli Restoran Grubu', date: '25.07.2026', plate: '34 MNO 345', lines: 6, state: 'Yolda' },
  { no: 'IRS-2026-01977', cari: 'Beşiktaş Zincir Market', date: '25.07.2026', plate: '34 STU 678', lines: 9, state: 'Beklemede' },
  { no: 'IRS-2026-01978', cari: 'Sarıyer Otel Zinciri', date: '26.07.2026', plate: '34 HİJ 890', lines: 31, state: 'Teslim Edildi' },
  { no: 'IRS-2026-01979', cari: 'Pendik Sanayi Market', date: '26.07.2026', plate: '34 KLM 123', lines: 11, state: 'İade' },
]

/* ------------------------------ Belge modeli ------------------------------ */

export interface GibDocLine {
  no: number
  code: string
  name: string
  qty: number
  unit: string
  price: number
  amount: number
}

export interface GibParty {
  name: string
  addressLines: string[]
  district: string
  city: string
  taxOffice: string
  vkn: string
  phone: string
  email: string
  web?: string
}

export interface GibDocument {
  kind: ErpDocKind
  /** Başlıkta görünen belge adı: 'e-İRSALİYE' | 'e-FATURA'. */
  title: string
  no: string
  date: string
  time: string
  /** GİB özelleştirme (customization) numarası. */
  customizationNo: string
  scenario: string
  docType: string
  /** ETTN benzeri belge tekil kimliği. */
  uuid: string
  sender: GibParty
  receiver: GibParty
  lines: GibDocLine[]
  subtotal: number
  vatRate: number
  vatTotal: number
  grandTotal: number
  /** İlgili doküman tablosu satırları. */
  relatedDocs: { label: string; no: string; date: string; note: string }[]
  carrier: {
    company: string
    vkn: string
    driverName: string
    driverTckn: string
    plate: string
    vehicleType: string
    dispatchDate: string
    dispatchTime: string
  }
}

/* ------------------------------ Yardımcılar ------------------------------- */

/** Belge numarasından deterministik tohum üretir. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Tohumdan sıralı sözde-rastgele üretici. */
function rng(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/** Gönderici firma bilgileri sabittir (uygulamayı kullanan şirket). */
const senderParty: GibParty = {
  name: 'ROTAPLAN LOJİSTİK VE DAĞITIM A.Ş.',
  addressLines: ['Firuzköy Bulvarı No: 148 / A', 'Ambarlı Lojistik Merkezi Blok B'],
  district: 'Avcılar',
  city: 'İSTANBUL',
  taxOffice: 'Avcılar',
  vkn: '4820561973',
  phone: '+90 212 456 78 90',
  email: 'muhasebe@rotaplan.com.tr',
  web: 'www.rotaplan.com.tr',
}

/** Cari adına göre sabit adres/VKN üretir. */
function buildReceiver(name: string, seed: number): GibParty {
  const r = rng(seed)
  const districts = [
    'Bakırköy',
    'Kadıköy',
    'Beşiktaş',
    'Şişli',
    'Sarıyer',
    'Pendik',
    'Avcılar',
    'Üsküdar',
  ]
  const streets = [
    'Atatürk Caddesi',
    'İstiklal Sokak',
    'Cumhuriyet Bulvarı',
    'Bağdat Caddesi',
    'Sanayi Sitesi 4. Blok',
  ]
  const district = districts[Math.floor(r() * districts.length)]
  const street = streets[Math.floor(r() * streets.length)]
  const buildingNo = 3 + Math.floor(r() * 240)
  // VKN 10 hane, TCKN'den ayrışsın diye 4 veya 5 ile başlatılır.
  const vkn = `${4 + Math.floor(r() * 2)}${Math.floor(r() * 900000000 + 100000000)}`.slice(0, 10)

  return {
    name: name.toLocaleUpperCase('tr-TR'),
    addressLines: [`${street} No: ${buildingNo}`, `Kat: ${1 + Math.floor(r() * 6)}`],
    district,
    city: 'İSTANBUL',
    taxOffice: district,
    vkn,
    phone: `+90 2${1 + Math.floor(r() * 2)} ${300 + Math.floor(r() * 600)} ${10 + Math.floor(r() * 89)} ${10 + Math.floor(r() * 89)}`,
    email: `info@${name
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 14)}.com.tr`,
  }
}

/** Belge numarasından ETTN benzeri UUID üretir. */
function buildUuid(seed: number): string {
  const r = rng(seed)
  const hex = (n: number) =>
    Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join('')
  return `${hex(8)}-${hex(4)}-${hex(4)}-${hex(4)}-${hex(12)}`
}

/**
 * Tohum veriden tam GİB belgesi üretir.
 * Kalemler stok kartlarından, taşıyıcı bilgisi filo kayıtlarından türetilir.
 */
export function buildGibDocument(seed: DocSeed, kind: ErpDocKind): GibDocument {
  const h = hash(seed.no)
  const r = rng(h)

  // Kalem sayısı makul bir aralıkta tutulur (matbu evrak tek sayfaya sığsın).
  const lineCount = Math.max(3, Math.min(seed.lines, 9))
  const startIndex = h % erpStockItems.length

  const lines: GibDocLine[] = Array.from({ length: lineCount }, (_, i) => {
    const item = erpStockItems[(startIndex + i * 3) % erpStockItems.length]
    const qty = 5 + Math.floor(r() * 120)
    // Fiyat kalem koduna göre sabitlenir, 40–1.240 ₺ aralığı.
    const price = Math.round((40 + r() * 1200) * 100) / 100
    return {
      no: i + 1,
      code: item.code,
      name: item.name,
      qty,
      unit: item.unit,
      price,
      amount: Math.round(qty * price * 100) / 100,
    }
  })

  const subtotal = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) * 100) / 100
  const vatRate = 20
  const vatTotal = Math.round(subtotal * (vatRate / 100) * 100) / 100
  const grandTotal = Math.round((subtotal + vatTotal) * 100) / 100

  // Taşıyıcı: plaka verilmişse filodan eşleşen araç, yoksa deterministik seçim.
  const vehicle =
    fleetVehicles.find((v) => v.plate === seed.plate) ??
    fleetVehicles[h % fleetVehicles.length]

  const isIrsaliye = kind === 'irsaliye'

  return {
    kind,
    title: isIrsaliye ? 'e-İRSALİYE' : 'e-FATURA',
    no: seed.no,
    date: seed.date,
    time: `${String(8 + Math.floor(r() * 9)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`,
    customizationNo: isIrsaliye ? 'TR1.2' : 'TR1.2.1',
    scenario: isIrsaliye ? 'TEMEL İRSALİYE' : 'TEMEL FATURA',
    docType: isIrsaliye ? 'SEVK' : (seed.kind ?? 'SATIŞ').toLocaleUpperCase('tr-TR'),
    uuid: buildUuid(h),
    sender: senderParty,
    receiver: buildReceiver(seed.cari, h),
    lines,
    subtotal,
    vatRate,
    vatTotal,
    grandTotal,
    relatedDocs: [
      {
        label: isIrsaliye ? 'Sipariş' : 'İrsaliye',
        no: isIrsaliye
          ? `SIP-2026-0${140 + (h % 20)}`
          : `IRS-2026-0${1970 + (h % 30)}`,
        date: seed.date,
        note: isIrsaliye ? 'Sipariş bazlı sevkiyat' : 'Sevk irsaliyesine istinaden',
      },
      {
        label: 'Sözleşme',
        no: `SZL-2026-${String(100 + (h % 400)).padStart(4, '0')}`,
        date: '02.01.2026',
        note: 'Yıllık çerçeve tedarik sözleşmesi',
      },
    ],
    carrier: {
      company: senderParty.name,
      vkn: senderParty.vkn,
      driverName: vehicle.driverName.toLocaleUpperCase('tr-TR'),
      driverTckn: `${1 + Math.floor(r() * 8)}${Math.floor(r() * 9000000000 + 1000000000)}`.slice(0, 11),
      plate: seed.plate ?? vehicle.plate,
      vehicleType: vehicle.vehicleType,
      dispatchDate: seed.date,
      dispatchTime: `${String(6 + Math.floor(r() * 5)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`,
    },
  }
}

/** Tablo satırı id'sinden belgeyi bulur. */
export function findGibDocument(docNo: string): GibDocument | null {
  const irs = irsaliyeSeeds.find((s) => s.no === docNo)
  if (irs) return buildGibDocument(irs, 'irsaliye')
  const ftr = faturaSeeds.find((s) => s.no === docNo)
  if (ftr) return buildGibDocument(ftr, 'fatura')
  return null
}

/** Para birimi biçimlendirme (matbu evrak formatı: 1.234,56). */
export function fmtMoney(v: number): string {
  return v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Tutarı Türkçe yazıya çevirir (matbu evraklarda "Yalnız ..." satırı). */
export function moneyToWords(value: number): string {
  const ones = ['', 'BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ']
  const tens = ['', 'ON', 'YİRMİ', 'OTUZ', 'KIRK', 'ELLİ', 'ALTMIŞ', 'YETMİŞ', 'SEKSEN', 'DOKSAN']

  const under1000 = (n: number): string => {
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    let out = ''
    if (h > 0) out += (h === 1 ? '' : ones[h]) + 'YÜZ'
    if (t > 0) out += tens[t]
    if (o > 0) out += ones[o]
    return out
  }

  const chunk = (n: number, suffix: string): string => {
    if (n === 0) return ''
    // "BİRBİN" yerine "BİN" yazılır.
    if (n === 1 && suffix === 'BİN') return 'BİN'
    return under1000(n) + suffix
  }

  const lira = Math.floor(value)
  const kurus = Math.round((value - lira) * 100)

  if (lira === 0 && kurus === 0) return 'SIFIR TL'

  const millions = Math.floor(lira / 1_000_000)
  const thousands = Math.floor((lira % 1_000_000) / 1000)
  const rest = lira % 1000

  const words =
    chunk(millions, 'MİLYON') + chunk(thousands, 'BİN') + under1000(rest) || 'SIFIR'

  return `${words} TL${kurus > 0 ? ` ${under1000(kurus)} KURUŞ` : ''}`
}

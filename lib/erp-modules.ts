/**
 * ERP modül ağacı (LioXERP benzeri hiyerarşik menü) ve tablo görünümleri.
 *
 * Her modülün altında bir veya daha fazla "görünüm" (view) bulunur. Görünümler
 * jenerik hücre tanımlarıyla ifade edilir; böylece tek bir tablo bileşeni tüm
 * modülleri render edebilir.
 */

import {
  Boxes,
  ChartColumn,
  FileText,
  Landmark,
  ReceiptText,
  ShoppingCart,
  ShoppingBag, // <--- BUNU EKLE
  Tags,
  Truck,
  Users,
} from 'lucide-react'
import {
  erpAccounts,
  erpStockItems,
  erpWarehouses,
  erpVehicles,
  erpOffers,
  erpOrders,
  erpPurchaseOrders, // <--- BUNU EKLE
  type ErpRecordStatus,
} from '@/lib/erp-data'
import { faturaSeeds, irsaliyeSeeds } from '@/lib/erp-document'
import { customers } from '@/lib/route-data'

/* ------------------------------- Hücre modeli ------------------------------ */

export type ErpTone = 'success' | 'warning' | 'destructive' | 'primary' | 'neutral'

export type ErpCell =
  /** Mono kod + altında ikincil kimlik. */
  | { t: 'code'; v: string; sub?: string }
  /** Normal metin + opsiyonel ikincil satır. */
  | { t: 'text'; v: string; sub?: string; strong?: boolean }
  /** Rozet. */
  | { t: 'badge'; v: string; variant?: 'outline' | 'secondary' }
  /** Para birimi; signed=true ise pozitif yeşil / negatif kırmızı. */
  | { t: 'money'; v: number; signed?: boolean; sub?: string }
  /** Sayı + birim; alert=true ise kırmızı ve uyarı etiketi eklenir. */
  | { t: 'num'; v: number; unit?: string; sub?: string; alert?: boolean; alertLabel?: string }
  /** erpStatusMeta ile eşleşen ana veri durumu. */
  | { t: 'status'; v: ErpRecordStatus }
  /** Serbest metinli renkli pill. */
  | { t: 'tone'; v: string; tone: ErpTone }
  /** Doluluk / oran çubuğu. */
  | { t: 'progress'; pct: number; label: string }

export interface ErpRow {
  id: string
  /** Arama için birleştirilmiş, önceden hesaplanmış metin. */
  search: string
  cells: ErpCell[]
}

export interface ErpView {
  key: string
  label: string
  columns: string[]
  rows: ErpRow[]
  searchPlaceholder: string
  /** Kayıt tekil adı; "Yeni ... Kaydı" başlığı ve toolbar ipuçlarında kullanılır. */
  recordName: string
  /** Özel form dialog'u olan modüller. Yoksa jenerik form açılır. */
  dialog?: 'cari' | 'stok' | 'depo' | 'arac'
  /** Ayarlandığında tabloya 'İşlemler' sütunu eklenir ve satır bazında matbu evrak önizlemesi açılır. */
  docAction?: 'irsaliye' | 'fatura'
  
  // --- YENİ EKLENEN KISIMLAR ---
  /** Tablonun en soluna seçim (checkbox) sütunu ekler */
  selectable?: boolean
  /** Seçili öğelerle yapılacak toplu işlemin buton metni (Örn: "Rota Havuzuna Gönder") */
  batchActionLabel?: string
}

export interface ErpModule {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  views: ErpView[]
}

const s = (...parts: (string | number)[]) => parts.join(' ')

/* ------------------------------ Cari görünümü ----------------------------- */

const cariKartlari: ErpView = {
  key: 'cari-kartlari',
  label: 'Cari Kartları',
  recordName: 'Cari',
  dialog: 'cari',
  searchPlaceholder: 'Cari kodu, ad veya bölge ara…',
  columns: ['Cari Kodu', 'Cari Adı', 'Cari Tipi', 'Bölge', 'Bakiye', 'Durum'],
  rows: erpAccounts.map((a) => ({
    id: a.id,
    search: s(a.code, a.name, a.type, a.district, a.id),
    cells: [
      { t: 'code', v: a.code, sub: a.id },
      { t: 'text', v: a.name, strong: true },
      { t: 'badge', v: a.type, variant: 'outline' },
      { t: 'badge', v: a.district, variant: 'secondary' },
      { t: 'money', v: a.balance, signed: true, sub: a.balance < 0 ? 'borç' : 'alacak' },
      { t: 'status', v: a.status },
    ],
  })),
}

const musteriAdresleri: ErpView = {
  key: 'musteri-adresleri',
  label: 'Teslimat Adresleri',
  recordName: 'Adres',
  searchPlaceholder: 'Cari kodu, ilçe veya adres ara…',
  columns: ['Cari Kodu', 'Müşteri Adı', 'İlçe', 'Teslim Penceresi', 'Ort. Hacim', 'Öncelik'], // Müşteri Kodu -> Cari Kodu oldu
  rows: customers.map((c) => ({
    id: c.id,
    search: s(c.id, c.name, c.district, c.address, c.priority),
    cells: [
      { t: 'code', v: c.id },
      { t: 'text', v: c.name, sub: c.address, strong: true },
      { t: 'badge', v: c.district, variant: 'secondary' },
      { t: 'code', v: `${c.windowStart} – ${c.windowEnd}` }, // Sipariş sayısı alt metni (sub) buradan silindi!
      { t: 'num', v: c.avgVolumeM3, unit: 'm³' },
      {
        t: 'tone',
        v: c.priority,
        tone: c.priority === 'Yüksek' ? 'destructive' : c.priority === 'Düşük' ? 'neutral' : 'primary',
      },
    ],
  })),
}

/* ------------------------------ Filo görünümü ----------------------------- */

const aracKartlari: ErpView = {
  key: 'arac-kartlari',
  label: 'Araç Kartları',
  recordName: 'Araç',
  dialog: 'arac',
  searchPlaceholder: 'Plaka, sürücü veya araç tipi ara…',
  columns: ['Araç Kodu', 'Plaka / Sürücü', 'Araç Tipi', 'Bağlı Depo', 'Kapasite', 'Durum'],
  // YENİ: Excel ile uyumlu listemizden çekiyoruz (8 Araç)
  rows: erpVehicles.map((v) => ({
    id: v.id,
    search: s(v.id, v.plate, v.driver, v.type, v.depot, v.status, v.features),
    cells: [
      { t: 'code', v: v.id },
      { t: 'text', v: v.plate, sub: v.driver, strong: true },
      { t: 'badge', v: v.type, variant: 'outline' },
      { t: 'badge', v: v.depot, variant: 'secondary' },
      {
        t: 'num',
        v: v.capacityKg,
        unit: 'kg',
        sub: `${v.volumeM3} m³ · ${v.features || 'donanım yok'}`,
      },
      {
        t: 'tone',
        v: v.status,
        tone: v.status === 'Aktif' ? 'primary' : v.status === 'Arızalı' ? 'destructive' : 'warning',
      },
    ],
  })),
}

/* --------------------------- Depo & stok görünümü ------------------------- */

const stokKartlari: ErpView = {
  key: 'stok-kartlari',
  label: 'Stok Kartları',
  recordName: 'Stok',
  dialog: 'stok',
  searchPlaceholder: 'Stok kodu, ürün adı veya depo ara…',
  // Sütunlara Ağırlık ve Hacim eklendi!
  columns: ['Stok Kodu', 'Ürün Adı', 'Kategori', 'Birim', 'Ağırlık (kg)', 'Hacim (m³)', 'Miktar', 'Bağlı Depo'],
  rows: erpStockItems.map((i) => ({
    id: i.id,
    search: s(i.code, i.name, i.category, i.warehouse, i.unit, i.id),
    cells: [
      { t: 'code', v: i.code, sub: i.id },
      { t: 'text', v: i.name, strong: true },
      { t: 'badge', v: i.category, variant: 'secondary' },
      { t: 'text', v: i.unit },
      { t: 'num', v: i.weightKg ?? 0, unit: 'kg' }, // Yeni
      { t: 'num', v: i.volumeM3 ?? 0, unit: 'm³' }, // Yeni
      {
        t: 'num',
        v: i.quantity,
        sub: `eşik: ${i.criticalLevel.toLocaleString('tr-TR')} ${i.unit}`,
        alert: i.quantity < i.criticalLevel,
        alertLabel: 'Kritik',
      },
      { t: 'text', v: i.warehouse },
    ],
  })),
}

const depolar: ErpView = {
  key: 'depolar',
  label: 'Depolar',
  recordName: 'Depo',
  dialog: 'depo',
  searchPlaceholder: 'Depo kodu, ad veya ilçe ara…',
  columns: ['Depo Kodu', 'Depo Adı', 'İlçe', 'Sorumlu', 'Doluluk', 'Durum'],
  rows: erpWarehouses.map((w) => {
    const pct = Math.round((w.usedM3 / w.capacityM3) * 100)
    return {
      id: w.id,
      search: s(w.code, w.name, w.district, w.manager, w.address, w.id),
      cells: [
        { t: 'code', v: w.code, sub: w.id },
        { t: 'text', v: w.name, sub: w.address, strong: true },
        { t: 'badge', v: w.district, variant: 'secondary' },
        { t: 'text', v: w.manager },
        {
          t: 'progress',
          pct,
          label: `${w.usedM3.toLocaleString('tr-TR')}/${w.capacityM3.toLocaleString('tr-TR')} m³`,
        },
        { t: 'status', v: w.status },
      ],
    }
  }),
}

/* ---------------------------- Satış & sipariş ----------------------------- */

interface OrderSeed {
  no: string
  cari: string
  date: string
  total: number
  lines: number
  state: string
  tone: ErpTone
}

const orderSeeds: OrderSeed[] = [
  { no: 'SIP-2026-0148', cari: 'Ataköy Yapı Market', date: '24.07.2026', total: 84250, lines: 12, state: 'Sevk Edildi', tone: 'success' },
  { no: 'SIP-2026-0149', cari: 'Kadıköy Gıda Toptan', date: '24.07.2026', total: 132900, lines: 24, state: 'Hazırlanıyor', tone: 'warning' },
  { no: 'SIP-2026-0150', cari: 'Beşiktaş Zincir Market', date: '25.07.2026', total: 61480, lines: 9, state: 'Onay Bekliyor', tone: 'primary' },
  { no: 'SIP-2026-0151', cari: 'Şişli Restoran Grubu', date: '25.07.2026', total: 27340, lines: 6, state: 'Hazırlanıyor', tone: 'warning' },
  { no: 'SIP-2026-0152', cari: 'Sarıyer Otel Zinciri', date: '25.07.2026', total: 198600, lines: 31, state: 'Onay Bekliyor', tone: 'primary' },
  { no: 'SIP-2026-0153', cari: 'Levent Ofis Tedarik', date: '26.07.2026', total: 15720, lines: 4, state: 'İptal', tone: 'destructive' },
  { no: 'SIP-2026-0154', cari: 'Pendik Sanayi Market', date: '26.07.2026', total: 47950, lines: 11, state: 'Sevk Edildi', tone: 'success' },
  { no: 'SIP-2026-0155', cari: 'Ataköy Yapı Market', date: '27.07.2026', total: 92100, lines: 18, state: 'Hazırlanıyor', tone: 'warning' },
]

const siparisler: ErpView = {
  key: 'siparisler',
  label: 'Siparişler',
  recordName: 'Sipariş',
  searchPlaceholder: 'Sipariş no, müşteri veya ürün ara…',
  
  // YENİ: Bu iki satır sayesinde Siparişler tablosu artık rota planlamaya veri gönderebilecek!
  selectable: true, 
  batchActionLabel: 'Seçilenleri Rota Havuzuna Gönder',
  
  columns: [
    'Sipariş No', 'Müşteri', 'Sipariş İçeriği', 'Araç / Plaka', 
    'Toplam Kg / Hacim', 'Sipariş Durumu', 'Pencere'
  ],
  rows: erpOrders.map((o) => ({
    // ... (içerideki kodlar daha önce yazdığımız gibi aynı kalacak)
    id: o.id,
    search: s(o.id, o.offerId, o.cariName, o.vehiclePlate, o.status, ...o.lines.map(l => l.stockName)),
    cells: [
      { t: 'code', v: o.id, sub: `Teklif: ${o.offerId}` },
      { t: 'text', v: o.cariName, sub: o.cariCode, strong: true },
      { 
        t: 'text', 
        v: o.lines.map(l => `${l.quantity}x ${l.stockName}`).join(', '), 
        sub: o.lines.map(l => l.stockCode).join(', ') 
      },
      { t: 'text', v: o.vehicleCode, sub: o.vehiclePlate },
      { t: 'num', v: o.totalKg, unit: 'kg', sub: `${o.totalM3} m³` },
      {
        t: 'tone',
        v: o.status,
        tone: o.status === 'Teslim Edildi' ? 'success' : o.status === 'Yolda' ? 'primary' : 'warning',
      },
      { t: 'code', v: `${o.windowStart} - ${o.windowEnd}` },
    ],
  })),
}

const satinalmaSiparisleri: ErpView = {
  key: 'satinalma-siparisleri',
  label: 'Satınalma Siparişleri',
  recordName: 'Satınalma',
  searchPlaceholder: 'Sipariş no, tedarikçi veya ürün ara…',
  columns: ['Alım No', 'Tedarikçi', 'Sipariş İçeriği', 'Sipariş Tarihi', 'Teslim Tarihi', 'Tutar', 'Durum'],
  rows: erpPurchaseOrders.map((p) => ({
    id: p.id,
    search: s(p.id, p.supplierName, p.items, p.status),
    cells: [
      { t: 'code', v: p.id },
      { t: 'text', v: p.supplierName, strong: true },
      { t: 'text', v: p.items },
      { t: 'code', v: p.orderDate },
      { t: 'code', v: p.deliveryDate },
      { t: 'money', v: p.totalAmount },
      {
        t: 'tone',
        v: p.status,
        tone: p.status === 'Teslim Alındı' ? 'success' : p.status === 'Onaylandı' ? 'primary' : p.status === 'İptal' ? 'destructive' : 'warning',
      },
    ],
  })),
}

/*const teklifSeeds = [
  { no: 'TKF-2026-0071', cari: 'Marmara Ambalaj San. Tic.', valid: '31.07.2026', total: 54800, state: 'Onaylandı', tone: 'success' as ErpTone },
  { no: 'TKF-2026-0072', cari: 'Beşiktaş Zincir Market', valid: '02.08.2026', total: 176300, state: 'Beklemede', tone: 'warning' as ErpTone },
  { no: 'TKF-2026-0073', cari: 'İstanbul Palet Lojistik', valid: '05.08.2026', total: 38900, state: 'Beklemede', tone: 'warning' as ErpTone },
  { no: 'TKF-2026-0074', cari: 'Şişli Restoran Grubu', valid: '28.07.2026', total: 22450, state: 'Reddedildi', tone: 'destructive' as ErpTone },
  { no: 'TKF-2026-0075', cari: 'Sarıyer Otel Zinciri', valid: '09.08.2026', total: 241000, state: 'Onaylandı', tone: 'success' as ErpTone },
  { no: 'TKF-2026-0076', cari: 'Kadıköy Gıda Toptan', valid: '11.08.2026', total: 67200, state: 'Beklemede', tone: 'warning' as ErpTone },
]*/

const teklifler: ErpView = {
  key: 'teklifler',
  label: 'Teklifler',
  recordName: 'Teklif',
  searchPlaceholder: 'Teklif no veya cari ara…',
  columns: ['Teklif No', 'Cari Kodu', 'Müşteri Adı', 'Durum'],
  rows: erpOffers.map((o) => ({
    id: o.id,
    search: s(o.id, o.cariCode, o.cariName, o.status),
    cells: [
      { t: 'code', v: o.id },
      { t: 'code', v: o.cariCode },
      { t: 'text', v: o.cariName, strong: true },
      {
        t: 'tone',
        v: o.status,
        tone: o.status === 'Onaylandı' ? 'success' : o.status === 'Reddedildi' ? 'destructive' : 'warning',
      },
    ],
  })),
}

/* -------------------------- Fatura & irsaliye ---------------------------- */

/** Belge durumundan pill tonu. */
const docTone: Record<string, ErpTone> = {
  Ödendi: 'success',
  'Teslim Edildi': 'success',
  'Vadesi Geldi': 'warning',
  Beklemede: 'warning',
  Gecikmiş: 'destructive',
  İade: 'destructive',
  Yolda: 'primary',
}

const faturalar: ErpView = {
  key: 'faturalar',
  label: 'Faturalar',
  recordName: 'Fatura',
  docAction: 'fatura',
  searchPlaceholder: 'Fatura no, cari veya durum ara…',
  columns: ['Fatura No', 'Cari', 'Tarih', 'Tip', 'KDV Dahil Tutar', 'Tahsilat', 'İşlemler'],
  rows: faturaSeeds.map((f) => ({
    id: f.no,
    search: s(f.no, f.cari, f.date, f.kind ?? '', f.state),
    cells: [
      { t: 'code', v: f.no },
      { t: 'text', v: f.cari, strong: true },
      { t: 'code', v: f.date },
      { t: 'badge', v: f.kind ?? 'Satış', variant: 'outline' },
      { t: 'money', v: f.total ?? 0 },
      { t: 'tone', v: f.state, tone: docTone[f.state] ?? 'neutral' },
    ],
  })),
}

const irsaliyeler: ErpView = {
  key: 'irsaliyeler',
  label: 'İrsaliyeler',
  recordName: 'İrsaliye',
  docAction: 'irsaliye',
  searchPlaceholder: 'İrsaliye no, cari veya plaka ara…',
  columns: ['İrsaliye No', 'Cari', 'Sevk Tarihi', 'Araç', 'Kalem', 'Durum', 'İşlemler'],
  rows: irsaliyeSeeds.map((i) => ({
    id: i.no,
    search: s(i.no, i.cari, i.date, i.plate ?? '', i.state),
    cells: [
      { t: 'code', v: i.no },
      { t: 'text', v: i.cari, strong: true },
      { t: 'code', v: i.date },
      { t: 'code', v: i.plate ?? '—' },
      { t: 'num', v: i.lines, unit: 'kalem' },
      { t: 'tone', v: i.state, tone: docTone[i.state] ?? 'neutral' },
    ],
  })),
}

/* ---------------------------- Banka & kasa ------------------------------- */

const bankaSeeds = [
  { code: '102.01.01', bank: 'Ziraat Bankası', iban: 'TR33 0001 0012 3456 7890 1234 56', cur: 'TRY', balance: 1842500 },
  { code: '102.01.02', bank: 'İş Bankası', iban: 'TR64 0006 4000 0011 2345 6789 01', cur: 'TRY', balance: 964300 },
  { code: '102.02.01', bank: 'Garanti BBVA', iban: 'TR91 0006 2000 1234 0006 2998 77', cur: 'USD', balance: 128400 },
  { code: '102.02.02', bank: 'Yapı Kredi', iban: 'TR18 0006 7010 0000 0012 3456 78', cur: 'EUR', balance: 96750 },
  { code: '102.03.01', bank: 'Akbank', iban: 'TR75 0004 6000 0288 8000 1234 56', cur: 'TRY', balance: -32900 },
]

const bankaHesaplari: ErpView = {
  key: 'banka-hesaplari',
  label: 'Banka Hesapları',
  recordName: 'Banka Hesabı',
  searchPlaceholder: 'Hesap kodu, banka veya IBAN ara…',
  columns: ['Hesap Kodu', 'Banka', 'IBAN', 'Para Birimi', 'Bakiye'],
  rows: bankaSeeds.map((b) => ({
    id: b.code,
    search: s(b.code, b.bank, b.iban, b.cur),
    cells: [
      { t: 'code', v: b.code },
      { t: 'text', v: b.bank, strong: true },
      { t: 'code', v: b.iban },
      { t: 'badge', v: b.cur, variant: 'outline' },
      { t: 'money', v: b.balance, signed: true },
    ],
  })),
}

const kasaSeeds = [
  { no: 'KSA-2026-0912', date: '24.07.2026', desc: 'Ataköy Yapı Market tahsilat', kind: 'Tahsilat', amount: 45000 },
  { no: 'KSA-2026-0913', date: '24.07.2026', desc: 'Akaryakıt ödemesi — Anadolu Akaryakıt', kind: 'Ödeme', amount: -28400 },
  { no: 'KSA-2026-0914', date: '25.07.2026', desc: 'Kadıköy Gıda Toptan kısmi tahsilat', kind: 'Tahsilat', amount: 62000 },
  { no: 'KSA-2026-0915', date: '25.07.2026', desc: 'Araç bakım gideri — 34 JKL 012', kind: 'Ödeme', amount: -14750 },
  { no: 'KSA-2026-0916', date: '26.07.2026', desc: 'Personel avans ödemesi', kind: 'Ödeme', amount: -9500 },
  { no: 'KSA-2026-0917', date: '26.07.2026', desc: 'Sarıyer Otel Zinciri tahsilat', kind: 'Tahsilat', amount: 118000 },
]

const kasaHareketleri: ErpView = {
  key: 'kasa-hareketleri',
  label: 'Kasa Hareketleri',
  recordName: 'Kasa Fişi',
  searchPlaceholder: 'Fiş no, açıklama veya tür ara…',
  columns: ['Fiş No', 'Tarih', 'Açıklama', 'İşlem Türü', 'Tutar'],
  rows: kasaSeeds.map((k) => ({
    id: k.no,
    search: s(k.no, k.date, k.desc, k.kind),
    cells: [
      { t: 'code', v: k.no },
      { t: 'code', v: k.date },
      { t: 'text', v: k.desc, strong: true },
      {
        t: 'tone',
        v: k.kind,
        tone: k.kind === 'Tahsilat' ? 'success' : 'warning',
      },
      { t: 'money', v: k.amount, signed: true },
    ],
  })),
}

/* ------------------------------ Çek defteri ------------------------------ */

const alinanCekSeeds = [
  { no: 'ÇEK-A-88214', cari: 'Ataköy Yapı Market', bank: 'Ziraat Bankası', due: '05.08.2026', amount: 84250, state: 'Portföyde', tone: 'primary' as ErpTone },
  { no: 'ÇEK-A-88215', cari: 'Kadıköy Gıda Toptan', bank: 'İş Bankası', due: '12.08.2026', amount: 132900, state: 'Portföyde', tone: 'primary' as ErpTone },
  { no: 'ÇEK-A-88216', cari: 'Beşiktaş Zincir Market', bank: 'Garanti BBVA', due: '22.07.2026', amount: 61480, state: 'Tahsil Edildi', tone: 'success' as ErpTone },
  { no: 'ÇEK-A-88217', cari: 'Pendik Sanayi Market', bank: 'Akbank', due: '18.07.2026', amount: 47950, state: 'Karşılıksız', tone: 'destructive' as ErpTone },
  { no: 'ÇEK-A-88218', cari: 'Sarıyer Otel Zinciri', bank: 'Yapı Kredi', due: '28.08.2026', amount: 198600, state: 'Bankada', tone: 'warning' as ErpTone },
]

const alinanCekler: ErpView = {
  key: 'alinan-cekler',
  label: 'Alınan Çekler',
  recordName: 'Alınan Çek',
  searchPlaceholder: 'Çek no, cari veya banka ara…',
  columns: ['Çek No', 'Borçlu Cari', 'Banka', 'Vade', 'Tutar', 'Durum'],
  rows: alinanCekSeeds.map((c) => ({
    id: c.no,
    search: s(c.no, c.cari, c.bank, c.due, c.state),
    cells: [
      { t: 'code', v: c.no },
      { t: 'text', v: c.cari, strong: true },
      { t: 'text', v: c.bank },
      { t: 'code', v: c.due },
      { t: 'money', v: c.amount },
      { t: 'tone', v: c.state, tone: c.tone },
    ],
  })),
}

const verilenCekSeeds = [
  { no: 'ÇEK-V-40911', cari: 'Marmara Ambalaj San. Tic.', bank: 'Ziraat Bankası', due: '08.08.2026', amount: 62300, state: 'Ödenecek', tone: 'warning' as ErpTone },
  { no: 'ÇEK-V-40912', cari: 'Anadolu Akaryakıt A.Ş.', bank: 'İş Bankası', due: '15.08.2026', amount: 178640, state: 'Ödenecek', tone: 'warning' as ErpTone },
  { no: 'ÇEK-V-40913', cari: 'İstanbul Palet Lojistik', bank: 'Akbank', due: '20.07.2026', amount: 35800, state: 'Ödendi', tone: 'success' as ErpTone },
  { no: 'ÇEK-V-40914', cari: 'Marmara Ambalaj San. Tic.', bank: 'Garanti BBVA', due: '30.08.2026', amount: 41200, state: 'Ödenecek', tone: 'warning' as ErpTone },
]

const verilenCekler: ErpView = {
  key: 'verilen-cekler',
  label: 'Verilen Çekler',
  recordName: 'Verilen Çek',
  searchPlaceholder: 'Çek no, cari veya banka ara…',
  columns: ['Çek No', 'Alacaklı Cari', 'Banka', 'Vade', 'Tutar', 'Durum'],
  rows: verilenCekSeeds.map((c) => ({
    id: c.no,
    search: s(c.no, c.cari, c.bank, c.due, c.state),
    cells: [
      { t: 'code', v: c.no },
      { t: 'text', v: c.cari, strong: true },
      { t: 'text', v: c.bank },
      { t: 'code', v: c.due },
      { t: 'money', v: c.amount },
      { t: 'tone', v: c.state, tone: c.tone },
    ],
  })),
}

/* ---------------------------- Fiyat listeleri ---------------------------- */

const fiyatSeeds = [
  { code: 'FYT-TOPTAN', name: 'Toptan Satış Listesi', cur: 'TRY', valid: '01.01.2026 – 31.12.2026', items: 248, status: 'Aktif' as ErpRecordStatus },
  { code: 'FYT-PERAKENDE', name: 'Perakende Satış Listesi', cur: 'TRY', valid: '01.01.2026 – 31.12.2026', items: 312, status: 'Aktif' as ErpRecordStatus },
  { code: 'FYT-ZINCIR', name: 'Zincir Market Özel Fiyat', cur: 'TRY', valid: '01.03.2026 – 28.02.2027', items: 96, status: 'Aktif' as ErpRecordStatus },
  { code: 'FYT-IHRACAT', name: 'İhracat Fiyat Listesi', cur: 'EUR', valid: '01.02.2026 – 31.01.2027', items: 74, status: 'Aktif' as ErpRecordStatus },
  { code: 'FYT-KAMPANYA', name: 'Yaz Kampanyası 2026', cur: 'TRY', valid: '01.06.2026 – 31.07.2026', items: 38, status: 'Pasif' as ErpRecordStatus },
]

const fiyatListeleri: ErpView = {
  key: 'fiyat-listeleri',
  label: 'Fiyat Listeleri',
  recordName: 'Fiyat Listesi',
  searchPlaceholder: 'Liste kodu, ad veya para birimi ara…',
  columns: ['Liste Kodu', 'Liste Adı', 'Para Birimi', 'Geçerlilik', 'Kalem', 'Durum'],
  rows: fiyatSeeds.map((f) => ({
    id: f.code,
    search: s(f.code, f.name, f.cur, f.valid),
    cells: [
      { t: 'code', v: f.code },
      { t: 'text', v: f.name, strong: true },
      { t: 'badge', v: f.cur, variant: 'outline' },
      { t: 'code', v: f.valid },
      { t: 'num', v: f.items, unit: 'kalem' },
      { t: 'status', v: f.status },
    ],
  })),
}

/* ------------------------------- Raporlar -------------------------------- */

const raporSeeds = [
  { code: 'RPR-SAT-01', name: 'Cari Bazlı Satış Analizi', cat: 'Satış', period: 'Aylık', last: '24.07.2026 06:15' },
  { code: 'RPR-SAT-02', name: 'Ürün Kârlılık Raporu', cat: 'Satış', period: 'Aylık', last: '24.07.2026 06:18' },
  { code: 'RPR-STK-01', name: 'Kritik Stok Seviyesi Raporu', cat: 'Stok', period: 'Günlük', last: '25.07.2026 06:05' },
  { code: 'RPR-STK-02', name: 'Depo Doluluk ve Devir Hızı', cat: 'Stok', period: 'Haftalık', last: '21.07.2026 06:30' },
  { code: 'RPR-FIN-01', name: 'Vadesi Geçen Alacaklar', cat: 'Finans', period: 'Günlük', last: '25.07.2026 06:07' },
  { code: 'RPR-FIN-02', name: 'Çek Portföy Vade Dağılımı', cat: 'Finans', period: 'Haftalık', last: '21.07.2026 06:33' },
  { code: 'RPR-LOJ-01', name: 'Araç Bazlı Sevkiyat Performansı', cat: 'Lojistik', period: 'Günlük', last: '25.07.2026 06:10' },
  { code: 'RPR-LOJ-02', name: 'Teslim Edilemeyen Sipariş Analizi', cat: 'Lojistik', period: 'Günlük', last: '25.07.2026 06:12' },
]

const raporlar: ErpView = {
  key: 'raporlar-listesi',
  label: 'Rapor Tanımları',
  recordName: 'Rapor',
  searchPlaceholder: 'Rapor kodu, ad veya kategori ara…',
  columns: ['Rapor Kodu', 'Rapor Adı', 'Kategori', 'Periyot', 'Son Çalıştırma'],
  rows: raporSeeds.map((r) => ({
    id: r.code,
    search: s(r.code, r.name, r.cat, r.period),
    cells: [
      { t: 'code', v: r.code },
      { t: 'text', v: r.name, strong: true },
      { t: 'badge', v: r.cat, variant: 'secondary' },
      { t: 'badge', v: r.period, variant: 'outline' },
      { t: 'code', v: r.last },
    ],
  })),
}

/* ------------------------------ Modül ağacı ------------------------------ */

export const erpModules: ErpModule[] = [
  {
    key: 'cari',
    label: 'Müşteri Yönetimi (Cari)',
    icon: Users,
    views: [cariKartlari, musteriAdresleri],
  },
  { key: 'filo', label: 'Filo & Araçlar', icon: Truck, views: [aracKartlari] },
  { key: 'depo', label: 'Depo & Stok', icon: Boxes, views: [stokKartlari, depolar] },
  { key: 'satis', label: 'Satış & Sipariş', icon: ShoppingCart, views: [teklifler, siparisler] },
  { key: 'satinalma', label: 'Satınalma', icon: ShoppingBag, views: [satinalmaSiparisleri] },
  { key: 'fatura', label: 'Fatura & İrsaliye', icon: FileText, views: [faturalar, irsaliyeler] },
  { key: 'banka', label: 'Banka & Kasa', icon: Landmark, views: [bankaHesaplari, kasaHareketleri] },
  { key: 'cek', label: 'Çek Defteri', icon: ReceiptText, views: [alinanCekler, verilenCekler] },
  { key: 'fiyat', label: 'Fiyat Listeleri', icon: Tags, views: [fiyatListeleri] },
  { key: 'rapor', label: 'Raporlar', icon: ChartColumn, views: [raporlar] },
]

/** Hücreyi düz metne çevirir; İncele/Düzelt formlarında ve kopyalamada kullanılır. */
export function cellText(cell: ErpCell): string {
  switch (cell.t) {
    case 'code':
    case 'text':
      return cell.v
    case 'badge':
    case 'tone':
      return cell.v
    case 'money':
      return `${cell.v.toLocaleString('tr-TR')} ₺`
    case 'num':
      return `${cell.v.toLocaleString('tr-TR')}${cell.unit ? ` ${cell.unit}` : ''}`
    case 'status':
      return cell.v
    case 'progress':
      return `%${cell.pct} (${cell.label})`
  }
}

/** Görünüm anahtarından modül + görünüm çiftini bulur. */
export function findView(viewKey: string): { module: ErpModule; view: ErpView } {
  for (const m of erpModules) {
    const v = m.views.find((x) => x.key === viewKey)
    if (v) return { module: m, view: v }
  }
  return { module: erpModules[0], view: erpModules[0].views[0] }
}
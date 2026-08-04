'use client'

import { Download, Printer, X } from 'lucide-react'
import {
  fmtMoney,
  moneyToWords,
  type GibDocument,
  type GibParty,
} from '@/lib/erp-document'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

/* --------------------------- Matbu evrak stilleri -------------------------- */
/*
 * Bu bileşen bir GİB XSLT çıktısının birebir kopyasıdır: tema modundan bağımsız
 * olarak her zaman beyaz zemin / siyah yazı olmalıdır. Bu nedenle burada
 * bilinçli olarak tasarım token'ları değil sabit siyah-beyaz renkler kullanılır.
 */
const cellBase = 'border border-black px-1.5 py-1 align-top'
const thBase = 'border border-black bg-[#e8e8e8] px-1.5 py-1 text-center font-bold align-middle'
const labelCell = 'border border-black bg-[#f2f2f2] px-1.5 py-1 font-bold align-top whitespace-nowrap'

/** Sahte ama deterministik QR kod deseni (21x21 modül). */
function QrPlaceholder({ seed }: { seed: string }) {
  const size = 21
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let s = Math.abs(h) || 1
  const next = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }

  // Köşe hizalama desenleri gerçek QR görünümü için sabit çizilir.
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) =>
      r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    const ring = (r0: number, c0: number) => {
      const dr = r - r0
      const dc = c - c0
      const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6
      const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
      return edge || core
    }
    if (inBox(0, 0)) return ring(0, 0)
    if (inBox(0, size - 7)) return ring(0, size - 7)
    if (inBox(size - 7, 0)) return ring(size - 7, 0)
    return null
  }

  const cells: boolean[] = []
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const finder = isFinder(r, c)
      cells.push(finder === null ? next() > 0.5 : finder)
    }
  }

  return (
    <div
      className="grid size-[104px] shrink-0 gap-0 border border-black bg-white p-1"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      role="img"
      aria-label="Belge doğrulama QR kodu (örnek)"
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? 'bg-black' : 'bg-white'} />
      ))}
    </div>
  )
}

/** Taraf (gönderici / alıcı) bilgi bloğu — ince fontlarla alt alta. */
function PartyBlock({ party, compact }: { party: GibParty; compact?: boolean }) {
  return (
    <div className={compact ? 'text-[10px] leading-[1.45]' : 'text-[10.5px] leading-[1.5]'}>
      <p className="font-bold uppercase">{party.name}</p>
      {party.addressLines.map((l) => (
        <p key={l} className="font-light">
          {l}
        </p>
      ))}
      <p className="font-light">
        {party.district} / {party.city}
      </p>
      <p className="font-light">
        <span className="font-normal">Tel:</span> {party.phone}
      </p>
      <p className="font-light">
        <span className="font-normal">E-Posta:</span> {party.email}
      </p>
      {party.web ? (
        <p className="font-light">
          <span className="font-normal">Web:</span> {party.web}
        </p>
      ) : null}
      <p className="font-light">
        <span className="font-normal">Vergi Dairesi:</span> {party.taxOffice}
      </p>
      <p className="font-light">
        <span className="font-normal">VKN:</span> {party.vkn}
      </p>
    </div>
  )
}

interface GibDocumentDialogProps {
  doc: GibDocument | null
  onClose: () => void
}

export function GibDocumentDialog({ doc, onClose }: GibDocumentDialogProps) {
  if (!doc) return null

  const handlePrint = () => window.print()

  return (
    <Dialog open={doc !== null} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent
        showCloseButton={false}
        data-gib-dialog
        className="flex h-[94vh] w-[98vw] max-w-[1180px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[1180px]"
      >
        {/* Uygulama başlık çubuğu — yazdırmada gizlenir */}
        <div
          data-gib-no-print
          className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2.5"
        >
          <div className="min-w-0">
            <DialogTitle className="truncate text-[14px] font-semibold tracking-tight">
              {doc.title} — {doc.no}
            </DialogTitle>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {doc.receiver.name} · {doc.date} · ETTN {doc.uuid}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Download className="size-3.5" />
              PDF Olarak İndir
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Printer className="size-3.5" />
              Yazdır
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Belgeyi kapat"
              className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Kaydırılabilir evrak alanı */}
        <div className="min-h-0 flex-1 overflow-auto bg-[#525659] p-4">
          <div
            data-gib-doc
            className="mx-auto w-full max-w-[860px] bg-white px-8 py-7 font-sans text-black shadow-lg"
          >
            {/* ------------------------- ÜST KISIM (3 sütun) ------------------------ */}
            <header className="flex items-start justify-between gap-4">
              {/* Sol: gönderici firma */}
              <div className="min-w-0 flex-1">
                <PartyBlock party={doc.sender} />
              </div>

              {/* Orta: GİB logosu + belge adı */}
              <div className="flex shrink-0 flex-col items-center gap-1.5 px-2">
                <div className="grid h-[58px] w-[104px] place-items-center border border-[#8b1a1a] bg-[#a52121] text-center leading-none text-white">
                  <span>
                    <span className="block text-[15px] font-black tracking-tight">GİB</span>
                    <span className="mt-0.5 block text-[6.5px] font-medium uppercase tracking-wide">
                      Gelir İdaresi
                      <br />
                      Başkanlığı
                    </span>
                  </span>
                </div>
                <p className="whitespace-nowrap text-[15px] font-black tracking-tight">
                  {doc.title}
                </p>
                <p className="text-[8px] font-light uppercase tracking-wide text-[#444]">
                  e-Belge Uygulaması
                </p>
              </div>

              {/* Sağ: QR kod */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <QrPlaceholder seed={doc.uuid} />
                <p className="text-[7.5px] font-light text-[#444]">Karekod ile doğrula</p>
              </div>
            </header>

            {/* ------------------------ ORTA KISIM (2 sütun) ----------------------- */}
            <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Sol: SAYIN + cari bilgileri */}
              <div className="min-w-0 flex-1">
                <div className="border-t-2 border-black pt-1.5">
                  <p className="text-[11px] font-black tracking-wide">SAYIN</p>
                </div>
                <div className="mt-1.5">
                  <PartyBlock party={doc.receiver} />
                </div>
              </div>

              {/* Sağ: belge künyesi tablosu */}
              <div className="shrink-0 sm:w-[330px]">
                <table className="w-full border-collapse text-[10px]">
                  <tbody>
                    <tr>
                      <td className={labelCell}>Özelleştirme No</td>
                      <td className={cellBase}>{doc.customizationNo}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Senaryo</td>
                      <td className={cellBase}>{doc.scenario}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>
                        {doc.kind === 'irsaliye' ? 'İrsaliye Tipi' : 'Fatura Tipi'}
                      </td>
                      <td className={cellBase}>{doc.docType}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>
                        {doc.kind === 'irsaliye' ? 'İrsaliye No' : 'Fatura No'}
                      </td>
                      <td className={`${cellBase} font-mono font-bold`}>{doc.no}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>
                        {doc.kind === 'irsaliye' ? 'Düzenlenme Tarihi' : 'Fatura Tarihi'}
                      </td>
                      <td className={cellBase}>{doc.date}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Düzenlenme Saati</td>
                      <td className={cellBase}>{doc.time}</td>
                    </tr>
                    <tr>
                      <td className={labelCell}>ETTN</td>
                      <td className={`${cellBase} break-all font-mono text-[8.5px]`}>{doc.uuid}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* --------------------------- KALEMLER TABLOSU ------------------------- */}
            <section className="mt-5">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th scope="col" className={`${thBase} w-[38px]`}>
                      Sıra No
                    </th>
                    <th scope="col" className={`${thBase} w-[92px]`}>
                      Malzeme Kodu
                    </th>
                    <th scope="col" className={thBase}>
                      Malzeme Açıklaması
                    </th>
                    <th scope="col" className={`${thBase} w-[64px]`}>
                      Miktar
                    </th>
                    <th scope="col" className={`${thBase} w-[58px]`}>
                      Birim
                    </th>
                    <th scope="col" className={`${thBase} w-[82px]`}>
                      Fiyat
                    </th>
                    <th scope="col" className={`${thBase} w-[92px]`}>
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doc.lines.map((l) => (
                    <tr key={l.no}>
                      <td className={`${cellBase} text-center`}>{l.no}</td>
                      <td className={`${cellBase} font-mono`}>{l.code}</td>
                      <td className={cellBase}>{l.name}</td>
                      <td className={`${cellBase} text-right font-mono`}>
                        {l.qty.toLocaleString('tr-TR')}
                      </td>
                      <td className={`${cellBase} text-center`}>{l.unit}</td>
                      <td className={`${cellBase} text-right font-mono`}>{fmtMoney(l.price)}</td>
                      <td className={`${cellBase} text-right font-mono`}>{fmtMoney(l.amount)}</td>
                    </tr>
                  ))}
                  {/* Matbu evrak görünümü için boş dolgu satırları */}
                  {Array.from({ length: Math.max(0, 10 - doc.lines.length) }, (_, i) => (
                    <tr key={`filler-${i}`}>
                      <td className={`${cellBase} h-[19px]`} />
                      <td className={cellBase} />
                      <td className={cellBase} />
                      <td className={cellBase} />
                      <td className={cellBase} />
                      <td className={cellBase} />
                      <td className={cellBase} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ----------------------------- TOPLAMLAR ----------------------------- */}
            <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 border border-black p-2">
                <p className="text-[9px] font-bold uppercase tracking-wide">Yalnız</p>
                <p className="mt-0.5 text-[10px] font-light leading-relaxed">
                  # {moneyToWords(doc.grandTotal)} #
                </p>
              </div>

              <div className="shrink-0 sm:w-[330px]">
                <table className="w-full border-collapse text-[10px]">
                  <tbody>
                    <tr>
                      <td className={labelCell}>Mal Hizmet Toplam Tutarı</td>
                      <td className={`${cellBase} text-right font-mono`}>
                        {fmtMoney(doc.subtotal)} ₺
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Hesaplanan KDV (%{doc.vatRate})</td>
                      <td className={`${cellBase} text-right font-mono`}>
                        {fmtMoney(doc.vatTotal)} ₺
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCell}>Vergiler Dahil Toplam Tutar</td>
                      <td className={`${cellBase} text-right font-mono`}>
                        {fmtMoney(doc.grandTotal)} ₺
                      </td>
                    </tr>
                    <tr>
                      <td className={`${labelCell} text-[10px]`}>Ödenecek Tutar</td>
                      <td className={`${cellBase} text-right font-mono font-bold`}>
                        {fmtMoney(doc.grandTotal)} ₺
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* -------------------------- İLGİLİ DOKÜMANLAR ------------------------ */}
            <section className="mt-5">
              <p className="mb-1 border-b border-black pb-0.5 text-[10px] font-black uppercase tracking-wide">
                İlgili Dokümanlar
              </p>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr>
                    <th scope="col" className={`${thBase} w-[120px]`}>
                      Doküman Tipi
                    </th>
                    <th scope="col" className={`${thBase} w-[150px]`}>
                      Doküman No
                    </th>
                    <th scope="col" className={`${thBase} w-[100px]`}>
                      Tarih
                    </th>
                    <th scope="col" className={thBase}>
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doc.relatedDocs.map((d) => (
                    <tr key={d.no}>
                      <td className={cellBase}>{d.label}</td>
                      <td className={`${cellBase} font-mono`}>{d.no}</td>
                      <td className={`${cellBase} text-center`}>{d.date}</td>
                      <td className={`${cellBase} font-light`}>{d.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ------------------------- TAŞIYICI BİLGİLERİ ------------------------ */}
            <section className="mt-4">
              <p className="mb-1 border-b border-black pb-0.5 text-[10px] font-black uppercase tracking-wide">
                Taşıyıcı Bilgileri
              </p>
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  <tr>
                    <td className={`${labelCell} w-[130px]`}>Taşıyıcı Ünvanı</td>
                    <td className={cellBase}>{doc.carrier.company}</td>
                    <td className={`${labelCell} w-[110px]`}>Taşıyıcı VKN</td>
                    <td className={`${cellBase} w-[120px] font-mono`}>{doc.carrier.vkn}</td>
                  </tr>
                  <tr>
                    <td className={labelCell}>Şoför Adı Soyadı</td>
                    <td className={cellBase}>{doc.carrier.driverName}</td>
                    <td className={labelCell}>Şoför TCKN</td>
                    <td className={`${cellBase} font-mono`}>{doc.carrier.driverTckn}</td>
                  </tr>
                  <tr>
                    <td className={labelCell}>Araç Plakası</td>
                    <td className={`${cellBase} font-mono font-bold`}>{doc.carrier.plate}</td>
                    <td className={labelCell}>Araç Tipi</td>
                    <td className={cellBase}>{doc.carrier.vehicleType}</td>
                  </tr>
                  <tr>
                    <td className={labelCell}>Fiili Sevk Tarihi</td>
                    <td className={cellBase}>{doc.carrier.dispatchDate}</td>
                    <td className={labelCell}>Sevk Saati</td>
                    <td className={`${cellBase} font-mono`}>{doc.carrier.dispatchTime}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* ------------------------------- İMZA -------------------------------- */}
            <footer className="mt-6 flex items-end justify-between gap-6 text-[9px]">
              <p className="max-w-[420px] font-light leading-relaxed text-[#333]">
                Bu belge, 509 sıra no.lu Vergi Usul Kanunu Genel Tebliği uyarınca elektronik
                ortamda düzenlenmiş olup mali mühür ile imzalanmıştır. Belgenin doğruluğu
                karekod veya ETTN ile GİB portalından teyit edilebilir.
              </p>
              <div className="shrink-0 text-center">
                <div className="h-9 w-[190px] border-b border-black" />
                <p className="mt-1 font-bold uppercase tracking-wide">Teslim Alan</p>
                <p className="font-light text-[#333]">Kaşe / İmza</p>
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

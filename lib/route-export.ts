import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DriverDto } from '@/lib/route-data'

// jsPDF'nin yerleşik Helvetica yazı tipi Türkçe karakterleri içermediğinden,
// rapor metni PDF üzerinde bozulmadan görünmesi için ASCII uyumlu hazırlanır.
function toPdfText(value: string | number) {
  return String(value).replace(/[çÇğĞıİöÖşŞüÜ]/g, (character) => ({
    ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I',
    ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U',
  })[character] ?? character)
}

/** Optimize edilmiş planı araç ve durak bazında PDF raporu olarak indirir. */
export function exportToPdf(drivers: DriverDto[]) {
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const createdAt = new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())

  const rows = drivers.flatMap((driver) => {
    const depotName = driver.depotName || 'Merkez Depo'
    const sortedStops = [...driver.stops].sort((a, b) => a.sequence - b.sequence)

    return [
      [driver.label, driver.plate, driver.fullName, '0', depotName, driver.shiftStart, 'Cikis deposu', '-', '-'],
      ...sortedStops.map((stop) => [
        driver.label,
        driver.plate,
        driver.fullName,
        String(stop.sequence),
        stop.customerName,
        stop.eta,
        stop.status === 'completed' ? 'Teslim edildi' : stop.status === 'risk' ? 'Riskli' : 'Bekliyor',
        `${stop.weightKg.toLocaleString('tr-TR')} kg`,
        `${stop.volumeM3} m³`,
      ]),
    ]
  }).map((row) => row.map(toPdfText))

  document.setFont('helvetica', 'bold')
  document.setFontSize(18)
  document.text('Rota Plani', 14, 16)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.setTextColor(90)
  document.text(toPdfText(`Olusturulma: ${createdAt}  •  ${drivers.length} arac`), 14, 22)

  autoTable(document, {
    startY: 28,
    head: [['Arac', 'Plaka', 'Sofor', 'Sira', 'Durak', 'ETA', 'Durum', 'Agirlik', 'Hacim']],
    body: rows,
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: { fillColor: [48, 82, 201], textColor: 255, fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.2, valign: 'middle' },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 27 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 62 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 28 },
      7: { cellWidth: 23, halign: 'right' },
      8: { cellWidth: 18, halign: 'right' },
    },
    didDrawPage: (data) => {
      document.setFontSize(8)
      document.setTextColor(120)
      document.text('RotaPlan • Sevkiyat Komuta Merkezi', 14, document.internal.pageSize.height - 8)
      document.text(`Sayfa ${data.pageNumber}`, document.internal.pageSize.width - 28, document.internal.pageSize.height - 8)
    },
  })

  document.save('rota_plani.pdf')
}

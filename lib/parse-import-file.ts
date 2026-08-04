import Papa from "papaparse"
import * as XLSX from "xlsx"
import type { UnassignedTaskDto } from "@/lib/route-data"

const HEADER_MAP: Record<string, string> = {
  "müşteri": "customerName",
  "musteri": "customerName",
  "adres": "address",
  "ilçe": "district",
  "ilce": "district",
  "sipariş no": "orderNo",
  "siparis no": "orderNo",
  "ağırlık": "weightKg",
  "agirlik": "weightKg",
  "kg": "weightKg",
  "servis süresi": "serviceMinutes",
  "servis suresi": "serviceMinutes",
  "öncelik": "priority",
  "oncelik": "priority",
  "başlangıç": "windowStart",
  "baslangic": "windowStart",
  "bitiş": "windowEnd",
  "bitis": "windowEnd",
}

let importCounter = 0

function normalizeRow(raw: Record<string, unknown>): UnassignedTaskDto | null {
  const mapped: Record<string, string> = {}

  for (const [key, value] of Object.entries(raw)) {
    const field = HEADER_MAP[key.trim().toLowerCase()]
    if (field) mapped[field] = String(value ?? "").trim()
  }

  if (!mapped.customerName || !mapped.address) return null

  importCounter += 1

  const priority =
    mapped.priority === "Yüksek" || mapped.priority === "Düşük"
      ? mapped.priority
      : "Normal"

  return {
    id: `UA-IMP-${Date.now()}-${importCounter}`,
    customerName: mapped.customerName,
    address: mapped.address,
    district: mapped.district || "Bilinmiyor",
    windowStart: mapped.windowStart || "09:00",
    windowEnd: mapped.windowEnd || "18:00",
    weightKg: Number(mapped.weightKg.replace(",", ".")) || 0,
    serviceMinutes: Number(mapped.serviceMinutes) || 15,
    priority,
    orderNo: mapped.orderNo || `SP-IMP-${importCounter}`,
  }
}

export async function parseImportFile(file: File): Promise<UnassignedTaskDto[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv")
  const rawRows = isCsv ? await parseCsv(file) : await parseExcel(file)
  return rawRows
    .map(normalizeRow)
    .filter((row): row is UnassignedTaskDto => row !== null)
}

function parseCsv(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data as Record<string, unknown>[]),
      error: reject,
    })
  })
}

async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: "" })
}
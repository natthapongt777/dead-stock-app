import { StockItem, LogEntry } from '@/types'

// ─── In-memory store for DEMO mode (no Google Sheets config required) ──────────
let mockStore: StockItem[] = [
  { rowIndex: 2,  model: 'LP-X200',   stock: 87,  productionDate: '15/01/2024', caused: 'ยอดขายลด / Demand drop',          actionPlan: '',                           lastUpdated: '',             updatedBy: '' },
  { rowIndex: 3,  model: 'HP-3500A',  stock: 34,  productionDate: '20/02/2024', caused: 'มีรุ่นใหม่ทดแทน / New model',     actionPlan: 'ติดต่อลูกค้าเก่า 10 ราย',   lastUpdated: '10/05/2025',   updatedBy: 'สมชาย' },
  { rowIndex: 4,  model: 'MP-7700C',  stock: 120, productionDate: '05/03/2024', caused: 'ราคาต้นทุนสูง / High cost',        actionPlan: '',                           lastUpdated: '',             updatedBy: '' },
  { rowIndex: 5,  model: 'SP-1100B',  stock: 55,  productionDate: '12/04/2024', caused: 'คู่แข่งตัดราคา / Price war',       actionPlan: 'Promo ลด 20% เดือนนี้',     lastUpdated: '15/05/2025',   updatedBy: 'สุดา' },
  { rowIndex: 6,  model: 'GP-9900X',  stock: 18,  productionDate: '28/04/2024', caused: 'Spec ไม่ตรงตลาด',                  actionPlan: '',                           lastUpdated: '',             updatedBy: '' },
  { rowIndex: 7,  model: 'FP-4400Z',  stock: 200, productionDate: '01/05/2024', caused: 'Over production',                  actionPlan: 'Export ไป CLMV',             lastUpdated: '18/05/2025',   updatedBy: 'วิชัย' },
  { rowIndex: 8,  model: 'TP-2200W',  stock: 63,  productionDate: '10/05/2024', caused: 'ลูกค้าหลักยกเลิก order',           actionPlan: '',                           lastUpdated: '',             updatedBy: '' },
  { rowIndex: 9,  model: 'EP-6600V',  stock: 41,  productionDate: '22/05/2024', caused: 'Product defect batch B',           actionPlan: 'Rework แล้ว retest',         lastUpdated: '20/05/2025',   updatedBy: 'นิดา' },
  { rowIndex: 10, model: 'RP-8800U',  stock: 95,  productionDate: '30/05/2024', caused: 'ยอดขายต่ำกว่าเป้า',               actionPlan: '',                           lastUpdated: '',             updatedBy: '' },
  { rowIndex: 11, model: 'KP-5500S',  stock: 29,  productionDate: '15/06/2024', caused: 'Channel conflict / ช่องทางซ้อน',   actionPlan: 'Review channel partner',     lastUpdated: '21/05/2025',   updatedBy: 'ประยุทธ์' },
]

const mockLogStore: LogEntry[] = []

function thaiDateTime(): string {
  return new Date().toLocaleString('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  })
}

function isConfigured(): boolean {
  return !!(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
}

// ─── Google Sheets helpers ────────────────────────────────────────────────────
async function getSheetClient() {
  const { google } = await import('googleapis')
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function getStockData(): Promise<StockItem[]> {
  if (!isConfigured()) return [...mockStore]

  const sheets = await getSheetClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'A2:G',
  })
  const rows = res.data.values ?? []
  return rows.map((row, idx) => ({
    rowIndex: idx + 2,
    model:           row[0] ?? '',
    stock:           parseInt(row[1] ?? '0') || 0,
    productionDate:  row[2] ?? '',
    caused:          row[3] ?? '',
    actionPlan:      row[4] ?? '',
    lastUpdated:     row[5] ?? '',
    updatedBy:       row[6] ?? '',
  }))
}

export async function updateActionPlan(
  rowIndex: number,
  model: string,
  actionPlan: string,
  salesName: string,
  oldActionPlan: string,
): Promise<void> {
  const now = thaiDateTime()

  if (!isConfigured()) {
    // Demo: mutate in-memory store
    const item = mockStore.find(i => i.rowIndex === rowIndex)
    if (item) {
      item.actionPlan  = actionPlan
      item.lastUpdated = now
      item.updatedBy   = salesName
    }
    mockLogStore.unshift({ timestamp: now, model, salesName, oldActionPlan, newActionPlan: actionPlan })
    return
  }

  const sheets = await getSheetClient()

  // Update columns E-G (action plan, last updated, updated by)
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `E${rowIndex}:G${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[actionPlan, now, salesName]] },
  })

  // Append to Log sheet (create sheet named "Log" if not exists)
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Log!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[now, model, salesName, oldActionPlan, actionPlan]] },
  })
}

export async function getLog(): Promise<LogEntry[]> {
  if (!isConfigured()) return [...mockLogStore]

  const sheets = await getSheetClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Log!A2:E',
  })
  const rows = (res.data.values ?? []).reverse()
  return rows.map(row => ({
    timestamp:      row[0] ?? '',
    model:          row[1] ?? '',
    salesName:      row[2] ?? '',
    oldActionPlan:  row[3] ?? '',
    newActionPlan:  row[4] ?? '',
  }))
}

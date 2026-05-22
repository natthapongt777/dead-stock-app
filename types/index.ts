export interface StockItem {
  rowIndex: number
  model: string
  stock: number
  productionDate: string
  caused: string
  actionPlan: string
  lastUpdated: string
  updatedBy: string
}

export interface LogEntry {
  timestamp: string
  model: string
  salesName: string
  oldActionPlan: string
  newActionPlan: string
}

export interface UpdatePayload {
  rowIndex: number
  model: string
  actionPlan: string
  salesName: string
  oldActionPlan: string
}

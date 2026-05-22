import { NextRequest, NextResponse } from 'next/server'
import { getStockData, updateActionPlan, getLog } from '@/lib/sheets'
import { UpdatePayload } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  try {
    if (searchParams.get('log') === '1') {
      const log = await getLog()
      return NextResponse.json(log)
    }
    const data = await getStockData()
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: UpdatePayload = await req.json()
    const { rowIndex, model, actionPlan, salesName, oldActionPlan } = body

    if (!salesName?.trim()) {
      return NextResponse.json({ error: 'salesName required' }, { status: 400 })
    }

    await updateActionPlan(rowIndex, model, actionPlan, salesName.trim(), oldActionPlan ?? '')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

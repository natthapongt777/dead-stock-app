'use client'

import { useState, useEffect, useCallback } from 'react'
import { StockItem, LogEntry } from '@/types'

type Tab = 'stock' | 'log'

export default function Home() {
  const [salesName, setSalesName]   = useState('')
  const [nameInput, setNameInput]   = useState('')
  const [items, setItems]           = useState<StockItem[]>([])
  const [log, setLog]               = useState<LogEntry[]>([])
  const [loading, setLoading]       = useState(false)
  const [editItem, setEditItem]     = useState<StockItem | null>(null)
  const [editText, setEditText]     = useState('')
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState<Tab>('stock')
  const [toast, setToast]           = useState('')
  const [filter, setFilter]         = useState<'all' | 'pending' | 'done'>('all')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [stockRes, logRes] = await Promise.all([
        fetch('/api/sheets'),
        fetch('/api/sheets?log=1'),
      ])
      const stockData = await stockRes.json()
      const logData = await logRes.json()
      setItems(Array.isArray(stockData) ? stockData : [])
      setLog(Array.isArray(logData) ? logData : [])
      if (!Array.isArray(stockData) && stockData.error) {
        showToast('เชื่อมต่อ Google Sheets ไม่สำเร็จ: ' + stockData.error)
      }
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (salesName) fetchData()
  }, [salesName, fetchData])

  const handleNameSubmit = () => {
    const name = nameInput.trim()
    if (name) setSalesName(name)
  }

  const openEdit = (item: StockItem) => {
    setEditItem(item)
    setEditText(item.actionPlan)
  }

  const handleSave = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      const res = await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex:      editItem.rowIndex,
          model:         editItem.model,
          actionPlan:    editText.trim(),
          salesName,
          oldActionPlan: editItem.actionPlan,
        }),
      })
      if (!res.ok) throw new Error()
      setEditItem(null)
      showToast(`บันทึก ${editItem.model} เรียบร้อย`)
      fetchData()
    } catch {
      showToast('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    }
    setSaving(false)
  }

  const filtered = items.filter(item => {
    const matchSearch =
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.caused.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'pending' ? !item.actionPlan :
      !!item.actionPlan
    return matchSearch && matchFilter
  })

  const totalStock   = items.reduce((s, i) => s + i.stock, 0)
  const doneCount    = items.filter(i => i.actionPlan).length
  const pendingCount = items.length - doneCount

  // ── Name entry screen ──────────────────────────────────────────────────────
  if (!salesName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6 text-white text-center">
            <div className="text-5xl mb-2">📦</div>
            <h1 className="text-2xl font-bold">Dead Stock</h1>
            <p className="text-blue-100 text-sm mt-1">Action Plan Management</p>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อของคุณ
              </label>
              <input
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 transition"
                autoFocus
              />
            </div>
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              เข้าสู่ระบบ →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h1 className="font-bold text-sm sm:text-base leading-none">Dead Stock Management</h1>
              <p className="text-slate-400 text-xs">Action Plan Tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-700 text-blue-100 text-xs px-3 py-1.5 rounded-full font-medium">
              👤 {salesName}
            </span>
            <button
              onClick={() => { setSalesName(''); setItems([]); setLog([]) }}
              className="text-slate-400 hover:text-white text-xs transition px-2"
            >
              ออก
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4 space-y-4">

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-red-100 px-4 py-3 text-center shadow-sm">
            <div className="text-xl font-bold text-red-600">{items.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">รุ่น Dead Stock</div>
          </div>
          <div className="bg-white rounded-xl border border-orange-100 px-4 py-3 text-center shadow-sm">
            <div className="text-xl font-bold text-orange-500">{totalStock.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">ชิ้นรวม</div>
          </div>
          <div className="bg-white rounded-xl border border-green-100 px-4 py-3 text-center shadow-sm">
            <div className="text-xl font-bold text-green-600">{doneCount}<span className="text-sm text-gray-400">/{items.length}</span></div>
            <div className="text-xs text-gray-500 mt-0.5">มี Action Plan</div>
          </div>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>ความคืบหน้า Action Plan</span>
              <span className="font-semibold text-blue-600">{Math.round(doneCount / items.length * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${doneCount / items.length * 100}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-green-600">✓ เสร็จ {doneCount} รุ่น</span>
              <span className="text-orange-500">⏳ รอ {pendingCount} รุ่น</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 w-fit">
          {(['stock', 'log'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'stock' ? '📋 ข้อมูล Stock' : '📝 ประวัติ Update'}
            </button>
          ))}
        </div>

        {/* Stock Tab */}
        {tab === 'stock' && (
          <>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="ค้นหา Model หรือ สาเหตุ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
              />
              <div className="flex gap-1">
                {(['all', 'pending', 'done'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition border ${
                      filter === f
                        ? f === 'pending'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : f === 'done'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {f === 'all' ? 'ทั้งหมด' : f === 'pending' ? 'ยังไม่มีแผน' : 'มีแผนแล้ว'}
                  </button>
                ))}
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 hover:bg-gray-50 transition"
                  title="รีเฟรช"
                >
                  {loading ? '⟳' : '🔄'}
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-20 text-gray-400 text-sm">กำลังโหลด...</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-white text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3">รุ่น (Model)</th>
                        <th className="text-right px-4 py-3">Stock</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">วันผลิต</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">สาเหตุ</th>
                        <th className="text-left px-4 py-3">Action Plan</th>
                        <th className="text-left px-4 py-3 hidden lg:table-cell">Update ล่าสุด</th>
                        <th className="px-4 py-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => (
                        <tr
                          key={item.rowIndex}
                          className={`border-t border-gray-100 hover:bg-blue-50/50 transition ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-blue-700 text-xs sm:text-sm">
                            {item.model}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="bg-red-100 text-red-700 font-bold text-xs px-2 py-1 rounded-lg">
                              {item.stock.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                            {item.productionDate}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-gray-600 text-xs" title={item.caused}>
                              {item.caused.length > 30 ? item.caused.slice(0, 30) + '…' : item.caused}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {item.actionPlan ? (
                              <span className="text-gray-700 text-xs line-clamp-2" title={item.actionPlan}>
                                {item.actionPlan}
                              </span>
                            ) : (
                              <span className="text-gray-300 italic text-xs">— ยังไม่มี —</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {item.lastUpdated ? (
                              <div className="text-xs">
                                <div className="text-gray-400">{item.lastUpdated}</div>
                                <div className="text-blue-500 font-medium">{item.updatedBy}</div>
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEdit(item)}
                              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap"
                            >
                              แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      {search ? 'ไม่พบรุ่นที่ค้นหา' : 'ไม่มีข้อมูล'}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  แสดง {filtered.length} จาก {items.length} รุ่น
                </div>
              </div>
            )}
          </>
        )}

        {/* Log Tab */}
        {tab === 'log' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3">วันเวลา</th>
                    <th className="text-left px-4 py-3">Model</th>
                    <th className="text-left px-4 py-3">Sales</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">เดิม</th>
                    <th className="text-left px-4 py-3">ใหม่</th>
                  </tr>
                </thead>
                <tbody>
                  {log.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                        ยังไม่มีประวัติ update
                      </td>
                    </tr>
                  ) : log.map((entry, idx) => (
                    <tr key={idx} className={`border-t border-gray-100 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{entry.timestamp}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700 text-xs">{entry.model}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-700">{entry.salesName}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden md:table-cell max-w-[160px] truncate" title={entry.oldActionPlan}>
                        {entry.oldActionPlan || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate" title={entry.newActionPlan}>
                        {entry.newActionPlan || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Edit Modal */}
      {editItem && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={e => { if (e.target === e.currentTarget) setEditItem(null) }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">✏️ แก้ไข Action Plan</h2>
                  <p className="text-blue-200 text-xs mt-0.5">รุ่น: <span className="font-mono font-bold">{editItem.model}</span></p>
                </div>
                <button onClick={() => setEditItem(null)} className="text-blue-200 hover:text-white text-xl leading-none">✕</button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Info chips */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                  <div className="text-lg font-bold text-red-600">{editItem.stock.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">ชิ้น</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-xs font-semibold text-gray-700">{editItem.productionDate}</div>
                  <div className="text-xs text-gray-400">วันผลิต</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100 col-span-1">
                  <div className="text-xs font-semibold text-orange-700 line-clamp-2">{editItem.caused}</div>
                  <div className="text-xs text-gray-400">สาเหตุ</div>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Action Plan
                </label>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={5}
                  placeholder="เช่น ติดต่อลูกค้า 5 ราย / ลดราคา 15% / Export ไป CLMV ..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                  autoFocus
                />
              </div>

              {/* Logged-as notice */}
              <div className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                💾 บันทึกโดย <strong className="text-blue-700">{salesName}</strong> ·{' '}
                {new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditItem(null)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2.5 rounded-xl font-semibold transition text-sm"
                >
                  {saving ? '⟳ กำลังบันทึก...' : '💾 บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

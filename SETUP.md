# Dead Stock App — Setup Guide

## 1. Google Sheets format

สร้าง Google Sheet ใหม่ แล้วตั้ง headers ใน **row 1** ดังนี้:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Model | Stock | Production Date | Caused | Action Plan | Last Updated | Updated By |

สร้าง sheet ที่ 2 ชื่อ **Log** แล้วตั้ง headers:

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Model | Sales Name | Old Action Plan | New Action Plan |

---

## 2. Google Cloud — Service Account

1. ไปที่ [console.cloud.google.com](https://console.cloud.google.com)
2. สร้าง Project ใหม่ (หรือใช้อันเดิม)
3. เปิด **Google Sheets API**: APIs & Services → Enable APIs → ค้นหา "Google Sheets API" → Enable
4. สร้าง Service Account: APIs & Services → Credentials → Create Credentials → Service Account
5. ตั้งชื่อ (เช่น `dead-stock-app`) → Create and Continue → Done
6. คลิกที่ Service Account ที่สร้าง → Keys tab → Add Key → JSON → Download
7. เปิดไฟล์ JSON ที่ดาวน์โหลด → **copy ทั้งหมด** (จะใส่ใน env ต่อไป)

---

## 3. Share Google Sheet กับ Service Account

1. เปิด Google Sheet
2. กดปุ่ม **Share**
3. ใส่ email ของ Service Account (ดูได้จาก JSON ที่ดาวน์โหลด field `client_email`)
4. ให้ permission เป็น **Editor**

---

## 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ project:

```bash
# Sheet ID จาก URL ของ Google Sheet
# https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# JSON ของ Service Account (ทั้งก้อน ไม่มี line break)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

> ⚠️ ไม่ต้อง commit ไฟล์ `.env.local` ขึ้น Git เด็ดขาด

---

## 5. Deploy บน Vercel

1. `npm run build` เพื่อตรวจว่า build ผ่าน
2. Push code ขึ้น GitHub (ไม่ต้อง push `.env.local`)
3. ไปที่ [vercel.com](https://vercel.com) → New Project → Import repo
4. ตั้ง Environment Variables ใน Vercel dashboard:
   - `GOOGLE_SHEET_ID` = Sheet ID
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = JSON string (ทั้งก้อน)
5. Deploy → ได้ URL แชร์ให้ทีม Sales 10 คนใช้ได้เลย

---

## 6. Run บน local (สำหรับ demo)

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 — ถ้าไม่มี `.env.local` จะรันด้วย Mock Data อัตโนมัติ

# Campus Service — ระบบ Full-Stack 3 ชั้น


## ภาพรวม

**ระบบทำอะไร:** [เช่น ระบบรับและติดตามคำร้องบริการในมหาวิทยาลัย — ผู้ใช้ดูรายการคำร้อง เพิ่มคำร้องใหม่ และดูสถานะ (pending / completed) ได้จากหน้าเว็บ ข้อมูลถูกเก็บถาวรในฐานข้อมูล]

**เทคโนโลยีที่ใช้**

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React + Vite, React Router |
| Backend | Node.js + Express (REST API) |
| Database | SQLite ผ่าน `node:sqlite` (ต้องใช้ **Node.js 22.13 ขึ้นไป**) |
| Logging | morgan |

---

## สถาปัตยกรรม 3 ชั้น

```
┌────────────────┐  HTTP / JSON  ┌────────────────┐   SQL   ┌────────────────┐
│  ① React       │ ────────────► │  ② Express API │ ──────► │  ③ SQLite      │
│  พอร์ต 5173    │ ◄──────────── │  พอร์ต 3001    │ ◄────── │  campus.db     │
│  frontend/     │     JSON      │  api/src/      │  rows   │  api/data/     │
└────────────────┘               └────────────────┘         └────────────────┘
```

| ชั้น | หน้าที่ | โฟลเดอร์ |
|---|---|---|
| **① Frontend (React)** | แสดงหน้าจอ รับ input จากผู้ใช้ เรียก API ผ่าน `apiClient.js` — ไม่รู้ว่าข้อมูลมาจากไหน | `frontend/` |
| **② API (Express)** | แบ่งภายในเป็น **route** (เส้นทาง) → **controller** (รับ req / ตอบ res / validation) → **service** (SQL และตรรกะข้อมูล) | `api/src/` |
| **③ Database (SQLite)** | เก็บข้อมูลถาวร ตาราง `users` และ `requests` (foreign key `requester_id`) | `api/data/campus.db` |



**ตัวอย่างการไหลของข้อมูล** (ผู้ใช้กดดูรายการคำร้อง): React เรียก `getRequests()` → `GET /api/requests` → route → controller → service สั่ง `SELECT ... JOIN` → SQLite คืน rows → service แปลงเป็น JSON → `res.json()` → React แสดงผล

**กฎ:** frontend คุยกับ API เท่านั้น · controller ไม่รู้จัก SQL · service ไม่รู้จัก `req`/`res`

---

## วิธีรัน (dev)

ต้องมี Node.js 22.13+ และ Git

```bash

cd [ชื่อโฟลเดอร์]/labs/week-11/source

# ติดตั้ง dependencies
npm install --prefix api
npm install --prefix frontend

# ตั้งค่า env (ดูตารางด้านล่าง)
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env.local   # ถ้าต้องการเปลี่ยน API URL ตอน dev
```

เปิดตามลำดับ **ล่างขึ้นบน: DB → API → Frontend** โดยใช้ **2 terminal**

**① สร้างฐานข้อมูล** (ทำครั้งเดียว ก่อนเปิด API — สร้าง `campus.db` จาก `api/data/schema.sql` พร้อมข้อมูลตั้งต้น)
```bash
npm run db:setup --prefix api
```

**Terminal 1 — API**
```bash
cd api && npm run dev
# → http://localhost:3001
```

**Terminal 2 — Frontend**
```bash
cd frontend && npm run dev
# → http://localhost:5173
```

**ตรวจว่าทำงานครบ 3 ชั้น**

| ตรวจอะไร | ทำอย่างไร | ต้องเห็น |
|---|---|---|
| ฐานข้อมูล | ดูไฟล์ `api/data/campus.db` | ไฟล์อยู่จริง |
| API | `curl localhost:3001/api/requests` | JSON รายการคำร้อง |
| Health | `curl localhost:3001/api/health` | `"status": "ok"` และ `database.connected: true` |
| Frontend | เปิด `localhost:5173` | Dashboard แสดงข้อมูล |
| ครบวงจร | เพิ่มคำร้องจากหน้าเว็บ | ข้อมูลบันทึกและแสดงผล |

---

## วิธีรัน (production)

ใน production ใช้ **server เดียว พอร์ตเดียว** — build React เป็นไฟล์ static แล้วให้ Express เสิร์ฟทั้งหน้าเว็บ (`/`) และ API (`/api`)

```bash
NODE_ENV=production npm run build     # build frontend → frontend/dist/ และติดตั้ง api
NODE_ENV=production npm start         # เปิด API + เสิร์ฟ frontend/dist
# → http://localhost:3001
```

**ซ้อมให้เหมือน cloud** (ใช้พอร์ตอื่นที่ไม่ใช่ 3001):
```bash
NODE_ENV=production npm run build
NODE_ENV=production PORT=10000 npm start
# เปิด http://localhost:10000 ต้องได้ทั้งเว็บและข้อมูล
```

**ข้อควรระวัง**
- แก้โค้ด frontend แล้วต้อง `npm run build` ใหม่ — production ไม่มี hot reload
- `frontend/.env.production` ต้องมี `VITE_API_BASE_URL=` (ค่าว่าง) เพื่อให้ frontend เรียก `/api/...` แบบ relative ไม่ฝัง `localhost:3001` ลงใน bundle
- script `build` ใช้ `--include=dev` เพื่อให้ Vite (devDependency) ถูกติดตั้งแม้ตั้ง `NODE_ENV=production`

---

## Environment Variables

อ่านรวมที่เดียวใน `api/src/config.js` ทุกตัวมีค่า default

| ตัวแปร | จำเป็น | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|
| `NODE_ENV` | ไม่ | `development` | `production` = เสิร์ฟ `dist/`, log แบบ `combined`, ซ่อนรายละเอียด error |
| `PORT` | ไม่ | `3001` | พอร์ตของ API (cloud เช่น Render กำหนดให้เอง) |
| `CORS_ORIGIN` | ไม่ | `http://localhost:5173` | origin ของ frontend ที่อนุญาตตอน dev |
| `DB_FILE` | ไม่ | `api/data/campus.db` | ตำแหน่งไฟล์ SQLite |
| `VITE_API_BASE_URL` | ไม่ | `http://localhost:3001` (dev) / ว่าง (production) | base URL ที่ frontend ใช้เรียก API · ตั้งใน `frontend/.env.production` (commit ได้) |
| `TURSO_DATABASE_URL` | ไม่ | — | *(Challenge)* ถ้าตั้ง จะใช้ Turso แทนไฟล์ `campus.db` |
| `TURSO_AUTH_TOKEN` | ไม่ | — | *(Challenge)* token คู่กับ URL ข้างบน |

> ห้าม commit `.env` (อยู่ใน `.gitignore`) — commit เฉพาะ `.env.example` ที่ไม่มีค่าจริง

**Health check:** `GET /api/health` → `200` + `status: "ok"` เมื่อปกติ · `503` + `status: "degraded"` เมื่อต่อฐานข้อมูลไม่ได้ (cloud ใช้ endpoint นี้ตัดสินว่าพร้อมรับผู้ใช้หรือยัง)

---

## เอกสารและหลักฐานประกอบ

| ไฟล์ | เนื้อหา |
|---|---|
| [`DATABASE_CHOICES.md`](DATABASE_CHOICES.md) | ทางเลือกฐานข้อมูล SQL / NoSQL / async (CP41) |
| [`DEMO.md`](DEMO.md) | ลิงก์วิดีโอสาธิตและอธิบาย source (CP42) |
| [`AI_USAGE.md`](AI_USAGE.md) | การเปิดเผยการใช้ AI |
| `evidence/images/production-one-port.png` | เปิด `:3001` แล้วเห็นหน้าเว็บ (production พอร์ตเดียว) |
| `evidence/images/health-production.png` | `/api/health` แสดง `env: production` |

**ตัวตรวจอัตโนมัติ** (รันที่ root): `node check-week11.mjs` (และ `check-week07.mjs`, `check-week10.mjs` สำหรับสัปดาห์ก่อนหน้า)

---

## การตัดสินใจออกแบบ

### ทำไมแยก 3 ชั้น (และแยก route/controller/service ใน API)
- **เปลี่ยนส่วนเดียวได้โดยไม่กระทบส่วนอื่น** — ตลอดรายวิชาเปลี่ยนแหล่งข้อมูลหลายครั้ง (localStorage → API, ไฟล์ JSON → SQLite) แต่แก้เพียงชั้นเดียวทุกครั้ง เพราะ frontend ไม่รู้ที่มาของข้อมูล, controller ไม่รู้จัก SQL, service ไม่รู้จัก req/res
- **ความลับอยู่ฝั่งเซิร์ฟเวอร์** — เบราว์เซอร์ไม่เห็น query หรือ path ของฐานข้อมูล
- **ทดสอบและหาจุดผิดพลาดง่าย** — รู้ทันทีว่าปัญหาอยู่ชั้นไหน
- **ข้อจำกัดที่รู้:** การเปลี่ยน "สัญญา" ของ service (เช่น sync → async เมื่อย้ายไป MongoDB หรือ `pg`) ยังกระทบ controller ที่เรียกใช้ ต้องเติม `await`

### ทำไมเลือก SQLite
- **ข้อมูลมีโครงชัดและมีความสัมพันธ์** — คำร้องชี้ไปหาผู้ใช้ด้วย foreign key ใช้ JOIN และ constraint ปฏิเสธข้อมูลผิดได้ จึงเหมาะกับ SQL มากกว่า NoSQL
- **ติดตั้งง่าย** — เป็นไฟล์เดียว ไม่ต้องตั้งเซิร์ฟเวอร์ฐานข้อมูล และใช้ `node:sqlite` ที่มากับ Node (ไม่ต้องลงไลบรารีเพิ่ม)
- **เป็นแบบ sync** — ไฟล์อยู่ในเครื่องเดียวกัน อ่านเสร็จทันที โค้ดจึงเรียบง่าย ไม่ต้อง `await`
- **ป้องกัน SQL injection** ด้วย parameterized query ทุกคำสั่ง
- **ข้อจำกัดที่รู้:** บน cloud free tier (เช่น Render) ไฟล์ระบบเป็นแบบชั่วคราว — ข้อมูลที่เพิ่มจะหายเมื่อ restart/redeploy ทางแก้คือย้ายไปฐานข้อมูลแยกเครื่อง เช่น **Turso** (SQLite บนอินเทอร์เน็ต ใช้ `libsql` แบบ sync) ซึ่งแก้เฉพาะชั้น service และเลือกใช้ผ่าน env

### ทำไม production รวมเป็นพอร์ตเดียว
dev แยก 2 server เพื่อให้ Vite มี hot reload แต่ production รวมเป็นหนึ่งเพราะ ไม่ต้องจ่าย/ตั้งค่า cloud สองที่ · ไม่ติดปัญหา CORS (โดเมนเดียวกัน) · dev server ของ Vite ไม่ได้ออกแบบมาให้ใช้งานจริง
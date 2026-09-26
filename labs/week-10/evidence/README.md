# 🛡️ รายงานผลการทดสอบความปลอดภัย

## SQL Injection Prevention (CP31)

| หัวข้อ | รายละเอียด |
|---|---|
| **วิชา** | ENGSE203 การเขียนโปรแกรมสำหรับวิศวกรซอฟต์แวร์ |
| **หน่วยที่ 4 · สัปดาห์ที่ 10** | Node.js & Database Integration |
| **ผู้ทดสอบ** | ภานุพงษ์ ทองดี |
| **รหัสนักศึกษา** | 68543210016-0 |
| **เทคนิคที่ใช้ป้องกัน** | Parameterized Queries (`?`) |

> 🎯 **เป้าหมาย:** พิสูจน์ว่าระบบป้องกันการโจมตีแบบ SQL Injection ได้อย่างสมบูรณ์ ด้วยเทคนิค Parameterized Queries

---

## 📑 สารบัญ

1. [หลักการและแนวคิดความปลอดภัย](#1-หลักการและแนวคิดความปลอดภัย)
2. [สิ่งที่ `?` ใช้แทนไม่ได้ และแนวทางแก้ไข](#2-สิ่งที่--ใช้แทนไม่ได้-และแนวทางแก้ไข)
3. [บันทึกผลการทดสอบเจาะระบบจริง](#3-บันทึกผลการทดสอบเจาะระบบจริง-security-testing-log)
4. [Automated Test Verification](#4-automated-test-verification)
5. [สรุปผลการตรวจสอบความปลอดภัย](#5-สรุปผลการตรวจสอบความปลอดภัย)

---

## 1. หลักการและแนวคิดความปลอดภัย

โค้ดที่ปลอดภัยกับโค้ดที่มีช่องโหว่ต่างกันเพียง **วิธีส่งค่าไปยังฐานข้อมูล**

```javascript
// ❌ อันตรายอย่างยิ่ง — นำค่าจากผู้ใช้มาต่อ String เข้า SQL Command โดยตรง
db.prepare(`SELECT * FROM requests WHERE status = '${status}'`).all();

// ✅ ปลอดภัยสูงสุด — ใช้ Parameterized Query (Placeholder ?)
db.prepare('SELECT * FROM requests WHERE status = ?').all(status);
```

### กลไกการป้องกันของ Parameterized Queries

เมื่อใช้ placeholder `?` ตัวประมวลผลของ SQLite จะแยก **ขั้นตอนตีความโครงสร้างคำสั่ง SQL (Compile/Prepare)** ออกจาก **ขั้นตอนรับส่งข้อมูล (Data Binding)** อย่างเด็ดขาด

- ข้อมูลที่ส่งเข้ามาผ่าน `status` ไม่ว่าจะยาวแค่ไหน หรือมีเครื่องหมายพิเศษทาง SQL เช่น `'`, `;`, `--`, `OR 1=1` จะถูกมองเป็น **ข้อความธรรมดา (String Literal)** เท่านั้น
- SQLite จะไม่นำค่าดังกล่าวมาแปลงเป็นคำสั่งเพื่อรัน ผู้ไม่หวังดีจึงไม่สามารถ Break out ออกมาแก้ไขตรรกะของ SQL ได้

---

## 2. สิ่งที่ `?` ใช้แทนไม่ได้ และแนวทางแก้ไข

Placeholder `?` ถูกออกแบบมาเพื่อใช้แทน **ข้อมูล (Values)** เท่านั้น
**ไม่สามารถใช้แทนชื่อคอลัมน์ (Column Name) หรือชื่อตาราง (Table Name) ได้** เช่น

```javascript
// ❌ ผิดไวยากรณ์ SQLite ไม่ยอมรับ
db.prepare('SELECT * FROM requests ORDER BY ?').all(sortBy);
```

### การป้องกันด้วย Allowlist

หากจำเป็นต้องให้ผู้ใช้เลือกคอลัมน์ในการจัดเรียง (`ORDER BY`) ให้ใช้เทคนิค **Allowlist** ตรวจสอบค่าที่อนุญาตก่อนเสมอ

```javascript
const ALLOWED_COLUMNS = ['id', 'status', 'priority', 'created_at'];
const safeSortCol = ALLOWED_COLUMNS.includes(sortBy) ? sortBy : 'id';

// ปลอดภัยเพราะ safeSortCol ได้รับการตรวจสอบอย่างเข้มงวดแล้ว
db.prepare(`SELECT * FROM requests ORDER BY ${safeSortCol}`).all();
```

---

## 3. บันทึกผลการทดสอบเจาะระบบจริง (Security Testing Log)

ทดสอบขณะเปิดเซิร์ฟเวอร์ Express API ที่ `http://localhost:3001` โดยใช้ `curl.exe` จำลองการโจมตี 3 รูปแบบ

### 📊 สรุปภาพรวม

| # | รูปแบบการโจมตี | Payload | HTTP Status | Response | ผล |
|:-:|---|---|:-:|:-:|:-:|
| ① | Always True | `x' OR '1'='1` | 200 OK | `[]` | ✅ ป้องกันได้ |
| ② | Stacked Query / Drop Table | `'; DROP TABLE requests; --` | 200 OK | `[]` | ✅ ป้องกันได้ |
| ③ | Compound Query | `pending' OR status='completed` | 200 OK | `[]` | ✅ ป้องกันได้ |

---

### ① การทดสอบเงื่อนไขที่เป็นจริงเสมอ (Always True Attack)

> **เป้าหมายของผู้โจมตี:** ทำให้ตรรกะ SQL เป็นจริงเสมอเพื่อขโมยข้อมูลทั้งหมดในระบบ

**คำสั่งที่ใช้ทดสอบ**

```bash
curl.exe "http://localhost:3001/api/requests?status=x'%20OR%20'1'='1"
```

| รายการ | ค่า |
|---|---|
| Payload | `status=x' OR '1'='1` |
| HTTP Status Code | `200 OK` |
| Response Body | `[]` |

**Response**

```json
[]
```

**ผลการวิเคราะห์:** ระบบคืน Array ว่าง (`[]`) จำนวน 0 รายการ แสดงว่าค่า `x' OR '1'='1` ถูกค้นหาในฐานข้อมูลในฐานะข้อความเฉพาะค่าหนึ่งเท่านั้น และไม่มีแถวใดในตารางที่มีสถานะชื่อนี้จริง ตรรกะ `OR '1'='1'` **ไม่ได้ถูกนำไปประเมินผล**

---

### ② การทดสอบคำสั่งซ้อนเพื่อทำลายฐานข้อมูล (Stacked Query / Drop Table Attack)

> **เป้าหมายของผู้โจมตี:** ยุติคำสั่งเดิมด้วยเครื่องหมาย `;` แล้วสั่งลบตารางคำร้องทิ้ง

**คำสั่งที่ใช้ทดสอบ**

```bash
curl.exe "http://localhost:3001/api/requests?status='%3B%20DROP%20TABLE%20requests%3B%20--"
```

| รายการ | ค่า |
|---|---|
| Payload | `status='; DROP TABLE requests; --` |
| HTTP Status Code | `200 OK` |
| Response Body | `[]` |

**Response**

```json
[]
```

#### 🔍 การพิสูจน์ความสมบูรณ์ของฐานข้อมูล (Verifying Table Integrity)

ยิงเรียกดูรายการปกติทันทีหลังการโจมตี

```bash
curl.exe "http://localhost:3001/api/requests"
```

**ผลลัพธ์ที่ได้**

```json
[
  {
    "id": "REQ-001",
    "requesterName": "สมชาย ใจดี",
    "requestType": "แจ้งซ่อม",
    "location": "อาคารเรียนรวม",
    "details": "คอมพิวเตอร์ไม่ทำงาน",
    "priority": "urgent",
    "status": "in-progress"
  },
  ...
]
```

**ผลการวิเคราะห์:** ตาราง `requests` ยังอยู่ครบถ้วน ข้อมูลไม่สูญหาย คำสั่ง `DROP TABLE` ถูกมองเป็นเพียงข้อความค้นหา ไม่มีการประมวลผลคำสั่งอันตรายใด ๆ

---

### ③ การทดสอบเพิ่มเงื่อนไขซ้อน (Compound Query Attack)

> **เป้าหมายของผู้โจมตี:** แทรกเงื่อนไข OR เพื่อดึงสถานะอื่นที่ไม่มีสิทธิ์เข้าถึง

**คำสั่งที่ใช้ทดสอบ**

```bash
curl.exe "http://localhost:3001/api/requests?status=pending'%20OR%20status='completed"
```

| รายการ | ค่า |
|---|---|
| Payload | `status=pending' OR status='completed` |
| HTTP Status Code | `200 OK` |
| Response Body | `[]` |

**Response**

```json
[]
```

**ผลการวิเคราะห์:** ระบบตอบกลับเป็น Array ว่าง `[]` เช่นกัน ผู้โจมตีไม่สามารถ Bypass ตรรกะการกรองข้อมูลได้

---

## 4. Automated Test Verification

นอกเหนือจากการทดสอบด้วย `curl` แล้ว ชุดทดสอบอัตโนมัติ
[`api.test.js`](labs/week-10/source/api/tests/api.test.js) ยังมี Test Case สำหรับ SQL Injection ไว้ด้วย

```javascript
test('SQL injection ผ่าน ?status= ไม่หลุด', async () => {
    const evil = encodeURIComponent("x' OR '1'='1");
    const r = await request(app).get(`/api/requests?status=${evil}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 0);
  });

```

**ผลการรันคำสั่ง `npm test`**

```text
GET /api/requests 200 4.197 ms - 2567
▶ GET /api/requests
  ✔ คืน array พร้อม 200 (27.865466ms)
GET /api/requests 200 0.566 ms - 2567
  ✔ คืน requesterName ไม่ใช่ requester_id (4.420681ms)
POST /api/requests 201 34.868 ms - 210
  ✔ POST ถูกต้อง → 201 (39.955372ms)
POST /api/requests 400 0.665 ms - 406
  ✔ POST ไม่ครบ → 400 (13.300765ms)
GET /api/requests/REQ-001 200 0.643 ms - 325
GET /api/requests/REQ-999 404 0.450 ms - 65
  ✔ GET /:id พบ → 200 · ไม่พบ → 404 (6.959096ms)
GET /api/requests?status=x%27%20OR%20%271%27%3D%271 200 0.461 ms - 2
  ✔ SQL injection ผ่าน ?status= ไม่หลุด (3.11994ms)
✔ GET /api/requests (96.72692ms)

ℹ tests 6
ℹ suites 1
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 433.854068
```

---

## 5. สรุปผลการตรวจสอบความปลอดภัย

| รายการตรวจสอบ | สถานะ | หมายเหตุ |
|---|:-:|---|
| ทุก Query ที่รับค่าจากผู้ใช้ใช้ Parameterized Query (`?`) | ✅ ผ่าน | ใน [`requestService.js`](labs/week-10/source/api/src/services/requestService.js) ไม่มีการนำค่ามาต่อสตริง SQL |
| ยิงทดสอบครบทั้ง 3 แบบได้ผลลัพธ์เป็น 0 รายการ | ✅ ผ่าน | คืนค่า `[]` (200 OK) ทุกกรณี |
| ตาราง `requests` ยังอยู่ครบถ้วนหลังการโจมตี DROP | ✅ ผ่าน | ข้อมูลไม่ได้รับความเสียหาย |
| Automated Test Suite ครอบคลุมการโจมตี | ✅ ผ่าน | รันผ่าน 100% ทุกครั้ง |

> ✅ **สรุป:** ระบบปลอดภัยจาก SQL Injection ทั้ง 3 รูปแบบที่ทดสอบ ด้วยการใช้ Parameterized Queries ร่วมกับ Allowlist สำหรับส่วนที่ไม่สามารถใช้ `?` ได้
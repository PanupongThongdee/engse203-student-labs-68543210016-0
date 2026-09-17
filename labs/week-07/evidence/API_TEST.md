# รายงานผลการทดสอบระบบ API (API Test Report)

**โปรเจกต์:** Campus API (Week 07)
**คำสั่งที่ใช้รันการทดสอบ:** `npm run test`
**เครื่องมือทดสอบ:** Node.js Native Test Runner (`node --test`) & Supertest

---

## 📊 สรุปผลการทดสอบ (Test Summary)

* **รวมเคสทั้งหมด:** 6 เคส
* **ผ่าน (Pass):** 6 ✅
* **ไม่ผ่าน (Fail):** 0 ❌
* **เวลาที่ใช้ทั้งหมด:** 431.171 ms
* **สถานะ:** **พร้อมใช้งาน (All Tests Passed)** 

---

## 📝 รายละเอียดเทสต์เคส (Test Cases)

| # | HTTP Method | Endpoint | รายละเอียดการทดสอบ (Description) | Status Code ที่คาดหวัง | ผลลัพธ์ |
|---|-------------|----------|----------------------------------|------------------------|---------|
| 1 | `GET` | `/api/requests` | คืนรายการทั้งหมดและตรวจสอบว่าข้อมูลเป็น Array | `200 OK` | ✅ ผ่าน |
| 2 | `GET` | `/api/requests/:id` | คืนข้อมูลคำร้องที่ระบุได้อย่างถูกต้อง (กรณีมีข้อมูล) | `200 OK` | ✅ ผ่าน |
| 3 | `GET` | `/api/requests/:id` | ค้นหาข้อมูลคำร้องที่ไม่มีในระบบ | `404 Not Found` | ✅ ผ่าน |
| 4 | `POST` | `/api/requests` | ส่งข้อมูลครบถ้วน ถูกต้อง และตรวจสอบสถานะเริ่มต้น (pending) | `201 Created` | ✅ ผ่าน |
| 5 | `POST` | `/api/requests` | ส่งข้อมูลไม่ครบถ้วนเพื่อทดสอบระบบ Validation | `400 Bad Request` | ✅ ผ่าน |
| 6 | `GET` | `/api/requests` | ตรวจสอบการอนุญาต CORS header (`Access-Control-Allow-Origin`) | `200 OK` | ✅ ผ่าน |

---

## 💻 บันทึกการรันคำสั่ง (Execution Log)

```text
> engse203-week06-campus-api@2.0.0 test
> node --test "tests/*.test.js"

GET /api/requests 200 2.732 ms - 1030
✔ 1. GET /api/requests คืนค่าสถานะ 200 และเป็นอาเรย์ของข้อมูล (30.549161ms)
GET /api/requests 200 0.654 ms - 1030
GET /api/requests/REQ-001 200 0.996 ms - 321
✔ 2. GET /api/requests/:id เมื่อพบข้อมูล คืนค่าสถานะ 200 (12.456801ms)
GET /api/requests/999999-not-found 404 0.372 ms - 74
✔ 3. GET /api/requests/:id เมื่อไม่พบข้อมูล คืนค่าสถานะ 404 (6.654506ms)
POST /api/requests 201 12.473 ms - 258
✔ 4. POST /api/requests ข้อมูลถูกต้อง คืนค่าสถานะ 201 และมีสถานะเป็น pending (17.091273ms)
POST /api/requests 400 0.749 ms - 406
✔ 5. POST /api/requests ข้อมูลไม่ครบ คืนค่าสถานะ 400 (3.746718ms)
GET /api/requests 200 0.548 ms - 1289
✔ 6. CORS header ตอบ Access-Control-Allow-Origin กลับมาถูกต้อง (3.860573ms)
▶ GET /api/requests
  ✔ คืนรายการทั้งหมด พร้อม status 200 (0.261031ms)
✔ GET /api/requests (0.664257ms)
ℹ tests 7
ℹ suites 1
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 433.51529
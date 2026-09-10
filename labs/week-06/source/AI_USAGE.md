# AI_USAGE — LAB 06

บันทึกการใช้ AI ระหว่างทำงาน · **ใช้ AI ได้ แต่ต้องเป็นเจ้าของโค้ดที่ส่ง**

> ผู้สอนจะสุ่มถามจากโค้ดที่ส่ง — ถ้าอธิบายไม่ได้ คะแนนส่วนนั้นจะถูกทบทวน

---

## ครั้งที่ 1

**ถามอะไร**
เกิดบั๊กอะไรใน function deleteRequest พร้อมส่งโค้ดในส่วนfunction deleteRequest และ ใน function requestCount  

**AI ตอบว่าอย่างไร (สรุปสั้น)**
ผลปรากฎว่า  ใน function requestCount มีการใส่ Middleware Functions สลับกัน ของ router.put  และ router.Delete


**ใช้ส่วนไหน / แก้เองตรงไหน**
ทำให้ function deleteRequest สมบูรณ์ใช้งานได้

**เข้าใจโค้ดที่ได้มาไหม** ☐ เข้าใจทั้งหมด ☐ เข้าใจบางส่วน [x] ยังไม่เข้าใจ

---

## ครั้งที่ 2

**ถามอะไร** -วิธีเขียนฟังก์ชัน errorHandler (500) และ notFound (404)

- วิธีแก้ Error 500 จากการส่ง PUT /api/requests/:id สำหรับการเปลี่ยนสถานะคำร้อง


- วิธีเขียนโค้ดและเชื่อมต่อฟังก์ชัน updateRequestStatus (Controller) กับ updateStatus (Service)

**AI ตอบว่าอย่างไร (สรุปสั้น)** 
- แนะนำโค้ดจัดการ Error แบบตรรกะศูนย์กลาง และระบุ req.originalUrl สำหรับ Route ที่หาไม่เจอ (404)

- ตรวจสอบสาเหตุ Error 500 ว่ามาจาก Validation ค่า status ไม่ถูกต้องและการส่งค่า null เมื่อไม่เจอ ID


- ให้โค้ดการอัปเดตสถานะในชั้น Service ที่ส่งคืนสำเนา Object ({ ...request }) และตัวอย่าง Controller ที่ตรวจสอบ status ที่รองรับ (pending, in-progress, completed) พร้อมคืนค่า HTTP Status 400, 404, 200

**ใช้ส่วนไหน / แก้เองตรงไหน**
- โครงสร้างหลักของ errorHandler, notFound, และตรรกะการตรวจสอบ Validation ค่า status ใน updateRequestStatus และ updateStatus

**เข้าใจโค้ดที่ได้มาไหม** ☐ เข้าใจทั้งหมด ☐ เข้าใจบางส่วน [x] ยังไม่เข้าใจ

---

## สรุป

- ส่วนที่เขียนเองทั้งหมด: การเรียกใช้ Middleware app.use() ปิดท้ายโปรเจกต์ ทดสอบ API

- ส่วนที่ AI ช่วย:
ตรรกะ Validation เงื่อนไขของ PUT /api/requests/:id, โครงสร้างฟังก์ชัน Middleware จัดการ Error/NotFound และการวิเคราะห์แก้ไขปัญหา Response status 500

- ส่วนที่ยังไม่มั่นใจ: ไม่ค่อยเข้าใจในส่วนของ Syntax โค้ดเท่าไหร่ *แต่จะไปศึกษาเพิ่มเติม

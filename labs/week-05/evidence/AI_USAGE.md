## AI / Resource Usage

| Tool / Resource | Purpose | Used portion | How I verified | My final decision |
|---|---|---|---|---|
| ChatGPT / Gemini | ช่วยวิเคราะห์และแก้ไขปัญหาการ Build Vite, การทำ Router/State Management และการจัดโครงสร้างไฟล์ในโปรเจกต์ React | โค้ดส่วนแก้ไข `lab-metadata.json`, คำสั่ง Git และโครงสร้างโฟลเดอร์ `source/` | Source review และรัน `npm run verify:lab -- week-05` ผ่านเครื่องตนเอง | นำมาปรับใช้ แก้ไขโครงสร้างไฟล์ และอัปเดตไฟล์ Metadata ตามข้อกำหนดของรายวิชา |

### คำรับรอง

- [x] ไม่ส่ง token, password, secret หรือข้อมูลส่วนบุคคลจริงให้เครื่องมือ
- [x] ตรวจ source และรัน test ด้วยตนเอง
- [x] อธิบาย Route, Effect, Service Layer และ persistence ของ final code ได้
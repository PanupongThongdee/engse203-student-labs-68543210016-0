-- ═══════════════════════════════════════════════════════════
-- queries.sql — คำสั่งค้นหาตอบโจทย์
-- 🏠 TODO W09-QUERY (CP22) · เขียนอย่างน้อย 8 ข้อ
--
-- เขียนคำสั่งจริงที่รันได้ ไม่ใช่เขียนบรรยาย
-- ทุกข้อต้องทดสอบแล้วว่าได้ผลลัพธ์ถูกต้อง
-- ═══════════════════════════════════════════════════════════

-- ① คำร้องทั้งหมด เรียงตามรหัส

SELECT * FROM requests ORDER BY id;

-- ② คำร้องที่ยังไม่ได้ดำเนินการ (status = 'pending')

SELECT * FROM requests WHERE status = 'pending';

-- ③ คำร้องเร่งด่วนที่ยังไม่เสร็จ — ใช้เงื่อนไข 2 ข้อพร้อมกัน
SELECT * FROM requests WHERE status != 'in_progress' AND priority = 'urgent';

-- ④ ค้นคำร้องจากคำบางส่วนในรายละเอียด  (คำใบ้: LIKE)
SELECT * FROM requests WHERE description LIKE '%แจ้งซ่อม%';

-- ⑤ คำร้องพร้อมชื่อผู้แจ้ง  ← ต้องใช้ JOIN เพราะชื่ออยู่คนละตาราง
SELECT r.id, u.name
FROM requests r
JOIN users u ON u.id = r.requester_id;
-- ⑥ คำร้องเฉพาะของภาควิชาหนึ่ง  (JOIN + WHERE)

SELECT r.id, u.name, u.department
FROM requests r
JOIN users u ON r.requester_id = u.id
WHERE u.department = 'ภาควิชาคอมพิวเตอร์';

-- ⑦ รายชื่อผู้แจ้งที่ไม่ซ้ำกัน  (คำใบ้: DISTINCT)
SELECT DISTINCT u.name
FROM requests r
JOIN users u ON r.requester_id = u.id;

-- ⑧ คำร้อง 3 รายการล่าสุด  (คำใบ้: ORDER BY + LIMIT)

SELECT * FROM requests ORDER BY id DESC LIMIT 3;

-- ⭐ Challenge ─────────────────────────────────────────────
-- ⑨ นับจำนวนคำร้องแยกตามสถานะ  (GROUP BY + COUNT)
-- ⑩ ใครแจ้งคำร้องมากที่สุด  (คำใบ้: LEFT JOIN เพื่อให้คนที่ยังไม่เคยแจ้งติดมาด้วย)
-- ⑪ สร้าง INDEX ให้การค้นด้วย status เร็วขึ้น

CREATE INDEX idx_requests_status ON requests(status);
SELECT status, COUNT(*) AS count
FROM requests
GROUP BY status;

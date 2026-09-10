import * as service from '../services/requestService.js';
import { updateStatus } from '../services/requestService.js'; // ปรับ path ตามโครงสร้างไฟล์ของคุณ
/**
 * controller รู้จัก req/res และเป็นคนตัดสิน status code
 * แต่ไม่จัดการข้อมูลเอง — ให้ service ทำ
 */

/**
 * TODO W06-C1 (CP02) · GET /api/requests
 * - อ่าน req.query.status (ถ้ามี) ส่งต่อให้ service.findAll()
 * - ตอบ 200 พร้อมรายการ
 */
export function listRequests(req, res) {
  const { status } = req.query;
  res.status(200).json(service.findAll({ status }));
}

/**
 * TODO W06-C2 (CP02) · GET /api/requests/:id
 * - อ่านรหัสจาก req.params.id
 * - ไม่พบ → 404 พร้อมข้อความ · พบ → 200 พร้อมข้อมูล
 */
export function getRequest(req, res) {
  const found = service.findById(req.params.id);
  if (!found) {
    return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
  }
  res.status(200).json(found);
}

/**
 * TODO W06-C3 (CP04) · POST /api/requests
 * - validateRequest middleware ตรวจ body มาให้แล้ว ตรงนี้เชื่อ req.body ได้เลย
 * - เรียก service.create() แล้วตอบ 201 พร้อมคำร้องที่สร้าง
 * ⚠ POST สำเร็จตอบ 201 ไม่ใช่ 200
 */
export async function createRequest(req, res, next) {
  try {
    const created = await service.create(req.body); // 👈 ใส่ await เพื่อดึงข้อมูลจริง
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}
/**
 * TODO W06-C4 (⭐ Challenge) · PUT /api/requests/:id
 * - status ที่รับได้: 'pending' | 'in-progress' | 'completed'
 * - status ไม่ถูกต้อง → 400 · ไม่พบคำร้อง → 404 · สำเร็จ → 200
 */
export async function updateRequestStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  // 1. ตรวจสอบ status ที่รับเข้ามา
  const validStatuses = ['pending', 'in-progress', 'completed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: 'Status must be pending, in-progress, or completed'
    });
  }

  // 2. เรียกใช้ฟังก์ชันจาก Service เพื่อทำการอัปเดตข้อมูล
  const updatedRequest = await updateStatus(id, status);

  // 3. หากไม่พบคำร้อง (Service คืนค่า null)
  if (!updatedRequest) {
    return res.status(404).json({
      error: 'Not found',
      message: `Request with id ${id} not found`
    });
  }

  // 4. สำเร็จ ส่งตอบกลับ status 200 พร้อมข้อมูล
  return res.status(200).json(updatedRequest); 
  
}

/**
 * TODO W06-C5 (CP05) · DELETE /api/requests/:id
 * - ไม่พบ → 404 · ลบสำเร็จ → 204 (ไม่มีข้อมูลส่งกลับ ใช้ res.status(204).end())
 */
export async function deleteRequest(req, res, next) {
  try {
    const deleted = await service.remove(req.params.id); // 👈 ใส่ await
    if (!deleted) {
      return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

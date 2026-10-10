import { Router } from 'express';
import * as authService from '../services/authService.js';
import { validateLoginInput } from '../validators/requestValidator.js';

const router = Router();

// เก็บจำนวนครั้งที่ login ผิด ต่อ email
const failedAttempts = new Map(); // email → count
const MAX_ATTEMPTS = 5;

/** ให้ checker เรียกเพื่อรีเซ็ตตัวนับ */
export function resetLoginLimiter() {
  failedAttempts.clear();
}

router.post('/login', (req, res) => {
  const errors = validateLoginInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', details: errors });
  }

  const email = String(req.body.email || '').toLowerCase().trim();

  // ถ้าผิดครบ 5 ครั้งแล้ว → 429 ทันที (ไม่ต้องเช็ครหัสผ่าน)
  const fails = failedAttempts.get(email) || 0;
  if (fails >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง' });
  }

  const result = authService.login(req.body.email, req.body.password);
  if (!result) {
    failedAttempts.set(email, fails + 1);
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  // login สำเร็จ → ล้างตัวนับของ email นี้
  failedAttempts.delete(email);
  res.status(200).json(result);
});

export default router;
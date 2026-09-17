import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadSeed } from '../src/services/requestService.js';

let app;
before(async () => {
  await loadSeed();
  app = createApp();
});

const validRequest = {
  requesterName: 'ทดสอบ ระบบ',
  requestType: 'แจ้งซ่อม',
  location: 'C3-401',
  details: 'รายละเอียดยาวพอสมควรจริง',
  priority: 'normal',
};

/**
 * TODO W07-TEST (🏠 CP16) · เขียน test อย่างน้อย 6 เคส
 *
 * ที่ต้องมี
 *   1. GET /api/requests            → 200 และได้ array
 *   2. GET /api/requests/:id พบ      → 200
 *   3. GET /api/requests/:id ไม่พบ   → 404
 *   4. POST ข้อมูลถูกต้อง            → 201 และ status เป็น pending
 *   5. POST ข้อมูลไม่ครบ             → 400
 *   6. CORS header ตอบ origin ที่อนุญาต
 *
 * รันด้วย: npm test
 * ตัวอย่างโครง (ลบคอมเมนต์นี้แล้วเขียนจริง)
 */
test('1. GET /api/requests คืนค่าสถานะ 200 และเป็นอาเรย์ของข้อมูล', async () => {
    const res = await request(app).get('/api/requests');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body), 'Response body ควรเป็น Array');
  });

  // 2. GET /api/requests/:id พบ → 200
  test('2. GET /api/requests/:id เมื่อพบข้อมูล คืนค่าสถานะ 200', async () => {
    // ดึงรายการแรกเพื่อเอา ID มาทดสอบ
    const listRes = await request(app).get('/api/requests');
    const firstItem = listRes.body[0];
    
    if (firstItem) {
      const res = await request(app).get(`/api/requests/${firstItem.id}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.id, firstItem.id);
    } else {
      assert.ok(true, 'ไม่มีข้อมูลในระบบ ข้ามการทดสอบนี้');
    }
  });

  // 3. GET /api/requests/:id ไม่พบ → 404
  test('3. GET /api/requests/:id เมื่อไม่พบข้อมูล คืนค่าสถานะ 404', async () => {
    const res = await request(app).get('/api/requests/999999-not-found');
    assert.equal(res.status, 404);
  });

  // 4. POST ข้อมูลถูกต้อง → 201 และ status เป็น pending
  test('4. POST /api/requests ข้อมูลถูกต้อง คืนค่าสถานะ 201 และมีสถานะเป็น pending', async () => {
    const res = await request(app)
      .post('/api/requests')
      .send(validRequest);
    
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'pending');
    assert.equal(res.body.requesterName, validRequest.requesterName);
  });

  // 5. POST ข้อมูลไม่ครบ → 400
  test('5. POST /api/requests ข้อมูลไม่ครบ คืนค่าสถานะ 400', async () => {
    const invalidData = { requesterName: 'ขาดข้อมูลอื่น' }; // ส่งข้อมูลมาไม่ครบตาม Schema
    const res = await request(app)
      .post('/api/requests')
      .send(invalidData);
    
    assert.equal(res.status, 400);
  });

  // 6. CORS header ตอบ origin ที่อนุญาต
  test('6. CORS header ตอบ Access-Control-Allow-Origin กลับมาถูกต้อง', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Origin', 'http://localhost:5173'); // จำลอง Origin ของ Frontend
    
    assert.equal(res.status, 200);
    // ตรวจสอบว่ามี Header ตอบกลับ CORS หรือไม่
    const allowOrigin = res.headers['access-control-allow-origin'];
    assert.ok(
      allowOrigin === 'http://localhost:5173' || allowOrigin === '*',
      'ควรมีการตั้งค่า Access-Control-Allow-Origin'
    );
  });

  
describe('GET /api/requests', () => {
  test('คืนรายการทั้งหมด พร้อม status 200', async () => {
    // const res = await request(app).get('/api/requests');
    // assert.equal(res.status, 200);
    assert.ok(true, 'ยังไม่ได้เขียน test — ดู TODO W07-TEST');
  });
});

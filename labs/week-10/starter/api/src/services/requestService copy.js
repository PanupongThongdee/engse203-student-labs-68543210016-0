import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "../config.js";
import { DatabaseSync } from "node:sqlite";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const API_ROOT = path.resolve(HERE, "../..");
//const DB_FILE = process.env.DB_FILE ?? path.join(API_ROOT, 'data', 'campus.db');
//const SCHEMA_FILE = path.join(API_ROOT, 'data', 'schema.sql');

const db = new DatabaseSync(config.dbFile);
db.exec("PRAGMA foreign_keys = ON");

/**
 * Week 10 — เปลี่ยน service จากอ่านไฟล์ JSON เป็นฐานข้อมูล SQLite
 *
 * ตอนนี้ยังเป็นเวอร์ชัน Week 07 (อ่านไฟล์ JSON) อยู่
 * งานของสัปดาห์นี้คือเปลี่ยนให้ใช้ node:sqlite
 *
 * ⚠ กฎเหล็ก: signature ของทุกฟังก์ชันต้องเหมือนเดิมทุกตัว
 *   → controller และ frontend จะได้ไม่ต้องแก้เลย
 */

// ── ของเดิม Week 07 (อ่านไฟล์ JSON) — จะถูกแทนที่ ──
//const HERE = path.dirname(fileURLToPath(import.meta.url));
//const DATA = path.resolve(HERE, '../..', 'data', 'requests.json');
//let requests = [];

export async function loadSeed() {
  /**
   * TODO W10-1 (CP26) · เปิดฐานข้อมูลด้วย node:sqlite
   *   import { DatabaseSync } from 'node:sqlite'
   *   - เปิดไฟล์ campus.db (จากสัปดาห์ที่ 9)
   *   - สั่ง PRAGMA foreign_keys = ON  ⚠ สำคัญมาก
   *   - ถ้ายังไม่มีตาราง ให้สร้างจาก schema.sql
   *
   * TODO W10-2 (CP27) · ⚠ path ต้องอ้างจากตำแหน่งไฟล์นี้ ไม่ใช่จากที่รันคำสั่ง
   *   ใช้ fileURLToPath(import.meta.url) — ไม่งั้น dev กับ checker หาไฟล์คนละที่
   */

  const ready = db.prepare(
      "SELECT COUNT(*) c FROM sqlite_master WHERE type='table' AND name='requests'",
    )
    .get().c;

  if (!ready) db.exec(readFileSync(config.schemaFile, "utf8"));
}


const SELECT_SHAPE = `
  SELECT r.id,
         u.name          AS requesterName,
         r.request_type  AS requestType,
         r.location,
         r.details,
         r.priority,
         r.status
  FROM requests r
  JOIN users u ON u.id = r.requester_id`;



export function findAll({ status } = {}) {

  return status
    ? db.prepare(`${SELECT_SHAPE} WHERE r.status = ? ORDER BY r.id`).all(status)
    : db.prepare(`${SELECT_SHAPE} ORDER BY r.id`).all();
}


/** แปลงชื่อผู้แจ้งเป็น id — ถ้ายังไม่มีในระบบก็สร้างให้ */
function resolveUserId(name) {
  const found = db.prepare('SELECT id FROM users WHERE name = ?').get(name);
  if (found) return found.id;                  // มีแล้ว — ใช้ id เดิม

  const slug = Date.now().toString(36);
  return db.prepare('INSERT INTO users (name, department, email) VALUES (?, ?, ?)')
           .run(name, 'ไม่ระบุ', `user-${slug}@rmutl.ac.th`).lastInsertRowid;
}




export function findById(id) {
  /** TODO W10-4 (CP28) · SELECT ... WHERE r.id = ?  · ไม่พบให้คืน null */
  return db.prepare("SELECT * FROM requests WHERE id = ?").get(id) ?? null;
}



export function updateStatus(id, status) {
  const result = db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);
  return result.changes ? findById(id) : null;
}


function nextId() {
  const row = db.prepare(
    "SELECT id FROM requests WHERE id LIKE 'REQ-%' ORDER BY id DESC LIMIT 1"
  ).get();
  const n = row ? Number(String(row.id).replace('REQ-', '')) + 1 : 1;
  return `REQ-${String(n).padStart(3, '0')}`;
}

export function create(input) {
  const id = nextId();
  db.prepare(
    `INSERT INTO requests
       (id, requester_id, request_type, location, details, priority)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    resolveUserId(input.requesterName.trim()),
    input.requestType,
    input.location.trim(),
    input.details.trim(),
    input.priority ?? "normal",
  );
  return findById(id); // คืนรูปแบบที่ frontend ต้องการ
}



export function remove(id) {
  const target = findById(id); // ① หาก่อน
  if (!target) return null;
  db.prepare("DELETE FROM requests WHERE id=?").run(id);
  return target;
}

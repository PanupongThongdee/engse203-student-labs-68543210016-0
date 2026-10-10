const KEY = 'campus.auth';

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.token && data?.user ? data : null;
  } catch {
    return null;
  }
}

export function saveAuth({ token, user }) {
  try { localStorage.setItem(KEY, JSON.stringify({ token, user })); } catch { /* เก็บไม่ได้ก็ข้าม */ }
}

export function clearAuth() {
  try { localStorage.removeItem(KEY); } catch { /* ไม่ต้องทำอะไร */ }
}

export function getToken() {
  return loadAuth()?.token ?? null;
}
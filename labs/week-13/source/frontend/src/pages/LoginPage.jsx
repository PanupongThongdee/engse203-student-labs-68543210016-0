import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const { isStaff, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle');
  const [feedback, setFeedback] = useState('');

  if (isStaff) return <Navigate to={redirectTo} replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'กรุณากรอกอีเมล';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!form.password) next.password = 'กรุณากรอกรหัสผ่าน';
    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback('กรุณาตรวจข้อมูลที่ระบุ');
      return;
    }
    try {
      setSubmitState('submitting');
      setFeedback('กำลังเข้าสู่ระบบ…');
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setForm((current) => ({ ...current, password: '' }));
      setFeedback(error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitState('idle');
    }
  }

  const failed = feedback && submitState === 'idle' && !feedback.startsWith('กำลัง');

  return (
    <section data-testid="page-login">
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">STAFF ONLY</p>
          <h1>เข้าสู่ระบบเจ้าหน้าที่</h1>
          <p>เจ้าหน้าที่เท่านั้นที่เปลี่ยนสถานะหรือลบคำร้องได้ · ผู้ใช้ทั่วไปส่งคำร้องและดูรายการได้โดยไม่ต้องเข้าสู่ระบบ</p>
        </div>
      </div>
      <section className="panel form-panel login-panel">
        <form data-testid="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">อีเมล</label>
            <input id="email" name="email" type="email" autoComplete="username"
              value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} />
            <small className="error">{errors.email ?? ''}</small>
          </div>
          <div className="field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input id="password" name="password" type="password" autoComplete="current-password"
              value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} />
            <small className="error">{errors.password ?? ''}</small>
          </div>
          <button className="button primary" type="submit" disabled={submitState === 'submitting'}>
            {submitState === 'submitting' ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
          <p className={`status${failed ? ' login-error' : ''}`} role={failed ? 'alert' : 'status'}>{feedback}</p>
        </form>
      </section>
    </section>
  );
}

export default LoginPage;
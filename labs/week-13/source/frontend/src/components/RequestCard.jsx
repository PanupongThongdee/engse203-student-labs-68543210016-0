import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = ['pending', 'in-progress', 'completed'];

function RequestCard({ request, onDeleteRequest, onChangeStatus }) {
  const { isStaff } = useAuth();

  return (
    <article className="request-card">
      <div>
        <p className="request-id">{request.id}</p>
        <h3><Link to={`/requests/${request.id}`}>{request.requestType}</Link></h3>
        <p>{request.location}</p>
        <p>{request.details}</p>
        <p><span className={`badge ${request.status}`}>{request.status}</span> · {request.priority}</p>
      </div>

      {isStaff && (
        <div className="staff-actions">
          <label className="status-select">
            <span>สถานะ</span>
            <select
              value={request.status}
              onChange={(e) => onChangeStatus(request.id, e.target.value)}
              aria-label={`เปลี่ยนสถานะคำร้อง ${request.id}`}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button
            className="button danger"
            type="button"
            onClick={() => onDeleteRequest(request.id)}
            aria-label={`ลบคำร้อง ${request.id}`}
          >
            ลบ
          </button>
        </div>
      )}
    </article>
  );
}

export default RequestCard;
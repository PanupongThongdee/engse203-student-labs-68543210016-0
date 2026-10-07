import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'in-progress', label: 'กำลังดำเนินการ' },
  { value: 'completed', label: 'เสร็จสิ้น' },
];

function RequestCard({ request, onDeleteRequest, onStatusChange }) {
  return (
    <article className="request-card">
      <div>
        <p className="request-id">{request.id}</p>
        <h3><Link to={`/requests/${request.id}`}>{request.requestType}</Link></h3>
        <p>{request.location}</p>
        <p>{request.details}</p>
        <p><span className={`badge ${request.status}`}>{request.status}</span> · {request.priority}</p>
        <label>
          เปลี่ยนสถานะ:{' '}
          <select
            value={request.status}
            onChange={(e) => onStatusChange(request.id, e.target.value)}
            aria-label={`เปลี่ยนสถานะคำร้อง ${request.id}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="button danger" type="button" onClick={() => onDeleteRequest(request.id)} aria-label={`ลบคำร้อง ${request.id}`}>
        ลบ
      </button>
    </article>
  );
}

export default RequestCard;
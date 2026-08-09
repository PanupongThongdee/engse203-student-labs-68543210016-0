import RequestCard from './RequestCard.jsx';

function RequestList({ requests, onDeleteRequest }) {
  // LAB4-R11: empty state เมื่อไม่มีคำร้องตรงกับตัวกรองปัจจุบัน
  if (requests.length === 0) {
    return (
      <div className="empty-state" role="status">
        ไม่มีคำร้องในสถานะนี้ ลองเลือกตัวกรองอื่นหรือเพิ่มคำร้องใหม่
      </div>
    );
  }

  // LAB4-R09: ใช้ map() พร้อม request.id เป็น key ที่เสถียร
  return (
    <div className="request-list">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </div>
  );
}

export default RequestList;

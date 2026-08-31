function PriorityBadge({ priority }) {
  if (priority === 'urgent') {
    return <span className="priority-urgent">เร่งด่วน</span>;
  }

  if (priority === 'normal') {
    return <span className="priority-normal">ปกติ</span>;
  }

  // CP-B4.2: ค่าอื่น หรือ undefined/null ให้แสดง "ไม่ระบุ"
  return <span className="priority-unknown">ไม่ระบุ</span>;
}

export default PriorityBadge;
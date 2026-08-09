import { useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import SummaryPanel from './components/SummaryPanel.jsx';
import RequestForm from './components/RequestForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import RequestList from './components/RequestList.jsx';
import { initialRequests } from './data/initialRequests.js';

function App() {
  // LAB4-R04: requests/statusFilter เป็น state ของ App (single source of truth)
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState('all');

  // LAB4-R04: summary เป็น derived data คำนวณจาก requests จริงทุกครั้งที่ render
  const summary = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    inProgress: requests.filter((request) => request.status === 'in-progress').length,
    completed: requests.filter((request) => request.status === 'completed').length,
  };

  // LAB4-R08: filteredRequests คำนวณจาก requests + statusFilter (ไม่ mutate requests เดิม)
  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  // LAB4-R07 / LAB4-R13: เพิ่ม request ใหม่แบบ immutable ด้วย spread, ไม่แก้ array/object เดิม
 function handleAddRequest(requestData) {
  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-3)}`, // แปลงเป็น String แล้วตัดเอาเฉพาะ 4 หลักสุดท้าย
    ...requestData,
    status: 'pending',
  };
  setRequests((currentRequests) => [newRequest, ...currentRequests]);
}

  // LAB4-R10: รับ id ผ่าน callback จาก child แล้วลบด้วย filter() แบบ immutable
  function handleDeleteRequest(requestId) {
    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== requestId),
    );
  }

  return (
    <>
      <AppHeader
        title="Campus Service Request"
        subtitle="LAB 4 — State-driven React UI สำหรับคำร้องบริการภายในมหาวิทยาลัย"
      />
      <main className="container page-content">
        <SummaryPanel summary={summary} />
        <div className="workspace-grid">
          <RequestForm onAddRequest={handleAddRequest} />
          <section className="panel" aria-labelledby="request-list-title">
            <div className="section-heading">
              <h2 id="request-list-title">รายการคำร้อง</h2>
              <FilterBar value={statusFilter} onFilterChange={setStatusFilter} />
            </div>
            <RequestList
              requests={filteredRequests}
              onDeleteRequest={handleDeleteRequest}
            />
          </section>
        </div>
      </main>
    </>
  );
}

export default App;

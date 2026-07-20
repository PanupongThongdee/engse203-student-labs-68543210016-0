import './style.css';
// TODO 1: query preview/status/list elements

const form = document.querySelector('#profile-form');
const status = document.querySelector('#form-status');
const goalCount = document.querySelector('#goal-count');


const preview = {
    displayName: document.querySelector('#preview-name'),
    learningRole: document.querySelector('#preview-type'), // แก้เป็น #preview-type
    learningGoal: document.querySelector('#preview-details'), // แก้เป็น #preview-details
};



function readForm() {
   // TODO 2: readForm()
    return Object.fromEntries(new FormData(form).entries());

}

function renderPreview(data) {
    // TODO 3: renderPreview(data)

    const name = (data.displayName || '').trim();
    const role = data.learningRole || '';
    const goal = (data.learningGoal || '').trim();

    preview.displayName.textContent = name || 'ยังไม่ระบุชื่อ';
    preview.learningRole.textContent = role || 'ยังไม่เลือกประเภท'; // หรือ 'ยังไม่เลือกบทบาท'
    preview.learningGoal.textContent = goal || 'ยังไม่มีรายละเอียด'; // หรือ 'ยังไม่มีเป้าหมายการเรียนรู้'
    
    goalCount.textContent = `${goal.length} ตัวอักษร`;
}

// TODO 4: validate(data)
function validate(data) {
    // TODO 7: ตรวจชื่อ >= 2, role ต้องเลือก, goal >= 10
    const errors = {};

    if (data.displayName.trim().length < 2) {
        errors.displayName = 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
    }

    if (!data.learningRole) {
        errors.learningRole = 'กรุณาเลือกบทบาทที่สนใจ';
    }

    if (data.learningGoal.trim().length < 10) {
        errors.learningGoal = 'กรุณาเขียนเป้าหมายอย่างน้อย 10 ตัวอักษร';
    }

    return errors;
}

// TODO 5: renderErrors(errors)
function renderErrors(errors) {
    // TODO 8: แสดง error ใกล้ field และกำหนด aria-invalid
    for (const name of ['displayName', 'learningRole', 'learningGoal']) {
        const field = form.elements[name];
        const output = document.querySelector(`#${name}-error`);
        const message = errors[name] ?? '';

        output.textContent = message;
        field.setAttribute('aria-invalid', String(Boolean(message)));
    }
}

// TODO 6: input and submit listeners
form.addEventListener('input', () => {
    const data = readForm();
    renderPreview(data);
});


form.addEventListener('submit', (event) => {
    event.preventDefault();
    

    const data = readForm();
    const errors = validate(data);
    renderErrors(errors);

    if (Object.keys(errors).length > 0) {
        renderStatus('invalid', 'ยังบันทึกไม่ได้ กรุณาตรวจสอบข้อมูล');
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
    }

    renderStatus('success', `พร้อมแล้ว ${data.displayName}! ข้อมูลผ่านการตรวจสอบ`);

});

function renderStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
}




renderPreview(readForm());
renderStatus('idle', 'เริ่มพิมพ์เพื่อทดลอง Event และ Live Preview');

console.log('LAB 3 starter ready', form);


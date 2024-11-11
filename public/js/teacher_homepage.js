const data_id = 1;

function toggleDetails(card) {
    const details = card.querySelector(".details");
    details.style.display = details.style.display === "none" ? "block" : "none";
}

// Generate cards from data
function generateCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = ''; // Clear existing content
    // console.log(data.length);
    if (data.length === 0) {
        const card = document.createElement('div');
        card.className = 'card2 mt-5';
        card.innerHTML = '<h2>ไม่มีคำขอร้อง</h2>';
    }
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card2 mt-5';
        card.onclick = () => toggleDetails(card);
        card.innerHTML = `
            <div class="p-4">
                <h2>${item.student}</h2>
                <h3>${item.dayofweek} ${new Date(item.date).toLocaleDateString()} ${item.start_time} - ${item.end_time}</h3>
                <p>Click for more details</p>
                <div class="details" style="display: none;">
                    <p>Detail: ${item.detail}</p>
                </div>
                <button class="btn btn-success" onclick="approveRequest(event, ${item.semester_id}, ${item.timeslots_id})">Approve</button>
                <button class="btn btn-danger" onclick="rejectRequest(event, ${item.semester_id}, ${item.timeslots_id})">Reject</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function fetchData() {
    try {
        const response = await fetch(`http://localhost:3001/api/booking/${data_id}/Waiting`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
   
        generateCards(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function editStatus(status, semester_id, timeslots,detail) {
    try {
        // console.log(semester_id, timeslots);
        // console.log('detail',detail);
        const response = await fetch('http://localhost:3001/api/booking/changestatus', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data_id,
                semester_id,
                timeslots,
                status,
                'feedback':detail
            })
        });
        if (!response.ok) throw new Error("Failed to update status");
        const result = await response.json();
        console.log(result.message);
        fetchData(); // Refresh the data after updating status
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

let currentSemesterId;
let currentTimeslotsId;

function approveRequest(event, semester_id, timeslots_id) {
    event.stopPropagation();
    currentSemesterId = semester_id;
    currentTimeslotsId = timeslots_id;
    const approvalModal = new bootstrap.Modal(document.getElementById('approvalModal'));
    approvalModal.show();
}

function rejectRequest(event, semester_id, timeslots_id) {
    event.stopPropagation();
    currentSemesterId = semester_id;
    currentTimeslotsId = timeslots_id;
    const rejectionModal = new bootstrap.Modal(document.getElementById('rejectionModal'));
    rejectionModal.show();
}

function confirmApprove() {
    const approvalComment = document.getElementById('approvalComment').value;
    editStatus("Approved", currentSemesterId, currentTimeslotsId,approvalComment);
    currentSemesterId=null;
    const approvalModal = bootstrap.Modal.getInstance(document.getElementById('approvalModal'));
    approvalModal.hide();
    clearApprovalComment();
}

function confirmReject() {
    const approvalComment = document.getElementById('rejectionReason').value;
    // console.log('detail1',approvalComment);
    editStatus("Reject", currentSemesterId, currentTimeslotsId,approvalComment);
    currentTimeslotsId=null;
    const rejectionModal = bootstrap.Modal.getInstance(document.getElementById('rejectionModal'));
    rejectionModal.hide();
    clearApprovalComment();
}

function clearApprovalComment() {
    document.getElementById('approvalComment').value = '';
}

function clearRejectionReason() {
    document.getElementById('rejectionReason').value = '';
}

function logout() {
    fetch('/logout', { method: 'POST' })
        .then(() => window.location.href = '/login')
        .catch(error => console.error('Error logging out:', error));
}

document.addEventListener('DOMContentLoaded', fetchData);

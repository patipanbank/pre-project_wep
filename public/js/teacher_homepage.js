function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}
const user_id = getCookie("user_id");
function toggleDetails(card, item) {

    Swal.fire({
        title: `<strong>Appointment Details</strong>`,
        html: `
          <div style="text-align: left;">
            <p><strong>Student Name:</strong> ${item.studentName}</p>
            <p><strong>Email:</strong> ${item.studentEmail}</p>
            <p><strong>Date:</strong> ${formatDate(item.date)}</p>
            <p><strong>Time:</strong> ${item.start_time} - ${item.end_time}</p>
            <p><strong>Student Details:</strong> ${item.detail}</p>
            <p><strong>Teacher Feedback:</strong> ${item.feedback}</p>
            </div>
            `,
        icon: 'info', // Use the icon based on the status
        confirmButtonText: "Close",
  });
}

// Format date helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Generate cards from data
function generateCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = ''; // Clear existing content

    if (data.length === 0) {
        const card = document.createElement('div');
        // card.className = 'card2 mt-5 p-4';
        card.innerHTML = `<div class="alert alert-info mt-5">No appointments found.</div>`;
        container.appendChild(card);
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card2 mt-5';
        // card.onclick = () => toggleDetails(card);
        card.innerHTML = `
            <div class="p-4">
                <h2>Student:${item.studentName}</h2>
                <p class="text-gray-600">Email: ${item.studentEmail}</p>
                <h3>${formatDate(item.date)} ${item.start_time} - ${item.end_time}</h3>
                <span class="more-details text-primary" style="cursor: pointer; display: inline-block;">Click for more details</span><br>
                <div class="mt-3">
                <button class="btn btn-success" onclick="approveRequest(event, ${item.semester_id}, ${item.timeslots_id})">Approve</button>
                <button class="btn btn-danger" onclick="rejectRequest(event, ${item.semester_id}, ${item.timeslots_id})">Reject</button>
            </div>
            </div>
        `;
        // เพิ่ม event listener ให้เฉพาะข้อความ "Click for more details"
    const detailsLink = card.querySelector(".more-details");
    detailsLink.onclick = () => toggleDetails(card, item);
        container.appendChild(card);
    }); 
}

async function fetchData() {
    try {

        console.log(user_id);
        
        const response = await fetch(`http://localhost:3001/api/booking/userid/${user_id}/Waiting`);
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
        const response = await fetch('http://localhost:3001/api/booking/changestatus/userid', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userid: user_id,
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

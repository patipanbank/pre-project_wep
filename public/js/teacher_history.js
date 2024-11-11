function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}
const user_id = getCookie("user_id");
function toggleDetails(card) {
    var details = card.querySelector(".details");
    if (details.style.display === "none") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

function logout() {
    fetch('/logout', { method: 'POST' }) // Adjust the logout endpoint as needed
        .then(() => {
            window.location.href = '/login'; // Redirect to login after logout
        })
        .catch(error => console.error('Error logging out:', error));
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
    console.log(data.length);
    if (data.length === 0) {
        const card = document.createElement('div');
        card.className = 'card2 mt-5 p-4';
        card.innerHTML = '<h2 >ไม่มีประวัติการยืนยันหรือปฏิเสธคำข้อร้องใด ๆ</h2>';
        container.appendChild(card);
    }
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card2 mt-5';
        card.onclick = () => toggleDetails(card);
        // console.log(item.status);
        card.innerHTML = `
            <div class="p-4">
                <h2>Student: ${item.studentName}</h2>
                <p class="text-gray-600">Email: ${item.studentEmail}</p>
                <h3>${formatDate(item.date)} ${item.start_time} - ${item.end_time}</h3>
                <p>Click for more details</p>
                <div class="details" style="display: none;">
                    <p>Student Detail: ${item.detail}</p>
                    <p>Teacher Feedback: ${item.feedback}</p>
                </div>
                <div>
                <span class="badge ${item.status === 'Approved' ? 'bg-success' : 'bg-danger'}  " style="color: rgb(255, 255, 255);">${item.status}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function fetchData() {
    try {
        const response = await fetch(`http://localhost:3001/api/booking/status/userid/${user_id}/Waiting`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        generateCards(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
document.addEventListener('DOMContentLoaded', fetchData);
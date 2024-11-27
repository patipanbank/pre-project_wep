function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
const user_id = getCookie("user_id");

function toggleDetails(card, item) {
  let icon = "question"; // Default icon for info
  if (item.status === "Approved") {
    icon = "success"; // ไอคอนสีเขียวสำหรับ Approved
  } else if (item.status === "Reject") {
    icon = "error"; // ไอคอนสีแดงสำหรับ Reject
  } else if (item.status === "waiting") {
    icon = "warning"; // ไอคอนนาฬิกาสำหรับ Waiting
  } else if (item.status === "Leave") {
    icon = "info"; // ไอคอนคำถามสำหรับ Leave
  }

  let badgeClass = "";
  if (item.status === "Approved") {
    badgeClass = "bg-success";
  } else if (item.status === "Leave") {
    badgeClass = "bg-secondary";
  } else if (item.status === "Reject") {
    badgeClass = "bg-danger";
  } else {
    badgeClass = "bg-warning";
  }

  Swal.fire({
    title: `<strong>Appointment Details</strong>`,
    html: `
          <div style="text-align: left;">
            <p><strong>Student Name:</strong> ${item.studentName}</p>
            <p><strong>Email:</strong> ${item.studentEmail}</p>
            <p><strong>Status:</strong> ${item.status}</p>
            <p><strong>Date:</strong> ${formatDate(item.date)}</p>
            <p><strong>Time:</strong> ${item.start_time} - ${item.end_time}</p>
            <p><strong>Student Details:</strong> ${item.detail}</p>
            <p><strong>Teacher Feedback:</strong> ${item.feedback}</p>
            <p class = " status-badge-sweet ${badgeClass}"><strong>Status:</strong> ${
      item.status
    }</p>
          </div>
        `,
    icon: icon, // Use the icon based on the status
    confirmButtonText: "Close",
  });
}

function logout() {
  fetch("/logout", { method: "POST" }) // Adjust the logout endpoint as needed
    .then(() => {
      window.location.href = "/login"; // Redirect to login after logout
    })
    .catch((error) => console.error("Error logging out:", error));
}

// Format date helper function
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
// Generate cards from data
function generateCards(data) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = ""; // Clear existing content
  console.log(data.length);
  if (data.length === 0) {
    const card = document.createElement("div");
    // card.className = "card2";
    card.innerHTML = `<div class="alert alert-info mt-5">No history found.</div>`;
    container.appendChild(card);
  }
  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card2 mt-5";
    // card.onclick = () => toggleDetails(card, item);

    let badgeClass = "";
    if (item.status === "Approved") {
      badgeClass = "bg-success";
    } else if (item.status === "Leave") {
      badgeClass = "bg-secondary";
    } else {
      badgeClass = "bg-danger";
    }

    card.innerHTML = `
      <div>
          <span class="status-badge ${badgeClass}">${item.status}</span>
          <h2>Student: ${item.studentName}</h2>
          <p class="text-gray-600">Email: ${item.studentEmail}</p>
          <h3>${formatDate(item.date)} ${item.start_time} - ${
      item.end_time
    }</h3>
          <span class="more-details text-primary" style="cursor: pointer; display: inline-block;">Click for more details</span>
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
    const response = await fetch(
      `http://localhost:3001/api/booking/status/userid/${user_id}/Waiting`
    );
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    generateCards(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
document.addEventListener("DOMContentLoaded", fetchData);

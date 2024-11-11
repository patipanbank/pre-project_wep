// Function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
console.log("Cookie user_id:", getCookie("user_id"));

async function fetchUserData() {
  try {
    const userId = getCookie("user_id");
    console.log("Current user_id from cookie:", userId); // เพิ่ม logging

    if (!userId) {
      console.error("No user_id cookie found - redirecting to login");
      window.location.href = "/login";
      return;
    }

    const response = await fetch(`/api/user/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const userData = await response.json();
    console.log("Fetched user data:", userData); // เพิ่ม logging

    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = `${userData.name}`;
    } else {
      console.error("userName element not found in DOM");
    }
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    // อาจจะ redirect กลับไปหน้า login ถ้าเกิดข้อผิดพลาด
    window.location.href = "/login";
  }
}

// เรียกใช้ฟังก์ชันเมื่อหน้าเว็บโหลด
document.addEventListener("DOMContentLoaded", fetchUserData);

// loading image
$(document).ready(function () {
  // Existing code for fetching and displaying profile data
  const data_id = new URLSearchParams(window.location.search).get("data_id"); // Get data_id from URL
  // Fetch profile data for the given data_id
  fetch(`/data/images/${data_id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        $("#imgt").attr("src", data.image);
        $("#prof-name").text(data.name);
        $("#prof-email").text(data.email);
        $("#prof-major").text(data.major);
        $("#prof-tel").text(data.tel);
      }
    })
    .catch((error) => console.error("Error fetching profile data:", error));
});
let currentWeekDates = [];
document.addEventListener("DOMContentLoaded", function () {
  const data_id = new URLSearchParams(window.location.search).get("data_id"); // Get data_id from URL
  const currentYear = new Date().getFullYear();
  const dateInput = document.getElementById("multi-date-input");

  // Fetch all semesters
  fetch("/semester/all")
    .then((response) => response.json())
    .then((semesters) => {
      const semesterSelect = document.getElementById("semester-select");

      // Sort semesters by year and term to ensure proper order
      semesters.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        } else {
          return a.term - b.term;
        }
      });

      let defaultOptionSelected = false;

      semesters.forEach((semester) => {
        const option = document.createElement("option");
        option.value = semester.semester_id;
        option.textContent = `${semester.term}/${semester.year}`;
        semesterSelect.appendChild(option);

        // Set default option to Term 1 of the current year
        if (
          !defaultOptionSelected &&
          semester.term === "1" &&
          semester.year === currentYear
        ) {
          option.selected = true;
          defaultOptionSelected = true;

          // Set date range based on the selected semester's start and end date
          setDateInputRange(
            semester.start_date,
            semester.end_date,
            semester.semester_id
          );
        }
      });

      semesterSelect.addEventListener("change", function () {
        const selectedSemester = semesters.find(
          (semester) => semester.semester_id === parseInt(semesterSelect.value)
        );
        if (selectedSemester) {
          setDateInputRange(
            selectedSemester.start_date,
            selectedSemester.end_date,
            selectedSemester.semester_id
          );
        }
      });

      // If no Term 1 for current year is found, set the first semester as default
      if (!defaultOptionSelected && semesters.length > 0) {
        semesterSelect.options[0].selected = true;
        const firstSemester = semesters[0];
        setDateInputRange(
          firstSemester.start_date,
          firstSemester.end_date,
          firstSemester.semester_id
        );
      }
    })
    .catch((error) => console.error("Error fetching semesters:", error));

  // Function to initialize and set date input range with Flatpickr for multi-date selection
  function setDateInputRange(startDate, endDate, semester_id) {
    flatpickr(dateInput, {
      mode: "multiple",
      minDate: new Date(startDate).toISOString().split("T")[0],
      maxDate: new Date(endDate).toISOString().split("T")[0],
      dateFormat: "Y-m-d",
      disable: [
        function (date) {
          return date.getDay() === 6 || date.getDay() === 0; // Disable weekends
        },
      ],
      onChange: function (selectedDates, dateStr, instance) {
        // If user is clearing the selection
        if (selectedDates.length === 0) {
          currentWeekDates = [];
          return;
        }

        // Get the most recently selected date
        const selectedDate = new Date(selectedDates[selectedDates.length - 1]);

        // Calculate Monday of the selected week
        const monday = new Date(selectedDate);
        monday.setHours(0, 0, 0, 0);

        // Adjust to Monday (1) if not already
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        // Generate array of weekdays (Mon-Fri)
        const weekDays = [];
        for (let i = 0; i < 5; i++) {
          const currentDate = new Date(monday);
          currentDate.setDate(monday.getDate() + i);
          weekDays.push(currentDate);
        }

        // Check if days are within semester date range
        const minDate = new Date(instance.config.minDate);
        const maxDate = new Date(instance.config.maxDate);

        // Filter only dates that fall within the semester range
        const validWeekDays = weekDays.filter((day) => {
          const dayTime = day.getTime();
          return dayTime >= minDate.getTime() && dayTime <= maxDate.getTime();
        });

        // If no valid days in the selected week
        if (validWeekDays.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Selection",
            text: "Please select dates within the current semester",
          });
          instance.clear();
          return;
        }

        // Display the actual selected dates to the user
        const formattedDates = validWeekDays
          .map((date) =>
            date.toLocaleDateString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          )
          .join(" to ");

        // Update the input to show only valid dates
        instance.setDate(validWeekDays);

        // Store the valid dates for table generation
        currentWeekDates = validWeekDays.map((date) => {
          const adjustedDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
          );
          return adjustedDate.toISOString().split("T")[0];
        });

        // Generate slots if we have valid dates
        if (currentWeekDates.length > 0) {
          generateSlots(
            new URLSearchParams(window.location.search).get("data_id"),
            semester_id,
            currentWeekDates[0],
            currentWeekDates[currentWeekDates.length - 1]
          );
        }
      },
    });
  }
});

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "short" }; // e.g., "15 Jan"
  return date.toLocaleDateString("en-GB", options);
}

function generateSlots(data_id, semester_id, start_date, end_date) {
  if (!data_id || !semester_id) {
    console.error("Error: Missing data_id or semester_id");
    return;
  }

  fetch(
    `/api/timesclotsbyleaveschedule/${data_id}/${semester_id}/${start_date}/${end_date}`
  )
    .then((response) => response.json())
    .then((timeslots) => {
      const tableBody = $("#scheduleTableBody");
      const thead = $("thead tr");

      // Clear existing headers
      thead.empty();
      thead.append('<th scope="col">Day/Time</th>');

      const selectedStartDate = new Date(start_date);
      const dates = [];

      for (let i = 0; i < 5; i++) {
        const currentDate = new Date(selectedStartDate);
        currentDate.setDate(selectedStartDate.getDate() + i);
        dates.push(new Date(currentDate));
      }

      const dayMap = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };

      const daysOfWeek = dates.map((date) => ({
        day: dayMap[date.getDay()],
        date: date,
      }));

      let timeSlots = [];
      timeslots.forEach((slot) => {
        const timeRange = `${formatTime(slot.start_time)}-${formatTime(
          slot.end_time
        )}`;
        if (!timeSlots.includes(timeRange)) {
          timeSlots.push(timeRange);
          thead.append(`<th scope="col">${timeRange}</th>`);
        }
      });

      tableBody.empty();

      daysOfWeek.forEach(({ day, date }) => {
        if (day !== "Saturday" && day !== "Sunday") {
          let row = `<tr><th scope="row">${day}<br>${formatDate(date)}</th>`;

          timeSlots.forEach((timeSlot) => {
            const slotData = timeslots.find(
              (slot) =>
                slot.dayofweek === day &&
                `${formatTime(slot.start_time)}-${formatTime(
                  slot.end_time
                )}` === timeSlot
            );

            let color = "";
            if (slotData) {
              switch (slotData.status) {
                case "Leave":
                  color = "bg-secondary";
                  break;
                case "Available":
                  color = "bg-success";
                  break;
                case "Approved":
                  color = "bg-danger";
                  break;
                case "Reject":
                  color = "bg-success";
                  break;
              }

              row += `<td data-timeslots_id="${slotData.timeslots_id}" 
                                   data-start_time="${slotData.start_time}" 
                                   data-end_time="${slotData.end_time}" 
                                   data-dayofweek="${slotData.dayofweek}" 
                                   data-status="${slotData.status}" 
                                   data-date="${
                                     date.toISOString().split("T")[0]
                                   }"  
                                   class="${color}"
                                   onclick="bookAppointment(this)"
                               ></td>`;
            } else {
              row += "<td></td>";
            }
          });

          row += "</tr>";
          tableBody.append(row);
        }
      });
    })
    .catch((error) => console.error("Error fetching timeslots:", error));
}
function logout() {
  fetch("/logout", { method: "POST" }) // Adjust the logout endpoint as needed
    .then(() => {
      window.location.href = "/login"; // Redirect to login after logout
    })
    .catch((error) => console.error("Error logging out:", error));
}

// Function to handle booking
async function bookAppointment(cell) {
  const timeslots_id = cell.dataset.timeslots_id;
  const dateStr = cell.dataset.date;
  const status = cell.dataset.status;
  
  // แปลงวันที่ให้อยู่ในรูปแบบ ISO string ที่ถูกต้องโดยไม่มีการปรับ timezone
  const date = new Date(dateStr);
  const localISOString = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  // อนุญาตให้จองได้เฉพาะเมื่อสถานะเป็น Available หรือ Reject
  if (status !== "Available" && status !== "Reject") {
    Swal.fire({
      icon: "error",
      title: "Cannot Book",
      text: "This timeslot is not available for booking",
    });
    return;
  }

  const { value: detail } = await Swal.fire({
    title: "Enter Appointment Details",
    input: "textarea",
    inputLabel: "Details",
    inputPlaceholder: "Enter your appointment details here...",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "Please enter some details for your appointment";
      }
    },
  });

  if (detail) {
    try {
      const response = await fetch("/api/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data_id: new URLSearchParams(window.location.search).get("data_id"),
          timeslots_id: timeslots_id,
          semester_id: document.getElementById("semester-select").value,
          date: localISOString,
          detail: detail,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // ลบ class เดิมที่อาจเป็น Available หรือ Reject
        cell.classList.remove("bg-success", "bg-danger");
        // เพิ่ม class สำหรับสถานะ Waiting
        cell.classList.add("bg-warning");
        cell.dataset.status = "Waiting";
        
        await Swal.fire({
          icon: "success",
          title: "Booked!",
          text: "Your appointment has been booked successfully",
        });

        // รีเฟรชตารางเวลา
        const selectedDates =
          document.getElementById("multi-date-input")._flatpickr.selectedDates;
        if (selectedDates.length > 0) {
          const firstDate = new Date(
            selectedDates[0].getTime() -
              selectedDates[0].getTimezoneOffset() * 60000
          )
            .toISOString()
            .split("T")[0];
          const lastDate = new Date(
            selectedDates[selectedDates.length - 1].getTime() -
              selectedDates[selectedDates.length - 1].getTimezoneOffset() * 60000
          )
            .toISOString()
            .split("T")[0];
          await generateSlots(
            new URLSearchParams(window.location.search).get("data_id"),
            document.getElementById("semester-select").value,
            firstDate,
            lastDate
          );
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: error.message || "An error occurred while booking",
      });
    }
  }
}
// Helper function to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

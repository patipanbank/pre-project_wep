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

  // Add click event listener for table cells
  $(document).on("click", "td", function () {
    const status = $(this).data("status");

    if (status === "Leave") {
      // กรณีเป็น Leave
      if ($(this).hasClass("bg-secondary")) {
        // เปลี่ยนเป็น "Warning" (สีเหลือง)
        $(this).removeClass("bg-secondary").addClass("bg-primary");
      } else if ($(this).hasClass("bg-primary")) {
        // เปลี่ยนกลับเป็น "Available" (สีเขียว)
        $(this).removeClass("bg-primary").addClass("bg-secondary");
      } else {
        // ถ้าไม่มี class ใดเลย ให้เปลี่ยนเป็น "Warning"
        $(this).addClass("bg-primary");
      }
    } else if (status === "Available") {
      // กรณีเป็น Available ให้เปลี่ยนเป็น "Warning" (สีเหลือง)
      if ($(this).hasClass("bg-success")) {
        $(this).removeClass("bg-success").addClass("bg-primary");
      } else if ($(this).hasClass("bg-primary")) {
        $(this).removeClass("bg-primary").addClass("bg-success");
      } else {
        $(this).addClass("bg-primary");
      }
    } else if (status === "Reject") {
      // กรณีเป็น Available ให้เปลี่ยนเป็น "Warning" (สีเหลือง)
      if ($(this).hasClass("bg-success")) {
        $(this).removeClass("bg-success").addClass("bg-primary");
      } else if ($(this).hasClass("bg-primary")) {
        $(this).removeClass("bg-primary").addClass("bg-success");
      } else {
        $(this).addClass("bg-primary");
      }
    } 
    else if (status === "Approved") {
      // กรณีเป็น Available ให้เปลี่ยนเป็น "Warning" (สีเหลือง)
      if ($(this).hasClass("bg-danger")) {
        $(this).removeClass("bg-danger").addClass("bg-primary");
      } else if ($(this).hasClass("bg-primary")) {
        $(this).removeClass("bg-primary").addClass("bg-danger");
      } else {
        $(this).addClass("bg-primary");
      }
    }
    else if (status === "Waiting") {
      // กรณีเป็น Available ให้เปลี่ยนเป็น "Warning" (สีเหลือง)
      if ($(this).hasClass("bg-warning")) {
        $(this).removeClass("bg-warning").addClass("bg-primary");
      } else if ($(this).hasClass("bg-primary")) {
        $(this).removeClass("bg-primary").addClass("bg-warning");
      } else {
        $(this).addClass("bg-primary");
      }
    }
    else {
      // ถ้า status ไม่ใช่ "Leave" หรือ "Available"
      if ($(this).hasClass("bg-primary")) {
        // ลบสี "Warning"
        $(this).removeClass("bg-primary");
      } else {
        // เปลี่ยนเป็น "Warning"
        $(this).addClass("bg-primary");
      }
    }
    const timeslotID = $(this).data("timeslots_id");
    const startTime = $(this).data("start_time");
    const endTime = $(this).data("end_time");
    const dayOfWeek = $(this).data("dayofweek");
    console.log(`Timeslot ID: ${timeslotID}`);
    console.log(`Start Time: ${startTime}`);
    console.log(`End Time: ${endTime}`);
    console.log(`Day of Week: ${dayOfWeek}`);
    console.log("status: ", status);
  });
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
                case "Waiting":
                  color = "bg-warning";
                  break;
              }

              row += `<td data-timeslots_id="${slotData.timeslots_id}" 
                         data-start_time="${slotData.start_time}" 
                         data-end_time="${slotData.end_time}" 
                         data-dayofweek="${slotData.dayofweek}" 
                         data-status="${slotData.status}" 
                         data-date="${date.toISOString().split("T")[0]}"  
                         class="${color}"
                     </td>`; // Added status text display
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
//  onclick="bookAppointment(this)"
function updateLeave(status) {
  console.log(status);

  const data_id = new URLSearchParams(window.location.search).get("data_id");
  const semester_id = document.getElementById("semester-select").value;
  const selectedTimeslots = [];

  // Get all selected timeslots from the table
  document.querySelectorAll(".bg-primary").forEach(function (cell) {
    const timeslotId = cell.getAttribute("data-timeslots_id");
    const date = cell.getAttribute("data-date");
    console.log("date in cell : ", date);

    if (timeslotId) {
      selectedTimeslots.push({
        timeslots_id: timeslotId,
        dates: date,
      });
    }
    console.log(selectedTimeslots);
  });

  if (
    !semester_id ||
    (selectedTimeslots.length === 0 && status !== "deleteall")
  ) {
    alert("Please select a semester and timeslots!");
    return;
  }

  // Handle delete all schedules
  if (status === "deleteall") {
    const result = confirm("Are you sure you want to delete all schedules?");
    if (result) {
      deleteAllLeaves(data_id, semester_id);
    }
    return;
  }

  // Handle delete selected schedules
  if (status === "deleteselected") {
    const result = confirm(
      "Are you sure you want to delete selected schedules?"
    );
    if (result) {
      deleteSelectedLeaves(data_id, semester_id, selectedTimeslots);
    }
    return;
  }

  // Handle normal leave update
  postLeave(data_id, semester_id, selectedTimeslots, status);
}

function deleteSelectedLeaves(data_id, semester_id, selectedTimeslots) {
  fetch("/api/leave/deleteSelected", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data_id: data_id,
      semester_id: semester_id,
      timeslots: selectedTimeslots,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      alert("Selected schedules deleted successfully!");

      // Remove highlighting from deleted cells
      selectedTimeslots.forEach(({ timeslots_id }) => {
        const cell = document.querySelector(
          `td[data-timeslots_id="${timeslots_id}"]`
        );
        if (cell) {
          cell.classList.remove("bg-primary", "bg-secondary");
          cell.setAttribute("data-status", "null");
        }
      });

      // Refresh the schedule display
      generateSlots(
        data_id,
        semester_id,
        currentWeekDates[0],
        currentWeekDates[currentWeekDates.length - 1]
      );
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to delete selected schedules. Please try again.");
    });
}


function postLeave(data_id, semester_id, selectedTimeslots, status) {
  fetch("/api/leave/createLeave", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data_id: data_id,
      semester_id: semester_id,
      timeslots: selectedTimeslots,
      status: status,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      // รอให้ response กลับมาก่อนแล้วค่อยอัพเดท UI ครั้งเดียว
      selectedTimeslots.forEach(({ timeslots_id }) => {
        const cell = document.querySelector(
          `td[data-timeslots_id="${timeslots_id}"]`
        );
        if (cell) {
          cell.classList.remove("bg-primary");
          if (status === "Leave") {
            cell.classList.add("bg-secondary");
          }
          cell.setAttribute("data-status", status);
        }
      });

      // เรียก generateSlots ครั้งเดียวหลังจากอัพเดท UI เสร็จ
      generateSlots(
        data_id,
        semester_id,
        currentWeekDates[0],
        currentWeekDates[currentWeekDates.length - 1]
      );

      alert("Schedule updated successfully!");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to update schedule. Please try again.");
    });
}

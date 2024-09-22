function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  // create semester select dropdown and fetch timeslots
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Document is ready");
    const data_id = new URLSearchParams(window.location.search).get(
      "data_id"
    ); // Get data_id from URL
    const currentYear = new Date().getFullYear();
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
          }
        });
        const selectedSemesterId = semesterSelect.value;
        if (selectedSemesterId) {
          generateSlots({
            data_id: data_id,
            semester_id: selectedSemesterId,
          });
        } else {
          console.error("No semester selected");
          alert("Error: No semester selected. Please select a semester.");
        }
        // If no Term 1 for current year is found, set the first semester as default
        if (!defaultOptionSelected && semesters.length > 0) {
          semesterSelect.options[0].selected = true;
        }
      })
      .catch((error) => console.error("Error fetching semesters:", error));
  });

  // Add event listener for semester select dropdown
  document
    .getElementById("semester-select")
    .addEventListener("change", function () {
      const selectedSemesterId = this.value;
      const data_id = new URLSearchParams(window.location.search).get(
        "data_id"
      );

      fetch(`/semester/${selectedSemesterId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((semester) => {
          console.log(`SemesterID: ${semester.semester_id}`);
          console.log(`Term: ${semester.term}`);
          console.log(`Year: ${semester.year}`);
          console.log(`Start Date: ${semester.start_date}`);
          console.log(`End Date: ${semester.end_date}`);
          generateSlots({
            data_id: data_id,
            semester_id: selectedSemesterId,
          });
        })
        .catch((error) => {
          console.error("Error fetching semester details:", error);
        });
    });

  // loading image
  $(document).ready(function () {
    // Existing code for fetching and displaying profile data
    const data_id = new URLSearchParams(window.location.search).get(
      "data_id"
    ); // Get data_id from URL
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
      .catch((error) =>
        console.error("Error fetching profile data:", error)
      );
  });

  // Add event listener for Update Office Hours button
  function updateSchedule(status) {
    const data_id = new URLSearchParams(window.location.search).get(
      "data_id"
    ); // Fetch the data_id from the URL
    const semester_id = document.getElementById("semester-select").value; // Fetch selected semester
    const selectedTimeslots = [];

    // Get all selected timeslots from the table
    document.querySelectorAll(".bg-warning").forEach(function (cell) {
      const timeslotId = cell.getAttribute("data-timeslots_id");
      if (timeslotId) {
        selectedTimeslots.push(timeslotId);
      }
    });

    if (!semester_id || selectedTimeslots.length === 0 && status !== "clearall") {
      alert("Please select a semester and timeslots!");
      return;
    }

    if (status === "clearall") {
      const result = confirm("Are you sure you want to clear all schedules?");
      const allTimeslots = [];
      if (result) {
        document.querySelectorAll("[data-status]").forEach(function (cell) {
          // console.log(cell);
          if (cell.getAttribute("data-status") !== "null" && cell.getAttribute("data-status") === "Available" || cell.getAttribute("data-status") === "Leave") {
            console.log(cell.getAttribute("data-status"));
            allTimeslots.push(cell.getAttribute("data-timeslots_id"));
          }
        })
        // console.log(allTimeslots);
        postSchedule(data_id,semester_id,allTimeslots,'Empty');    
      }
      return;
    }
     postSchedule(data_id,semester_id,selectedTimeslots,status);    
  
  }

  function postSchedule(data_id,semester_id,selectedTimeslots,status) {
    // Send data to server to generate schedules
    fetch("/api/schedule/createSchedule", {
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
        alert("Schedule updated successfully!");
        selectedTimeslots.forEach((timeslotId) => {
          const cell = document.querySelector(
            `td[data-timeslots_id="${timeslotId}"]`
          );
          if (status === "Available") {
            cell.classList.remove("bg-warning");
            cell.classList.add("bg-success");
          }
          
          generateSlots({ data_id: data_id, semester_id: semester_id });
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  

  // generate slots function
  function generateSlots({ data_id, semester_id }) {
    //console.log('data_id :>> ', data_id);
    //console.log('semester_id :>> ', semester_id);
    if (!data_id || !semester_id) {
      console.error("Error: Missing data_id or semester_id");
      return;
    }
    // Fetch and display time slots
    fetch(`/api/timesclotsbydataid/${data_id}/${semester_id}`)
      .then((response) => response.json())
      .then((timeslots) => {
        const tableBody = $("#scheduleTableBody");
        const thead = $("thead tr");

        // Clear existing headers
        thead.empty();
        thead.append('<th scope="col">Day/Time</th>');

        // Prepare headers and rows
        const daysOfWeek = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ];
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

        // Clear existing rows
        tableBody.empty();

        // Create rows for each day and add time slot data
        daysOfWeek.forEach((day) => {
          let row = `<tr><th scope="row">${day}</th>`;
          timeSlots.forEach((timeSlot) => {
            const slotData = timeslots.find(
              (slot) =>
                slot.dayofweek === day &&
                `${formatTime(slot.start_time)}-${formatTime(
                  slot.end_time
                )}` === timeSlot
            );

            if (slotData) {
              row += `<td data-timeslots_id="${
                slotData.timeslots_id
              }" data-start_time="${slotData.start_time}" data-end_time="${
                slotData.end_time
              }" data-dayofweek="${slotData.dayofweek}" data-status="${
                slotData.status
              }" class="${
                slotData.status === "Available" ? "bg-success" : ""
              }"></td>`;
            } else {
              row += `<td></td>`;
            }
          });
          row += "</tr>";
          tableBody.append(row);
        });
      })
      .catch((error) => console.error("Error fetching timeslots:", error));
  }

  // Add click event listener for table cells
  $(document).on("click", "td", function () {
    const status = $(this).data("status");

    // If the cell is "Available", toggle to "Warning" and vice versa
    if (status === "Available") {
      if ($(this).hasClass("bg-success")) {
        // Toggle to "Warning" (yellow)
        $(this).removeClass("bg-success").addClass("bg-warning");
      } else if ($(this).hasClass("bg-warning")) {
        // Toggle back to "Available" (green)
        $(this).removeClass("bg-warning").addClass("bg-success");
      } else {
        // If no class is set, mark as "Warning"
        $(this).addClass("bg-warning");
      }
    } else {
      // If status is not "Available", only toggle to "Warning"
      if ($(this).hasClass("bg-warning")) {
        
        // Do nothing, keep it as "Warning"
        // return;

        // remove class bg-warning
        $(this).removeClass("bg-warning")
      } else {
        // Mark as "Warning" if not already
        $(this).addClass("bg-warning");
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
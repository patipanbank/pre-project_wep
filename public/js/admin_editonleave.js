
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
          if (!defaultOptionSelected && semester.term === "1" && semester.year === currentYear) {
            option.selected = true;
            defaultOptionSelected = true;

            // Set date range based on the selected semester's start and end date
            setDateInputRange(semester.start_date, semester.end_date,semester.semester_id);
          }
        });

        semesterSelect.addEventListener("change", function () {
          const selectedSemester = semesters.find(semester => semester.semester_id === parseInt(semesterSelect.value));
          if (selectedSemester) {
            setDateInputRange(selectedSemester.start_date, selectedSemester.end_date,selectedSemester.semester_id);
          }
        });

        // If no Term 1 for current year is found, set the first semester as default
        if (!defaultOptionSelected && semesters.length > 0) {
          semesterSelect.options[0].selected = true;
          const firstSemester = semesters[0];
          setDateInputRange(firstSemester.start_date, firstSemester.end_date,firstSemester.semester_id);
        }
      })
      .catch((error) => console.error("Error fetching semesters:", error));

    // Function to initialize and set date input range with Flatpickr for multi-date selection
    function setDateInputRange(startDate, endDate, semester_id) {
      flatpickr(dateInput, {
        mode: "multiple",
        minDate: new Date(startDate).toISOString().split('T')[0],
        maxDate: new Date(endDate).toISOString().split('T')[0],
        dateFormat: "Y-m-d",
        disable: [
          function(date) {
            return (date.getDay() === 6 || date.getDay() === 0); // Disable weekends
          }
        ],
        onChange: function(selectedDates, dateStr, instance) {
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
          // console.log(weekDays);
          
          // Check if days are within allowed range
          const minDate = new Date(instance.config.minDate);
          const maxDate = new Date(instance.config.maxDate);
          // console.log(maxDate);
          
          const validWeekDays = weekDays.filter((day)=> {
            return day >= minDate && day <= maxDate; 
          }
          );
          // console.log(validWeekDays.map(day => day.toDateString()));
          
          // If the selected dates are from the current week, clear them all
          if (currentWeekDates.length > 0 && 
              weekDays[0].toDateString().split('T')[0] === currentWeekDates[0]) {
            instance.clear();
            currentWeekDates = [];
          } else {
            // Set all valid weekdays for the selected week
            // console.log(validWeekDays);
            
            instance.setDate(validWeekDays);
            
            currentWeekDates = validWeekDays.map(date => date.toDateString().split('T'));
            
            if (currentWeekDates.length > 0) {
              // console.log(currentWeekDates);
              
              generateSlots(data_id, semester_id, currentWeekDates[0], currentWeekDates[currentWeekDates.length-1]);
            }
          }
        }
      });
    }
    // console.log(currentWeekDates);
      // generate slots function
  
    
     
      // Add click event listener for table cells
      $(document).on("click", "td", function () {
        const status = $(this).data("status");
        
        // If the cell is "Available", toggle to "Warning" and vice versa
        if (status === "Leave") {
          if ($(this).hasClass("bg-secondary")) {
            // Toggle to "Warning" (yellow)
            $(this).removeClass("bg-secondary").addClass("bg-warning");
          } else if ($(this).hasClass("bg-warning")) {
           // Toggle back to "Available" (green)
           $(this).removeClass("bg-warning").addClass("bg-secondary");
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
  });
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' }; // e.g., "15 Jan"
    return date.toLocaleDateString('en-GB', options);
  }

  function generateSlots(data_id, semester_id, start_date, end_date) {
    if (!data_id || !semester_id) {
      console.error("Error: Missing data_id or semester_id");
      return;
    }

    fetch(`/api/timesclotsbyleave/${data_id}/${semester_id}/${start_date}/${end_date}`)
      .then((response) => response.json())
      .then((timeslots) => {
        const tableBody = $("#scheduleTableBody");
        const thead = $("thead tr");

        // Clear existing headers
        thead.empty();
        thead.append('<th scope="col">Day/Time</th>');

        // Create array of dates for the selected week
        const startDate = new Date(start_date);
        console.log(startDate);
        
        const dates = [];
        for (let i = 0; i < 5; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          dates.push(currentDate);
        }
        console.log(dates);
        
        // Map days to their corresponding dates
        const daysOfWeek = [
          { day: "Monday", date: dates[0] },
          { day: "Tuesday", date: dates[1] },
          { day: "Wednesday", date: dates[2] },
          { day: "Thursday", date: dates[3] },
          { day: "Friday", date: dates[4] }
        ];

        // Prepare time slots array and headers
        let timeSlots = [];
        timeslots.forEach((slot) => {
          const timeRange = `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}`;
          if (!timeSlots.includes(timeRange)) {
            timeSlots.push(timeRange);
            thead.append(`<th scope="col">${timeRange}</th>`);
          }
        });

        // Clear existing rows
        tableBody.empty();

        // Create rows for each day with dates and add time slot data
        daysOfWeek.forEach(({day, date}) => {
          let row = `<tr><th scope="row">${day}<br>${formatDate(date)}</th>`;
          // console.log('Date : ',date);
          
          timeSlots.forEach((timeSlot) => {
            // Find timeslot data for the current day and time slot
            const slotData = timeslots.find(
              (slot) =>
                slot.dayofweek === day &&
                `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}` === timeSlot
            );
        
            // Add cell for the time slot
            if (slotData) {
              row += `<td data-timeslots_id="${slotData.timeslots_id}" 
                         data-start_time="${slotData.start_time}" 
                         data-end_time="${slotData.end_time}" 
                         data-dayofweek="${slotData.dayofweek}" 
                         data-status="${slotData.status}" 
                         data-date="${date}"
                         class="${slotData.status === "Leave" ? "bg-secondary" : ""}">
                     </td>`;
            } else {
              // If there's no data for the time slot, add an empty cell
              row += `<td></td>`;
            }
          });
        
          row += "</tr>";
          tableBody.append(row);
        });
      })
      .catch((error) => console.error("Error fetching timeslots:", error));
  }

  function updateLeave(status) {
    console.log(status);
    
    const data_id = new URLSearchParams(window.location.search).get(
      "data_id"
    ); // Fetch the data_id from the URL
    const semester_id = document.getElementById("semester-select").value; // Fetch selected semester
    const selectedTimeslots = [];
  
    // Get all selected timeslots from the table
    document.querySelectorAll(".bg-warning").forEach(function (cell) {
      const timeslotId = cell.getAttribute("data-timeslots_id");
      const date = cell.getAttribute("data-date")
      console.log('date in cell : ',date);
      
      if (timeslotId) {
        selectedTimeslots.push({
          'timeslots_id': timeslotId, // Creates an array with the timeslotId
          'dates': date               // Creates an array with the date
        });
      }
      console.log(selectedTimeslots);
      
    });

    if (!semester_id || selectedTimeslots.length === 0 && status !== "clearall") {
      alert("Please select a semester and timeslots!");
      return;
    }
    if (status === "clearall") {
      const result = confirm("Are you sure you want to clear all schedules?");
      const allTimeslots = [
      ];
      if (result) {
        document.querySelectorAll("[data-status]").forEach(function (cell) {
          // console.log(cell);
          if (cell.getAttribute("data-status") !== "null" && cell.getAttribute("data-status") === "Available" || cell.getAttribute("data-status") === "Leave") {
            const timeslotId = cell.getAttribute("data-timeslots_id");
            const date = cell.getAttribute("data-date")
            allTimeslots.push({
              'timeslots_id': timeslotId, // Creates an array with the timeslotId
              'dates': date               // Creates an array with the date
            });
          }
        })
        console.log(allTimeslots);
        postLeave(data_id,semester_id,allTimeslots,'Empty');    
      }
      return;
    }
    // console.log(selectedTimeslots.find((timeslots_id)=>timeslots_id));
    // selectedTimeslots
    postLeave(data_id,semester_id,selectedTimeslots,status);    
  
  }

  function postLeave(data_id,semester_id,selectedTimeslots,status) {
    console.log();
    
    // Send data to server to generate schedules
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
        alert("Schedule updated successfully!");
        selectedTimeslots.forEach(({timeslots_id}) => {
          const cell = document.querySelector(
            `td[data-timeslots_id="${timeslots_id}"]`
          );
          if (status === "Leave") {
            cell.classList.remove("bg-warning");
            cell.classList.add("bg-secondary");
          }
          
          generateSlots(data_id , semester_id,currentWeekDates[0],currentWeekDates[currentWeekDates.length-1] );
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  
  
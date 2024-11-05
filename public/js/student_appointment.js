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

    fetch(`/api/timesclotsbyleaveschedule/${data_id}/${semester_id}/${start_date}/${end_date}`)
      .then((response) => response.json())
      .then((timeslots) => {
        const tableBody = $("#scheduleTableBody");
        const thead = $("thead tr");
        console.log(timeslots);
        
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
          console.log(timeRange);
          if (!timeSlots.includes(timeRange)) {
            timeSlots.push(timeRange);
            thead.append(`<th scope="col">${timeRange}</th>`);
            console.log(`date: ${slot.dayofweek} timeRange: ${timeRange} slot.status: ${slot.status}`);
            
          }
        });

        // Clear existing rows
        tableBody.empty();

        // Create rows for each day with dates and add time slot data
        daysOfWeek.forEach(({day, date}) => {
          let row = `<tr><th scope="row">${day}<br>${formatDate(date)}</th>`;
          // console.log('Date : ',date);
           let color = ''
          timeSlots.forEach((timeSlot) => {
            // Find timeslot data for the current day and time slot
            const slotData = timeslots.find(
              (slot) =>
                slot.dayofweek === day &&
                `${formatTime(slot.start_time)}-${formatTime(slot.end_time)}` === timeSlot
            );
            console.log('slotData: ',slotData);
            if (slotData) {
              switch (slotData.status) {
                case "Leave":
                  color = 'bg-secondary'
                  break;
                case "Available":
                  color = 'bg-success'
                  break;
                case "Waiting":
                  color = 'bg-warning'
                  break;
                default:
                  color=''  
                  break;
              }
            }

            // Add cell for the time slot
            if (slotData) {
              row += `<td data-timeslots_id="${slotData.timeslots_id}" 
                         data-start_time="${slotData.start_time}" 
                         data-end_time="${slotData.end_time}" 
                         data-dayofweek="${slotData.dayofweek}" 
                         data-status="${slotData.status}" 
                         data-date="${date}"  
                         class="${color}"
                         onclick="bookAppointment(this)"
                         >
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
        function logout() {
            fetch('/logout', { method: 'POST' }) // Adjust the logout endpoint as needed
                .then(() => {
                    window.location.href = '/login'; // Redirect to login after logout
                })
                .catch(error => console.error('Error logging out:', error));
        }
        


      // Function to handle booking
async function bookAppointment(cell) {
    
    // Get data from the cell attributes
    const timeslots_id = cell.dataset.timeslots_id;
    const date = new Date(cell.dataset.date);
    const status = cell.dataset.status;
    console.log(`Booking timeslot ${timeslots_id} on ${date.toDateString()} with status ${status}`);
    // Only proceed if the status is Available or Empty
    if (status !== 'Available' ) {
        Swal.fire({
            icon: 'error',
            title: 'Cannot Book',
            text: 'This timeslot is not available for booking'
        });
        return;
    }

    // Prompt for booking details
    const { value: detail } = await Swal.fire({
        title: 'Enter Appointment Details',
        input: 'textarea',
        inputLabel: 'Details',
        inputPlaceholder: 'Enter your appointment details here...',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'Please enter some details for your appointment';
            }
        }
    });

    if (detail) {
        try {
            const response = await fetch('/api/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data_id: new URLSearchParams(window.location.search).get("data_id"),
                    // users_id: getCookie("user_id"), // Get the user_id from the cookie
                    timeslots_id: timeslots_id,
                    semester_id: document.getElementById('semester-select').value,
                    date: date.toISOString().split('T')[0],
                    detail: detail
                })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Booked!',
                    text: 'Your appointment has been booked successfully'
                });
                // Refresh the schedule display
                const selectedDates = document.getElementById('multi-date-input')._flatpickr.selectedDates;
                if (selectedDates.length > 0) {
                    generateSlots(
                        new URLSearchParams(window.location.search).get("data_id"),
                        document.getElementById('semester-select').value,
                        selectedDates[0],
                        selectedDates[selectedDates.length - 1]
                    );
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: error.message || 'An error occurred while booking'
            });
        }
    }
}
// Helper function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
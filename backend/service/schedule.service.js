const generateWeeklySchedule = (data_id) => {
    const timeslotsPerDay = 18; // Number of time slots per day (08:00 to 17:00)
    const daysOfWeek = 5; // Number of weekdays (Monday to Friday)
    let queries = [];
  
    const getNextWeekday = (startDate) => {
      let date = new Date(startDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 6) { // If today is Saturday
        date.setDate(date.getDate() + 2); // Skip to Monday
      } else if (dayOfWeek === 0) { // If today is Sunday
        date.setDate(date.getDate() + 1); // Skip to Monday
      }
      return date;
    };
  
    // Get the starting date for the schedule (next weekday)
    let startDate = getNextWeekday(new Date());
  
    // Loop through each weekday
    for (let day = 0; day < daysOfWeek; day++) {
      // Loop through each time slot for the current day
      for (let slot = 0; slot < timeslotsPerDay; slot++) {
        let timeslots_id = slot + 1 + day * timeslotsPerDay;
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + day);
        date.setHours(8 + Math.floor(slot / 2)); // Assuming slots are 30 minutes each, adjust hours
        date.setMinutes((slot % 2) * 30); // Set minutes to 0 or 30
        queries.push([date, data_id, timeslots_id]);
      }
    }
  
    return queries;
  };

module.exports = {generateWeeklySchedule}
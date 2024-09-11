const generateWeeklySchedule = (data_id, startDate) => {
  const timeslotsPerDay = 18; // Number of time slots per day (08:00 to 17:00)
  const daysOfWeek = 5; // Number of weekdays (Monday to Friday)
  const totalWeeks = 24; // Generate schedules for 24 weeks
  let queries = [];

  // Adjust the start date to the next Monday if today is a weekend
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
  let startMonday = getNextWeekday(new Date(startDate));

  // Loop through each of the 24 weeks
  for (let week = 0; week < totalWeeks; week++) {
    // Calculate the start date for the current week (Monday)
    const currentMonday = new Date(startMonday);
    currentMonday.setDate(startMonday.getDate() + week * 7);

    // Loop through each weekday from Monday to Friday
    for (let day = 0; day < daysOfWeek; day++) {
      // Loop through each time slot for the current day
      for (let slot = 0; slot < timeslotsPerDay; slot++) {
        let timeslots_id = slot + 1 + day * timeslotsPerDay;
        let date = new Date(currentMonday);
        date.setDate(currentMonday.getDate() + day);
        date.setHours(8 + Math.floor(slot / 2)); // Assuming slots are 30 minutes each, adjust hours
        date.setMinutes((slot % 2) * 30); // Set minutes to 0 or 30
        queries.push([date, data_id, timeslots_id]);
      }
    }
  }

  return queries;
};


module.exports = { generateWeeklySchedule };

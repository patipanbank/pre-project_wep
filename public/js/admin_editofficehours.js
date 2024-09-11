const data_id = new URLSearchParams(window.location.search).get('data_id');

const updateOfficeHours = async (status) => {
    let schedules = [];

    // Iterate through all cells with 'bg-warning' class
    $("td.bg-warning").each(function() {
        // Get the index of the cell in its row (0-based)
        let colIndex = $(this).index() - 1; // Subtract 1 because the first column is the day name
        
        // Get the row index (0-based)
        let rowIndex = $(this).parent().index();
        
        // Calculate the time slot ID
        let slotId = rowIndex * 18 + colIndex + 1;
        
        // Add the slot ID to the array
        schedules.push({ data_id:data_id, timeslots_id: slotId, status:status });
        
        // Change the cell class from 'bg-warning' to 'bg-success'
        switch (status) {
            case 'Available':
                $(this).removeClass("bg-warning").addClass("bg-success");
                break;
            case 'Leave':
                $(this).removeClass("bg-warning").addClass("bg-secondary");
                break;
            default:
                break;
        }
    });

    // Log the clicked time slot IDs (you can modify this to send the data to the server)
    console.log("Clicked time slot IDs:", schedules);
    try {
        const res = await fetch(`/schedule/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ schedules })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}



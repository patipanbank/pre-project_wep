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

const clearOfficeHours = async () => {
    let schedules = [];

    $("td.bg-warning").each(function() {
        let colIndex = $(this).index() - 1; // Adjust for day column
        let rowIndex = $(this).parent().index();
        let slotId = rowIndex * 18 + colIndex + 1;

        schedules.push({ data_id: data_id, timeslots_id: slotId, status: 'Empty' });

        $(this).removeClass("bg-warning bg-success bg-secondary").addClass("bg-empty");
    });

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
};

const clearAllOfficeHours = async () => {
    let schedules = [];

    $("td").each(function() {
        if ($(this).hasClass('bg-success') || $(this).hasClass('bg-secondary')) {
            let colIndex = $(this).index() - 1; 
            let rowIndex = $(this).parent().index();
            let slotId = rowIndex * 18 + colIndex + 1;

            schedules.push({ data_id: data_id, timeslots_id: slotId, status: 'Empty' });

            $(this).removeClass("bg-success bg-secondary").addClass("bg-empty");
        }
    });

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
};


async function login() {
    try {
        const response = await fetch("http://localhost:3001/auth/google", {
            method: 'GET',
            mode: 'cors', // 'no-cors' if you want to disable CORS, but not recommended
            credentials: 'include', // Include cookies if needed
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if needed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json(); // Assuming the response is JSON
        console.log(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

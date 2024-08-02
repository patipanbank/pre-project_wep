// async function login() {
//     try {
//         const response = await axios.get("http://localhost:3001/auth/google", {
//             withCredentials: true, // Include cookies if needed
//             headers: {
//                 'Content-Type': 'application/json',
//                 // Add any additional headers if needed
//             }
//         });

//         console.log(response.data); // Assuming the response is JSON
//     } catch (error) {
//         console.error('There has been a problem with your axios request:', error);
//         if (error.response) {
//             // Server responded with a status other than 2xx
//             console.error('Error response:', error.response.data);
//         } else if (error.request) {
//             // Request was made but no response received
//             console.error('Error request:', error.request);
//         } else {
//             // Something else happened
//             console.error('Error message:', error.message);
//         }
//     }
// }


export async function login() {
    window.location.href = "http://localhost:3001/auth/google";
}

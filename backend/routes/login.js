const express = require('express');
const router = express.Router();
const login = require('../controller/login');
router.get("/login", login.pageLogin);
router.get("/auth", login.auth);



router.get('/auth/google', (req, res) => {
    console.log("test");
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=profile email`;
    res.redirect(url);
});

// router.get('/auth/callback', async (req, res) => {
//     const { code } = req.query;

//     try {
//         // Exchange authorization code for access token
//         const { data } = await axios.post('<https://oauth2.googleapis.com/token>', {
//             client_id: process.env.CLIENT_ID,
//             client_secret: process.env.CLIENT_SECRET,
//             code,
//             redirect_uri: process.env.REDIRECT_URI,
//             grant_type: 'authorization_code',
//         });

//         const { access_token, id_token } = data;

//         // Use access_token or id_token to fetch user profile
//         const { data: profile } = await axios.get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
//             headers: { Authorization: `Bearer ${access_token}` },
//         });

//         // Code to handle user authentication and retrieval using the profile data

//         console.log(data);

//         res.redirect('/');
//     } catch (error) {
//         console.error('Error:', error.response.data.error);
//         res.redirect('/login');
//     }
// });

router.get('/auth/google', (req, res) => {
    const clientId = '71110747763-bd93fu190pqt7pe5as1pmhqo36ksbsdu.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:3001/auth/callback';
    const responseType = 'code';
    const scope = 'profile email';
    
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    res.redirect(url);
});

router.get('/auth/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code,
            redirect_uri: 'http://localhost:3001/auth/callback',
            grant_type: 'authorization_code',
        });

        const { access_token } = response.data;

        const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const profile = profileResponse.data;

        // Handle user profile data and session here
        console.log(profile);

        res.redirect('/');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.redirect('/login');
    }
});

module.exports = router;
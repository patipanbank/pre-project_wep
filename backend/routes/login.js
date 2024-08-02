const express = require('express');
const router = express.Router();
const login = require('../controller/login');
const axios = require('axios');
const { createUser, findeUserbyemail } = require('../service/user');


router.get("/login", login.pageLogin);
router.get("/auth", login.auth);

router.get('/auth/google', (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = 'http://localhost:3001/auth/callback';
    const responseType = 'code';
    const scope = 'profile email';
    console.log(clientId);
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
        let role = 0; // Default role to 0 (student)
        console.log(profile);

        // Check specific email for admin role
        if (profile.email === "6431501061@lamduan.mfu.ac.th") {
            role = 2; // admin
        } else {
            // Check domain for student or teacher role
            if (profile.hd === "lamduan.mfu.ac.th") {
                role = 0; // student
            } else if (profile.hd === "mfu.ac.th") {
                role = 1; // teacher
            }
        }
        console.log(profile.email);
        let user = await findeUserbyemail({ email: profile.email });
        if (!user) {
            user = await createUser({ email: profile.email, name: profile.name, role: role });
        } else {
            console.log('User already exists:', user);
        }

        console.log(user);

        if (user.role === 0) {
            res.redirect('/student/homepage');
        } else if (
            user.role === 1) {
            res.redirect('/teacher/homepage');
        } else if (user.role === 2) {
            res.redirect('/admin/homepage');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.redirect('/login');
    }
});

module.exports = router;

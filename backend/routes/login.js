const express = require('express');
const router = express.Router();
const login = require('../controller/login');
const axios = require('axios');
const User = require('../model/user');
const { createUser, findeUserbyemail } = require('../service/user');

// Assume you have cookie-parser middleware configured in your app
router.get("/login", login.pageLogin);
router.get("/auth", login.auth);

router.get('/auth/google', (req, res) => {
    const clientId = process.env.CLIENT_ID;
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
        let role = 0;

        if (profile.email === "6431501061@lamduan.mfu.ac.th") {
            role = 2;
        } else {
            if (profile.hd === "lamduan.mfu.ac.th") {
                role = 0;
            } else if (profile.hd === "mfu.ac.th") {
                role = 1;
            }
        }

        let user = await findeUserbyemail({ email: profile.email });
        if (!user) {
            user = await createUser({ email: profile.email, name: profile.name, role: role });
        }

        // แก้ไขการตั้งค่า cookie
        res.cookie('user_id', user.users_id, {
            httpOnly: false, // เปลี่ยนเป็น false เพื่อให้ JavaScript เข้าถึงได้
            secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ในโหมด production
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 วัน
        });

        // เพิ่ม logging เพื่อ debug
        console.log('Setting cookie for user:', {
            userId: user.users_id,
            name: user.name,
            email: user.email
        });

        // Redirect based on role
        if (user.role === 0) {
            res.redirect('/student/homepage');
        } else if (user.role === 1) {
            res.redirect('/teacher/homepage');
        } else if (user.role === 2) {
            res.redirect('/admin/homepage');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error in /auth/callback:', error.response ? error.response.data : error.message);
        res.redirect('/login');
    }
});

// เพิ่ม endpoint สำหรับดึงข้อมูล user
router.get('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ส่งเฉพาะข้อมูลที่จำเป็น
        res.json({
            users_id: user.users_id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    // Clear the user_id cookie
    res.clearCookie('user_id');
    res.status(200).send({ message: 'Logged out successfully' });
});

module.exports = router;

function isAuthenticated(req, res, next) {
    const userId = req.cookies.user_id; // ตรวจสอบว่า cookie มี user_id หรือไม่

    if (!userId) {
        // ถ้าไม่มี user_id ให้ redirect ไปที่หน้า login
        return res.redirect('/login');
    }

    next(); // ดำเนินการต่อถ้ามีการ login แล้ว
}

module.exports = {isAuthenticated};
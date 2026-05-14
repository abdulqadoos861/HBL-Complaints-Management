const userModel = require('../models/user')

async function isAdmin(req, res, next) {
    if (!req.user) {
        if (req.originalUrl.startsWith('/api') || req.xhr) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        return res.render('login', { message: "User not authenticated" });
    }

    try {
        const user = await userModel.findOne({ username: req.user.username });
        if (!user) {
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return res.status(401).json({ message: "User not found" });
            }
            return res.render('login', { message: "User not found" });
        }

        if (user.role === 'admin') {
            next();
        } else {
            console.log("user is not admin");
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return res.status(403).json({ message: "User not authorized as admin" });
            }
            return res.render('login', { message: "User not authorized" });
        }
    } catch (err) {
        console.error('Admin middleware error:', err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = isAdmin;
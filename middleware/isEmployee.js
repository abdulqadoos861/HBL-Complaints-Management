const userModel = require('../models/user')

async function isEmployee(req, res, next) {
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

        if (user.role === 'employee' || user.role === 'support') {
            next();
        } else {
            console.log("user is not authorized as employee");
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return res.status(403).json({ message: "User not authorized as employee" });
            }
            return res.render('login', { message: "User not authorized" });
        }
    } catch (err) {
        console.error('Employee middleware error:', err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = isEmployee;
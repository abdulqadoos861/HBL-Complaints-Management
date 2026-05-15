const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

async function isLogedIn(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            if (req.originalUrl.startsWith('/api') || req.xhr) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            return res.render('login');
        } else {
            const data = jwt.verify(token, process.env.JWT_KEY);
            
            // Database Check for Deactivation
            const user = await userModel.findOne({ username: data.username }).lean();
            if (!user) {
                res.clearCookie('token');
                return res.status(401).json({ message: "Account no longer exists" });
            }

            if (user.isActive === false) {
                res.clearCookie('token');
                if (req.originalUrl.startsWith('/api') || req.xhr) {
                    return res.status(403).json({ message: "Your account has been deactivated" });
                }
                return res.render('login', { message: "Your account has been deactivated" });
            }

            req.user = data;
            next();
        }
    } catch (err) {
        console.log('authentication error:', err.message);
        res.clearCookie('token');
        if (req.path.startsWith('/api') || req.xhr) {
            return res.status(401).json({ message: "Session expired" });
        }
        return res.redirect('/login');
    }
}

module.exports = isLogedIn;
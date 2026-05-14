const jwt = require('jsonwebtoken')

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
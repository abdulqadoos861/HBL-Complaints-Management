const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

async function isLogedIn(req,res , next) {
    try{
    const token = req.cookies.token;
    if (!token){
        return res.render('login')
    }
    else{
        const data = jwt.verify(token , process.env.JWT_KEY);
        req.user = data;
        next();
    }
    }
    catch{
        console.log('authentication error')
        res.clearCookie('token')
        return res.redirect('/login')
    }

}

module.exports = isLogedIn
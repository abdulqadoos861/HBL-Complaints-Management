const userModel = require('../models/user')
const jwt = require('jsonwebtoken')

exports.login = async function(req,res){
    try{
    const {username , password} = req.body;
    const user = await userModel.findOne({username});
    if (!user){
        console.log("user not exits")
        res.status(401).json("user not exist")
    }
    else{
        if (password === user.password)
        {
            const token = jwt.sign({username : user.username , email : user.email},process.env.JWT_KEY)
            res.cookie('token',token)
            if(user.role === 'admin')
            {
                res.redirect('/adminDashboard')
            }
            else if(user.role === 'employee')
            {
                res.redirect('/employeeDashboard')
            }
            else if(user.role === 'customer')
            {
                res.redirect('/customerDashboard')
            }
        }
        else{
            console.log('incorrect passowrd')
            return res.send('incorrect PAssowrd')
        }
    }}
    catch{
        return res.send('An error occured . try again....')
    }

}

exports.checklogin = async function(req,res){
    try {
        console.log('login')
        const token = req.cookies.token;
        if (!token){
            console.log('no token Exists')
            return res.render('login')
        }
        else{
            const data = jwt.verify(token , process.env.JWT_KEY);
            console.log(data)
            const username = data.username;
            const usertype = await userModel.findOne({username: username});
            if(usertype.role === 'admin'){
                res.redirect('adminDashboard')
            }
            else if(usertype.role === 'employee')
            {
                res.redirect('/employeeDashboard')
            }
            else if(usertype.role === 'customer')
            {
                res.redirect('/customerDashboard')
            }
            else{
                res.render('login')
            }
        }
    }
    catch{
    console.log("erorororor")
     res.clearCookie('token') 
     return res.render('login')  
    }
}
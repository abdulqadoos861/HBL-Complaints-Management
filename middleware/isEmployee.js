const jwt = require('jsonwebtoken')
const userModel = require('../models/user')

async function isEmployee(req ,res , next){
    const username = req.user.username;
    const existed = await userModel.findOne({username : username})
    if(!existed){
        console.log(username)
        console.log(existed)
       return res.render('login',{message:"User not authenticated"})
    }
    else{
        if(existed.role === 'employee'){
            next()
        }
        else{
            cosole.log("user is not admin")
           return  res.render('login',{message:"User not authenticated"})
        }
    }
}

module.exports = isEmployee
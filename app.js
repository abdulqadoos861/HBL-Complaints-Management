const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')


dotenv.config()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const userModel = require('./models/user')
const employeeModel = require('./models/employee')
const customerModel = require('./models/customer')
const authRoutes = require('./routes/authroutes')

app.set('view engine','ejs')
app.use('/',authRoutes)





app.get('/logout',(req,res)=>{
    res.clearCookie('token')
    res.redirect('/login')
})
app.get('/',(req,res)=>{
    res.render('index')
})

app.listen(3000);
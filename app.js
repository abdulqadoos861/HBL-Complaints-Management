const express = require('express')
const path = require('path')
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
const productModel = require('./models/product')
const inputFieldsModel = require('./models/inputfields')
const slaModel = require('./models/sla')
const authRoutes = require('./routes/authroutes')
const productRoutes = require('./routes/productRoutes')
const complaintRoutes = require('./routes/complaintroutes')
const trackingRoutes = require('./routes/trackingRoutes')
const trackPageRoutes = require('./routes/trackPageRoutes')

app.set('view engine','ejs')
app.use('/',authRoutes)
app.use('/api',productRoutes)
app.use('/complaint',complaintRoutes)
app.use('/api', trackingRoutes)
app.use('/', trackPageRoutes)


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))



app.get('/logout',(req,res)=>{
    res.clearCookie('token')
    res.redirect('/login')
})

app.get('/',(req,res)=>{
    res.render('index')
})

app.listen(3000 , ()=>{
    console.log(`app is live on http://localhost:3000`)
});
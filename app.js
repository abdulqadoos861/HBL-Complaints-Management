const express = require('express')
const path = require('path')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')


dotenv.config()
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}))
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
const adminRoutes = require('./routes/adminroutes')
const productRoutes = require('./routes/productRoutes')
const complaintRoutes = require('./routes/complaintroutes')
const trackingRoutes = require('./routes/trackingRoutes')
const trackPageRoutes = require('./routes/trackPageRoutes')

app.use('/api',authRoutes)
app.use('/api',adminRoutes)
app.use('/api',productRoutes)
app.use('/api',complaintRoutes)
app.use('/api', trackingRoutes)
app.use('/api', trackPageRoutes)


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads', 'complaints')))



app.post('/api/logout',(req,res)=>{
    res.clearCookie('token', { path: '/' });
    res.json({ message: "Logged out successfully" })
})

app.listen(3000 , ()=>{
    console.log(`app is live on http://localhost:3000`)
});
const express = require('express')
const router = express.Router()
const authController = require("../controller/authController")
const isLogedIn = require('../middleware/isLogedin')
const isAdmin = require('../middleware/isAdmin')
const isCustomer  = require('../middleware/isCustomer')
const isEmployee = require('../middleware/isEmployee')

router.post('/login' , authController.login);




router.get('/adminDashboard',isLogedIn,isAdmin,(req,res)=>{
    res.render('adminDashboard')
})
router.get('/employeeDashboard',isLogedIn,isEmployee, async (req,res)=>{
    const User = require('../models/user');
    const Employee = require('../models/employee');
    const user = await User.findOne({ username: req.user.username });
    const employee = await Employee.findOne({ user: user._id });
    res.render('employeeDashboard', { employeeDept: employee?.department || 'Employee' });
})
router.get('/customerDashboard',isLogedIn,isCustomer,(req,res)=>{
    res.render('customerDashboard')
})

router.get('/complaint' , (req,res)=>{
    res.render('complaint')
})
router.get('/addproduct',(req,res)=>{
    res.render('addproduct')
})
router.get('/login',authController.checklogin)
module.exports = router
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
router.get('/employeeDashboard',isLogedIn,isEmployee,(req,res)=>{
    res.render('employeeDashboard')
})
router.get('/customerDashboard',isLogedIn,isCustomer,(req,res)=>{
    res.render('customerDashboard')
})



router.get('/login',authController.checklogin)

module.exports = router
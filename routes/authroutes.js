const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const authController = require('../controller/authController');
const isLogedIn = require('../middleware/isLogedin');
const isAdmin = require('../middleware/isAdmin');
const isCustomer = require('../middleware/isCustomer');
const isEmployee = require('../middleware/isEmployee');
const User = require('../models/user')
const Employee = require('../models/employee')

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/signup', authController.signup);
router.post('/contact', authController.submitContact);

router.get('/profile', isLogedIn, authController.getProfile);
router.post('/profile/update', isLogedIn, authController.updateProfile);

router.get('/login', authController.checklogin);

module.exports = router;

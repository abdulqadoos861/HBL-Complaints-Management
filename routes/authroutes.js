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
router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', authController.signup);

router.get('/profile', isLogedIn, authController.getProfile);
router.post('/profile/update', isLogedIn, authController.updateProfile);

router.get('/adminDashboard', isLogedIn, isAdmin, (req, res) => {
  res.render('adminDashboard');
});

router.get('/Dashboard', isLogedIn, isEmployee, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username }).lean();
    console.log('Full User Object:', JSON.stringify(user, null, 2));

    if (!user) {
        console.log('User not found in database for username:', req.user.username);
        return res.redirect('/login');
    }

    const employee = await Employee.findOne({ user: user._id });
    console.log('Searching for employee with User ID:', user._id);
    console.log('Employee found:', employee ? employee.name : 'NONE');
    if (employee) console.log('Department:', employee.department);

    if (!employee) {
      console.log('No employee record found for this user. Redirecting to employeeDashboard.');
      return res.redirect('/employeeDashboard');
    }

    if (employee.department && employee.department.trim().toLowerCase() === 'support') {
      console.log('Support department detected. Redirecting to supportDashboard.');
      return res.redirect('/supportDashboard');
    }

    console.log('Standard employee detected. Redirecting to employeeDashboard.');
    return res.redirect('/employeeDashboard');
  } catch (e) {
    console.error(e);
    return res.redirect('/employeeDashboard');
  }
});

router.get('/employeeDashboard', isLogedIn, isEmployee, (req, res) => {
  res.render('employeeDashboard');
});

router.get('/supportDashboard', isLogedIn, isEmployee, (req, res) => {
  res.render('supportDashboard');
});

router.get('/customerDashboard', isLogedIn, isCustomer, (req, res) => {
  res.render('customerDashboard');
});

router.get('/complaint', async (req, res) => {
  const token = req.cookies.token;
  let customerData = null;

  if (token) {
    try {
      const data = jwt.verify(token, process.env.JWT_KEY);
      const user = await User.findOne({ username: data.username });
      if (user && user.role === 'customer') {
        const Customer = require('../models/customer');
        const profile = await Customer.findOne({ user: user._id });
        if (profile) {
          customerData = profile.toObject();
          customerData.email = user.email;
        }
      }
    } catch (e) {
      console.log('Guest user or invalid token accessing complaint page');
    }
  }

  res.render('complaint', { customerData });
});

router.get('/addproduct', (req, res) => {
  res.render('addproduct');
});

router.get('/login', authController.checklogin);

module.exports = router;

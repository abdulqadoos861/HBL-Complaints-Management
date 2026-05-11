const express = require('express');
const router = express.Router();

const isLogedIn = require('../middleware/isLogedin');
const isAdmin = require('../middleware/isAdmin');

const adminController = require('../controller/admincontroller');

router.get('/addemployee', isLogedIn, isAdmin, (req, res) => {
  res.render('addemployee');
});

router.post('/api/admin/addemployee', isLogedIn, isAdmin, adminController.addEmployee);

module.exports = router;

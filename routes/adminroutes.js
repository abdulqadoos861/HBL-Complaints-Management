const express = require('express');
const router = express.Router();

const isLogedIn = require('../middleware/isLogedin');
const isAdmin = require('../middleware/isAdmin');

const adminController = require('../controller/admincontroller');

router.post('/admin/addemployee', isLogedIn, isAdmin, adminController.addEmployee);
router.get('/admin/employees', isLogedIn, isAdmin, adminController.getAllEmployees);
router.patch('/admin/employees/:employeeId/status', isLogedIn, isAdmin, adminController.toggleEmployeeStatus);
const complaintController = require('../controller/complaintController');
router.get('/admin/stats', isLogedIn, isAdmin, complaintController.getAdminStats);

module.exports = router;

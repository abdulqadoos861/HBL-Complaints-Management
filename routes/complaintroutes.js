const express = require('express')
const router = express.Router()
const multer = require('multer')
const complaintController = require('../controller/complaintController')
const isLogedIn = require('../middleware/isLogedin')
const isEmployee = require('../middleware/isEmployee')

// Basic attachment upload config
const attachmentController = require('../controller/attachmentController')
const upload = attachmentController.complaintAttachmentsUploadMiddleware(multer)


// Create complaint
router.post('/create', upload.array('docs', 5), complaintController.createComplaint)


// add complaint updates
router.post('/addupdate/:complaintid',complaintController.addcomplaintupdate)


// GET /api/complaints?cnic=&mobile=&email=&name=
router.get('/complaints', isLogedIn, isEmployee,complaintController.getAllComplaints)

// Employee: complaint details page
// router.get('/complaintDetails/:complaintNumber', isLogedIn, isEmployee, (req, res) => {
//     res.render('supportD');
// });

// Employee: get single complaint (JSON)
router.get('/complaints/:_id', isLogedIn, isEmployee, complaintController.getComplaintWithAllData)

// Optional: SLA preview endpoint
router.get('/sla', isLogedIn, isEmployee, complaintController.getsla);

// Employee: list unique departments
router.get('/departments', isLogedIn, isEmployee, complaintController.getdepartments)

// Employess list under specific department
router.get('/employees', isLogedIn, isEmployee, complaintController.getemployees);


module.exports = router

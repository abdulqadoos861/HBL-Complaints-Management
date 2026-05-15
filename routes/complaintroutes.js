const express = require('express')
const router = express.Router()
const multer = require('multer')
const complaintController = require('../controller/complaintController')
const isLogedIn = require('../middleware/isLogedin')
const isEmployee = require('../middleware/isEmployee')
const isAdminOrEmployee = require('../middleware/isAdminOrEmployee')

// Basic attachment upload config
const attachmentController = require('../controller/attachmentController')
const upload = attachmentController.complaintAttachmentsUploadMiddleware(multer)


// Create complaint
router.post('/create', upload.array('docs', 5), complaintController.createComplaint)


/**
 * Employee: render "Add Update" page for a specific complaint
 * URL: GET /complaint/addupdate/:complaintid
 */
router.get('/addupdate/:complaintid', isLogedIn, isEmployee, (req, res) => {
  return res.render('addupdate', { complaintId: req.params.complaintid });
});

// add complaint updates
router.post('/addupdate/:complaintid', isLogedIn, isEmployee, upload.array('attachments', 5), complaintController.addcomplaintupdate)

/**
 * Support: render "Verify & Assign" page
 */
router.get('/verify/:complaintid', isLogedIn, isEmployee, (req, res) => {
  return res.render('supportDetails', { 
    complaintId: req.params.complaintid,
    userRole: req.user.role 
  });
});

/**
 * Support: process verification and assignment
 */
router.post('/verify/:complaintid', isLogedIn, isAdminOrEmployee, complaintController.verifyComplaint);




// GET /api/complaints?cnic=&mobile=&email=&name=
router.get('/complaints', isLogedIn, isAdminOrEmployee, complaintController.getAllComplaints)



// Employee/Admin: get single complaint (JSON)
router.get('/complaints/:_id', isLogedIn, isAdminOrEmployee, complaintController.getComplaintWithAllData)

// Optional: SLA preview endpoint
router.get('/sla', isLogedIn, isEmployee, complaintController.getsla);

// Employee/Admin: list unique departments
router.get('/departments', isLogedIn, isAdminOrEmployee, complaintController.getdepartments)

// Employee/Admin: list employees
router.get('/employees', isLogedIn, isAdminOrEmployee, complaintController.getemployees)

// Customer: list my complaints
router.get('/myComplaints', isLogedIn, complaintController.getMyComplaints);

module.exports = router

const express = require('express')
const router = express.Router()
const multer = require('multer')
const complaintController = require('../controller/complaintController')
const isLogedIn = require('../middleware/isLogedin')
const isEmployee = require('../middleware/isEmployee')

// Basic attachment upload config
const attachmentController = require('../controller/attachmentController')
const upload = attachmentController.complaintAttachmentsUploadMiddleware(multer)

const { getAllComplaints, getComplaintWithAllData } = require('../controller/complaintQueryController')

// Create complaint
router.post('/create', upload.array('docs', 5), complaintController.createComplaint)

// Employee: list complaints (Filtered by dept/assignment)
// GET /api/complaints?cnic=&mobile=&email=&name=
router.get('/complaints', isLogedIn, isEmployee, getAllComplaints)

// Employee: complaint details page
router.get('/complaintDetails', isLogedIn, isEmployee, async (req, res) => {
  const User = require('../models/user');
  const Employee = require('../models/employee');
  const user = await User.findOne({ username: req.user.username });
  const employee = await Employee.findOne({ user: user._id });
  
  if (employee && employee.department === 'Support') {
    res.render('supportDetails', { employeeDept: 'Support' });
  } else {
    res.render('resolutionDetails', { employeeDept: employee?.department || 'Employee' });
  }
})

// Employee: get single complaint (JSON)
router.get('/complaints/:complaintNumber', isLogedIn, isEmployee, getComplaintWithAllData)

// Employee: verify / assign / update / delete actions
const Employee = require('../models/employee');
const Sla = require('../models/sla');

router.post('/complaints/:complaintNumber/action', isLogedIn, isEmployee, async (req, res) => {
  try {
    const User = require('../models/user');
    const Employee = require('../models/employee');

    // Get current employee
    const currentUser = await User.findOne({ username: req.user.username });
    const currentEmployee = await Employee.findOne({ user: currentUser._id });

    if (!currentEmployee) {
      return res.status(403).json({ message: 'Only registered employees can perform actions' });
    }

    const { 
      verificationStatus, 
      resolutionStatus, 
      currentStep, 
      assignedDepartment, 
      assignedTo,
      verificationDepartment,
      verificationAssignedTo,
      resolutionDepartment,
      resolutionAssignedTo,
      priority,
      internalNotes, 
      action 
    } = req.body || {};

    const Complaint = require('../models/complaint');
    const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber });
    if (!complaint) return res.status(404).json({ message: 'No complaint found' });

    // Permission Check: If not Support, must be assigned to them
    const isSupport = currentEmployee.department === 'Support';
    const isAssignedToMe = (
      String(complaint.assignedTo) === String(currentEmployee._id) ||
      String(complaint.verificationAssignedTo) === String(currentEmployee._id) ||
      String(complaint.resolutionAssignedTo) === String(currentEmployee._id)
    );

    if (!isSupport && !isAssignedToMe) {
      return res.status(403).json({ message: 'You are not authorized to update this complaint' });
    }

    // SLA extraction
    let slaSteps = [];
    if (complaint.productType) {
      const maybeObjectId = complaint.productType.match(/^[a-fA-F0-9]{24}$/) ? complaint.productType : null;
      if (maybeObjectId) {
        const slaDoc = await Sla.findOne({ productId: maybeObjectId }).lean();
        slaSteps = slaDoc?.steps || [];
      }
    }

    if (isSupport) {
      // Support can only verify, assign, or reject
      if (verificationStatus) complaint.verificationStatus = verificationStatus;
      
      // Support handles assignment fields
      if (assignedDepartment !== undefined) complaint.assignedDepartment = assignedDepartment;
      if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
      if (verificationDepartment !== undefined) complaint.verificationDepartment = verificationDepartment;
      if (verificationAssignedTo !== undefined) complaint.verificationAssignedTo = verificationAssignedTo || null;
      if (resolutionDepartment !== undefined) complaint.resolutionDepartment = resolutionDepartment;
      if (resolutionAssignedTo !== undefined) complaint.resolutionAssignedTo = resolutionAssignedTo || null;
      
      if (priority) complaint.priority = priority;
      if (currentStep) complaint.currentStep = currentStep;

      if (action === 'verify') {
        if (slaSteps?.length) {
          complaint.currentStep = slaSteps[0]?.stepName || slaSteps[0]?.step || complaint.currentStep;
        }
      } else if (action === 'assign') {
        complaint.currentStep = currentStep || (slaSteps?.[1]?.stepName || slaSteps?.[1]?.step || complaint.currentStep);
      }
    } else {
      // Non-Support (Resolution Staff) can resolve, close, or update progress
      if (resolutionStatus) complaint.resolutionStatus = resolutionStatus;
      if (currentStep) complaint.currentStep = currentStep;
    }

    if (internalNotes !== undefined) complaint.internalNotes = internalNotes;

    // If closed/resolved set resolvedAt
    if (complaint.resolutionStatus === 'Resolved' || complaint.resolutionStatus === 'Closed') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    return res.status(200).json({ message: 'Complaint updated', complaintNumber: complaint.complaintNumber });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update complaint', error: e.message });
  }
})

router.delete('/complaints/:complaintNumber/delete', isLogedIn, isEmployee, async (req, res) => {
  try {
    const User = require('../models/user');
    const Employee = require('../models/employee');
    const currentUser = await User.findOne({ username: req.user.username });
    const currentEmployee = await Employee.findOne({ user: currentUser._id });

    if (!currentEmployee || currentEmployee.department !== 'Support') {
      return res.status(403).json({ message: 'Only Support department can delete complaints' });
    }

    const Complaint = require('../models/complaint');
    const deleted = await Complaint.findOneAndDelete({ complaintNumber: req.params.complaintNumber });
    if (!deleted) return res.status(404).json({ message: 'No complaint found' });
    return res.status(200).json({ message: 'Complaint deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete complaint', error: e.message });
  }
})

// Optional: SLA preview endpoint
router.get('/sla', isLogedIn, isEmployee, async (req, res) => {
  try {
    const { productId } = req.query;
    const steps = await Sla.findOne({ productId }).lean();
    return res.status(200).json({ steps: steps?.steps || [] });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch SLA', error: e.message });
  }
});

// Employee: list unique departments
router.get('/departments', isLogedIn, isEmployee, async (req, res) => {
  try {
    const Employee = require('../models/employee');
    const departments = await Employee.distinct('department');
    return res.status(200).json(departments.filter(Boolean));
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch departments', error: e.message });
  }
});

// Employee: list all employees for assignment (filtered by department if provided)
router.get('/employees', isLogedIn, isEmployee, async (req, res) => {
  try {
    const { department } = req.query;
    const Employee = require('../models/employee');
    const filter = department ? { department } : {};
    const employees = await Employee.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json(employees);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch employees', error: e.message });
  }
});


module.exports = router

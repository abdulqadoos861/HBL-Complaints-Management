const Complaint = require('../models/complaint')

const buildComplaintResponse = (complaint) => {
  if (!complaint) return null

  return {
    complaintNumber: complaint.complaintNumber,
    name: complaint.name,
    cnic: complaint.cnic,
    mobile: complaint.mobile,
    email: complaint.email,

    productType: complaint.productType,
    category: complaint.category,
    subject: complaint.subject,
    description: complaint.description,
    details: complaint.details,

    supportingDocs: complaint.supportingDocs,
    attachments: complaint.attachments,

    verificationStatus: complaint.verificationStatus,
    resolutionStatus: complaint.resolutionStatus,
    currentStep: complaint.currentStep,
    priority: complaint.priority,

    assignedDepartment: complaint.assignedDepartment,
    assignedTo: complaint.assignedTo,

    verificationDepartment: complaint.verificationDepartment,
    verificationAssignedTo: complaint.verificationAssignedTo,
    resolutionDepartment: complaint.resolutionDepartment,
    resolutionAssignedTo: complaint.resolutionAssignedTo,

    internalNotes: complaint.internalNotes,

    resolvedAt: complaint.resolvedAt
  }
}

// GET /api/complaints/:complaintNumber
exports.getComplaintWithAllData = async function (req, res) {
  try {
    const { complaintNumber } = req.params

    if (!complaintNumber) {
      return res.status(400).json({ message: 'complaintNumber is required' })
    }

    const complaint = await Complaint.findOne({ complaintNumber }).lean()
    if (!complaint) {
      return res.status(404).json({ message: 'No complaint found for this number' })
    }

    return res.status(200).json(buildComplaintResponse(complaint))
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get complaint', error: err.message })
  }
}

// GET /api/complaints
// Optional: support ?cnic= ?mobile= ?email=
exports.getAllComplaints = async function (req, res) {
  try {
    const { cnic, mobile, email, name } = req.query
    const User = require('../models/user');
    const Employee = require('../models/employee');

    // Get current employee
    const user = await User.findOne({ username: req.user.username });
    const employee = await Employee.findOne({ user: user._id });

    const filter = {}
    if (cnic) filter.cnic = cnic
    if (mobile) filter.mobile = mobile
    if (email) filter.email = email
    if (name) filter.name = name

    // Role-based filtering
    if (employee) {
      if (employee.department === 'Support') {
        // Support only sees unverified complaints by default
        filter.verificationStatus = 'Pending';
      } else {
        // Others see complaints assigned to them
        filter.$or = [
          { assignedTo: employee._id },
          { verificationAssignedTo: employee._id },
          { resolutionAssignedTo: employee._id }
        ];
      }
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean()

    return res.status(200).json(complaints.map(buildComplaintResponse))
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get complaints', error: err.message })
  }
}




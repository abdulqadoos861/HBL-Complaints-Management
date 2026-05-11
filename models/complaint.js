const { default: mongoose } = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintNumber: String,

  name: String,
  cnic: String,
  mobile: String,
  email: String,
  productType: String,
  category: String,
  subject: String,
  description: String,
  details: {
    type: Object
  },
  supportingDocs: [String],

 
  attachments: [String],

  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },

  resolutionStatus: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },

  currentStep: {
    type: String,
    enum: [
      'Submitted',
      'Under Verification',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed'
    ],
    default: 'Submitted'
  },

  assignedDepartment: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  verificationDepartment: String,
  verificationAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  resolutionDepartment: String,
  resolutionAssignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },


  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  internalNotes: String,

  resolvedAt: Date

});

module.exports = mongoose.model('complaint' , complaintSchema)
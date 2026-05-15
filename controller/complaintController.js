const Complaint = require('../models/complaint');
const employee = require('../models/employee');
const Employee = require('../models/employee');
const Sla = require('../models/sla');
const updateModel = require('../models/update')
const jwt = require('jsonwebtoken')
const User = require('../models/user');

async function getcurrentemployee(req){
    const token = req.cookies.token;
    if (!token){
        return null;
    }
    else{
        const data = jwt.verify(token , process.env.JWT_KEY);
        const username = data.username;
        const user = await User.findOne({username: username});
        const cur_employee = await Employee.findOne({user:user._id})
        if (!cur_employee){ 
            return null;
        }
        else{
            return cur_employee;
        }
    }
}

async function getcurrentuser(req){
    const token = req.cookies.token;
    if (!token){
        return null;
    }
    else{
        const data = jwt.verify(token , process.env.JWT_KEY);
        return data.username;
    }
}

exports.createComplaint = async function(req, res) {
    try {
        const complaintNumber = await generateComplaintNumber();

        const attachments = (req.files || []).map(f => f.filename)

        const complaint = new Complaint({
            complaintNumber,

            name: req.body.name,
            cnic: req.body.cnic,
            mobile: req.body.mobile,
            email: req.body.email,

            productType: req.body.productType,
            category: req.body.category,
            subject: req.body.subject,
            description: req.body.description,

            details: req.body.details ? JSON.parse(req.body.details) : {},

            // multipart form sends supportingDocs as JSON string (basic UI sends []).
            supportingDocs: typeof req.body.supportingDocs === 'string'
                ? JSON.parse(req.body.supportingDocs)
                : (req.body.supportingDocs || []),

            attachments,

            assignedDepartment: "",
            internalNotes: ""
        });

        await complaint.save();

        // Send Confirmation Email (Non-blocking)
        if (req.body.email) {
            const { sendMail } = require('../utils/mailer');
            sendMail(
                req.body.email,
                `Complaint Registered: ${complaintNumber}`,
                `Dear ${req.body.name},\n\nYour complaint has been successfully registered.\nYour Complaint Tracking Number is: ${complaintNumber}\n\nYou can use this number to track the status of your complaint at any time.\n\nRegards,\nHBL Support Team`,
                `<h3>Complaint Successfully Registered</h3><p>Dear ${req.body.name},</p><p>Your complaint regarding <strong>${req.body.subject}</strong> has been successfully registered.</p><p>Your Complaint Tracking Number is: <strong style="font-size:1.2em;color:#008269;">${complaintNumber}</strong></p><p>You can use this number to track the status of your complaint on our portal.</p><br><p>Regards,<br>HBL Support Team</p>`
            ).catch(err => console.error("Failed to send complaint confirmation email:", err.message));
        }

        res.status(201).json({
            message: "Complaint registered successfully",
            complaint
        });

    } catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
};



async function generateComplaintNumber() {
    let complaintNumber;
    let exists = true;

    while (exists) {
        complaintNumber = "HBL-" + Math.floor(1000000 + Math.random() * 9000000);

        exists = await Complaint.findOne({ complaintNumber });
    }

    return complaintNumber;
}

exports.getemployees = async function (req,res){
    try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const employees = await Employee.find(filter).sort({ name: 1 }).lean();
    return res.status(200).json(employees);
  } 
  catch (e) {
    return res.status(500).json({ message: 'Failed to fetch employees', error: e.message });
  }

}

exports.getdepartments = async function (req,res){
    try {
        const departments = await Employee.distinct('department');
        return res.status(200).json(departments.filter(Boolean));
      } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch departments', error: e.message });
      }
    }

exports.getsla = async function (req,res) {
      try {
        const { productId } = req.query;
        const steps = await Sla.findOne({ productId }).lean();
        return res.status(200).json({ steps: steps?.steps || [] });
      } 
      catch (e) {
        return res.status(500).json({ message: 'Failed to fetch SLA', error: e.message });
      } 
}


const buildComplaintResponse = (complaint) => {
  if (!complaint) return null

  return {
    _id : complaint._id,
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

exports.getAllComplaints = async function (req, res) {
  try {
    const { cnic, mobile, email, name } = req.query
    const User = require('../models/user');
    const Employee = require('../models/employee');

    // Role-based filtering
    let filter = {};
    if (cnic) filter.cnic = cnic;
    if (mobile) filter.mobile = mobile;
    if (email) filter.email = email;
    if (name) filter.name = name;

    if (req.user.role === 'admin') {
    } else if (req.user.role === 'employee') {
      const user = await User.findOne({ username: req.user.username });
      const employee = await Employee.findOne({ user: user._id });

      if (!employee) {
        console.warn(`Employee profile not found for user: ${req.user.username}`);
        return res.status(200).json([]); // Return nothing if profile missing
      }

      if (employee.department && employee.department.trim().toLowerCase() === 'support') {
        // Support sees pending/unverified items
        filter.verificationStatus = 'Pending';
      } else {
        // Regular employees ONLY see complaints assigned to them
        filter.$or = [
          { assignedTo: employee._id },
          { verificationAssignedTo: employee._id },
          { resolutionAssignedTo: employee._id }
        ];
      }
    } else {
      // Customers or unknown roles see nothing through this endpoint
      return res.status(200).json([]);
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json(complaints.map(buildComplaintResponse));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get complaints', error: err.message });
  }
}


exports.getComplaintWithAllData = async function (req, res) {
  try {
    const idParam = req.params._id || req.params.complaintNumber;
    let complaint = null;
    try {
      complaint = await Complaint.findById(idParam)
        .populate('assignedTo', 'name department designation')
        .populate('verificationAssignedTo', 'name department designation')
        .populate('resolutionAssignedTo', 'name department designation')
        .lean();
      
      if (complaint) console.log('Found complaint by ID');
    } catch (e) {
      console.log('Not a valid ObjectId, searching by complaintNumber instead');
    }

    if (!complaint) {
      complaint = await Complaint.findOne({ complaintNumber: idParam })
        .populate('assignedTo', 'name department designation')
        .populate('verificationAssignedTo', 'name department designation')
        .populate('resolutionAssignedTo', 'name department designation')
        .lean();
      
      if (complaint) console.log('Found complaint by Number');
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Fetch update history
    const updates = await updateModel.find({ complaintId: complaint._id })
      .populate('updatedBy', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      complaint,
      updates
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get complaint details due to server error',
      error: err.message
    });
  }
}



exports.addcomplaintupdate = async function (req, res) {
    if (req.user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Admins have read-only access to complaints.' });
    }
    const complaintId = req.params.complaintid;
    const { status, attachment, previousstatus, resolationnote } = req.body;

    if(!complaintId){
        return res.status(400).json({
            success: false,
            message: "Complaint ID is required"
        });
    }

    const existed = await Complaint.findOne({ _id: complaintId });
    if(!existed){
        return res.status(400).json({
            success: false,
            message: "Complaint ID is required"
        });
    }

    let username = req.user.username;
    
    const userDoc = await User.findOne({ username }).lean();
    if(!userDoc){
        return res.status(401).json({
            success: false,
            message: "User not found"
        });
    }

    // Handle file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
        attachments = req.files.map(f => ({
            fileName: f.filename,
            fileUrl: `/uploads/${f.filename}`
        }));
    }

    // This update schema references `User` in updatedBy
    const updatePayload = {
        complaintId,
        status,
        updatedBy: userDoc._id,
        attachments,
        previousStatus: previousstatus,
        resolutionNotes: resolationnote
    };

    const update = await updateModel.create(updatePayload);

    if(!update){
        return res.status(400).json("An eror occured while adding update.");
    }

    // Also update the main complaint document's current status and resolution state
    const updateFields = { currentStep: status };
    if (status === 'Closed') {
        updateFields.resolutionStatus = 'Closed';
        updateFields.resolvedAt = new Date();
        updateFields.resolvedBy = userDoc._id;
    } else if (status === 'In Progress' || status === 'Assigned') {
        updateFields.resolutionStatus = status;
    }
    
    await Complaint.findByIdAndUpdate(complaintId, updateFields);

    // Send status update email to customer (Non-blocking)
    if (existed.email) {
        const { sendMail } = require('../utils/mailer');
        const statusLabel = status || 'Updated';
        const note = resolationnote ? `<p><strong>Note from team:</strong> ${resolationnote}</p>` : '';
        sendMail(
            existed.email,
            `Complaint Update: ${existed.complaintNumber} — Status: ${statusLabel}`,
            `Dear ${existed.name},\n\nYour complaint (${existed.complaintNumber}) has been updated.\nNew Status: ${statusLabel}\n${resolationnote ? 'Note: ' + resolationnote + '\n' : ''}\nYou can track your complaint on our portal.\n\nRegards,\nHBL Support Team`,
            `<h3 style="color:#008269;">Complaint Status Updated</h3>
             <p>Dear ${existed.name},</p>
             <p>Your complaint <strong>${existed.complaintNumber}</strong> has been updated by our team.</p>
             <table style="border-collapse:collapse;width:100%;margin:16px 0;">
               <tr style="background:#f4f4f4;"><td style="padding:8px 12px;font-weight:bold;">Complaint No.</td><td style="padding:8px 12px;">${existed.complaintNumber}</td></tr>
               <tr><td style="padding:8px 12px;font-weight:bold;">Subject</td><td style="padding:8px 12px;">${existed.subject}</td></tr>
               <tr style="background:#f4f4f4;"><td style="padding:8px 12px;font-weight:bold;">New Status</td><td style="padding:8px 12px;"><strong style="color:#008269;">${statusLabel}</strong></td></tr>
             </table>
             ${note}
             <p>You can track your complaint on our portal at any time.</p>
             <br><p>Regards,<br>HBL Support Team</p>`
        ).catch(err => console.error('Failed to send update email:', err.message));
    }

    return res.status(200).json({
        message : `update added ${update._id}`
    });
}

exports.verifyComplaint = async function (req, res) {
  try {
    const complaintId = req.params.complaintid;
    const { verificationStatus, assignedDepartment, assignedTo, priority, internalNotes } = req.body;

    const updateData = {
      verificationStatus,
      assignedDepartment,
      assignedTo,
      priority,
      internalNotes,
      currentStep: verificationStatus === 'Verified' ? 'Assigned' : 'Reject'
    };

    const updated = await Complaint.findByIdAndUpdate(complaintId, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Create a history record for this verification/assignment
    try {
      const userDoc = await User.findOne({ username: req.user.username });
      await updateModel.create({
        complaintId: updated._id,
        status: updated.currentStep,
        updatedBy: userDoc ? userDoc._id : null,
        previousStatus: 'Pending',
        resolutionNotes: internalNotes || `Complaint ${verificationStatus} and assigned to ${assignedDepartment}.`
      });
    } catch (updateErr) {
      console.error('Failed to create history record:', updateErr);
    }

    // Send verification email to customer (Non-blocking)
    if (updated.email) {
      const { sendMail } = require('../utils/mailer');
      const isVerified = verificationStatus === 'Verified';
      const statusColor = isVerified ? '#008269' : '#a91b2c';
      const statusLabel = isVerified ? '✅ Verified & Assigned' : '❌ Rejected';
      const deptLine = isVerified && assignedDepartment
        ? `<tr style="background:#f4f4f4;"><td style="padding:8px 12px;font-weight:bold;">Assigned Department</td><td style="padding:8px 12px;">${assignedDepartment}</td></tr>`
        : '';
      const noteLine = internalNotes
        ? `<p><strong>Note:</strong> ${internalNotes}</p>`
        : '';

      sendMail(
        updated.email,
        `Complaint ${isVerified ? 'Verified & Assigned' : 'Rejected'}: ${updated.complaintNumber}`,
        `Dear ${updated.name},\n\nYour complaint (${updated.complaintNumber}) has been ${isVerified ? 'verified and assigned to the ' + assignedDepartment + ' department.' : 'reviewed and unfortunately could not be accepted at this time.'}\n${internalNotes ? 'Note: ' + internalNotes + '\n' : ''}\nYou can track your complaint on our portal.\n\nRegards,\nHBL Support Team`,
        `<h3 style="color:${statusColor};">Complaint ${isVerified ? 'Verified & Assigned' : 'Rejected'}</h3>
         <p>Dear ${updated.name},</p>
         <p>Your complaint has been reviewed by our Support team.</p>
         <table style="border-collapse:collapse;width:100%;margin:16px 0;">
           <tr style="background:#f4f4f4;"><td style="padding:8px 12px;font-weight:bold;">Complaint No.</td><td style="padding:8px 12px;">${updated.complaintNumber}</td></tr>
           <tr><td style="padding:8px 12px;font-weight:bold;">Subject</td><td style="padding:8px 12px;">${updated.subject}</td></tr>
           <tr style="background:#f4f4f4;"><td style="padding:8px 12px;font-weight:bold;">Decision</td><td style="padding:8px 12px;"><strong style="color:${statusColor};">${statusLabel}</strong></td></tr>
           ${deptLine}
         </table>
         ${noteLine}
         <p>You can track your complaint on our portal at any time.</p>
         <br><p>Regards,<br>HBL Support Team</p>`
      ).catch(err => console.error('Failed to send verification email:', err.message));
    }

    return res.status(200).json({
      message: 'Complaint verified and assigned successfully',
      complaint: updated
    });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to verify complaint', error: e.message });
  }
};

exports.customerReply = async function (req, res) {
  try {
    const { complaintId, response } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Create update record
    await updateModel.create({
      complaintId: complaint._id,
      status: 'Pending',
      previousStatus: complaint.currentStep,
      resolutionNotes: `CUSTOMER RESPONSE: ${response}`,
      updatedBy: null // Public reply, or we could link to customer user if logged in
    });

    // Reset complaint status
    complaint.currentStep = 'Pending';
    await complaint.save();

    return res.status(200).json({ message: 'Response submitted successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to submit response', error: e.message });
  }
};

exports.getMyComplaints = async function (req, res) {
    try {
        const user = await User.findOne({ username: req.user.username }).lean();
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const complaints = await Complaint.find({ email: user.email }).sort({ createdAt: -1 }).lean();
        return res.status(200).json(complaints);
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAdminStats = async function (req, res) {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ verificationStatus: 'Pending' });
    const verified = await Complaint.countDocuments({ verificationStatus: 'Verified' });
    const rejected = await Complaint.countDocuments({ verificationStatus: 'Reject' });
    
    const resolved = await Complaint.countDocuments({ 
      currentStep: 'Closed' 
    });
    const inProgress = await Complaint.countDocuments({ resolutionStatus: 'In Progress' });

    // Recent activity (last 6 updates)
    const recentUpdates = await updateModel.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate({
        path: 'complaintId',
        select: 'complaintNumber subject'
      })
      .lean();

    return res.status(200).json({
      total,
      pending,
      verified,
      rejected,
      resolved,
      inProgress,
      recentUpdates
    });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Failed to fetch dashboard stats', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

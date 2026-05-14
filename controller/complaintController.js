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
            console.log('no token Exists')
            return res.render('login')
        }
    else{
        const data = jwt.verify(token , process.env.JWT_KEY);
            console.log(data)
            const username = data.username;
            const user = await User.findOne({username: username});
            const cur_employee = await Employee.findOne({user:user._id})
            if (!cur_employee){
              console.log("No employee exist");  
              return ""
            }
            else{
              return curr_employee;
            }
    }
   
}

async function getcurrentuser(req){
  const token = req.cookies.token;
   if (!token){
            console.log('no token Exists')
            return res.render('login')
        }
    else{
        const data = jwt.verify(token , process.env.JWT_KEY);
            console.log(data)
            const username = data.username;
            console.log(username)
            return username
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
      if (employee.department && employee.department.trim().toLowerCase() === 'support') {
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
    } else if (req.user.role === 'admin') {
        // Admin sees all complaints by default, filter object stays as is (empty or just query params)
        console.log('Admin accessing all complaints');
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 }).lean()

    return res.status(200).json(complaints.map(buildComplaintResponse))
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get complaints', error: err.message })
  }
}


exports.getComplaintWithAllData = async function (req, res) {
  try {
    const idParam = req.params._id || req.params.complaintNumber;
    console.log('Fetching details for Complaint ID/Number:', idParam);
    
    // Try finding by ID first, then by complaintNumber
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
      console.log('Complaint NOT found in database');
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
    console.error('CRITICAL ERROR in getComplaintWithAllData:', err);
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

    let username =  await getcurrentuser(req)
    console.log("username is printed bellow")
    console.log(username)
    
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

    // Also update the main complaint document's current status
    await Complaint.findByIdAndUpdate(complaintId, { 
        currentStep: status 
    });

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
      currentStep: verificationStatus === 'Verified' ? 'Assigned' : 'Closed'
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
        previousStatus: 'Submitted',
        resolutionNotes: internalNotes || `Complaint ${verificationStatus} and assigned to ${assignedDepartment}.`
      });
    } catch (updateErr) {
      console.error('Failed to create history record:', updateErr);
      // We don't block the main response if history fails
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
      status: 'Submitted',
      previousStatus: complaint.currentStep,
      resolutionNotes: `CUSTOMER RESPONSE: ${response}`,
      updatedBy: null // Public reply, or we could link to customer user if logged in
    });

    // Reset complaint status
    complaint.currentStep = 'Submitted';
    await complaint.save();

    return res.status(200).json({ message: 'Response submitted successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to submit response', error: e.message });
  }
};

exports.getMyComplaints = async function (req, res) {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user) return res.redirect('/login');

    const complaints = await Complaint.find({ email: user.email }).sort({ createdAt: -1 }).lean();
    
    if (req.originalUrl.startsWith('/api') || req.xhr) {
      return res.status(200).json(complaints);
    }
    
    res.render('myComplaints', { complaints });
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
};

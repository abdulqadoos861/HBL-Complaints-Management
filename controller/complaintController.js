const Complaint = require('../models/complaint');
const employee = require('../models/employee');
const Employee = require('../models/employee');
const Sla = require('../models/sla');
const updateModel = require('../models/update')


async function getEmployeeDetails(userid){
    const employee = await Employee.findOne({user : userid})
    if (!employee){
        return " "
    }
    else{
        return employee
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


// exports.getComplaintWithAllData = async function (req, res) {
//   try {
//     const { _id } = req.params

//     if (!_id) {
//       return res.status(400).json({ message: 'complaintNumber is required' })
//     }

//     const complaint = await Complaint.findOne({_id : _id }).lean()
//     if (!complaint) {
//       return res.status(404).json({ message: 'No complaint found for this number' })
//     }

//     return res.status(200).json(buildComplaintResponse(complaint))
//   } catch (err) {
//     return res.status(500).json({ message: 'Failed to get complaint', error: err.message })
//   }
// }


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


exports.getComplaintWithAllData = async function (req, res) {

  try {

    const complaintId = req.params._id;

    if (!complaintId) {

      return res.status(400).json({
        success: false,
        message: 'Complaint ID is required'
      });

    }

    const complaint = await Complaint.findById({_id : complaintId})

      .populate('assignedTo', 'name department designation')
      .populate('verificationAssignedTo', 'name department designation')
      .populate('resolutionAssignedTo', 'name department designation')

      .lean();

    if (!complaint) {

      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });

    }

    return res.status(200).json({
      success: true,
      complaint
    });

  }

  catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Failed to get complaint',
      error: err.message
    });

  }

}

exports.addcomplaintupdate = async function(req,res){
    const complaintId = req.params.complaintid;
    const {status , userid , attachment,previousstatus, resolationnote} = req.body;
    if(!complaintId){
        return res.status(400).json({
            success: false,
            message: "Complaint ID is required"
        })
    }
    const existed = await Complaint.findOne({_id : complaintId})
    if(!existed){
        return res.status(400).json({
            success: false,
            message: "Complaint ID is required"
        })
    }
    const employeedata = getEmployeeDetails(userid);
    const employeename = employeedata.name;
    const update = await updateModel.create({
        complaintId : complaintId,
        status : status,
        updatedBy : employeename,
        attachments : attachment,
        previousStatus : previousstatus,
        resolutionNotes: resolationnote
    })
    if(!update){
        return res.status(400).json("An eror occured while adding update.")
    }
    else{
        return res.status(200).json({
            message : `update added ${update}`
        })
    }

    

}
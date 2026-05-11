const Complaint = require('../models/complaint');

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
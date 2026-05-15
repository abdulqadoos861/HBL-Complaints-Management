const mongoose = require("mongoose");

const complaintUpdateSchema = new mongoose.Schema({
    
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "complaint",
        required: true
    },
    status: {
        type: String,
        enum: [
            "Pending",
            "Reject",
            "Verified",
            "Assigned",
            "In Progress",
            "Closed"
        ],
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    attachments: [
        {
            fileName: String,
            fileUrl: String
        }
    ],
    previousStatus: {
        type: String
    },
    resolutionNotes: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("update", complaintUpdateSchema);
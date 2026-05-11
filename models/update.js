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
            "Submitted",
            "Assigned",
            "In Progress",
            "Pending Customer Response",
            "Resolved",
            "Closed"
        ],
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
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
const mongoose = require('mongoose');
const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  department: {
    type: String
  },

  designation: {
    type: String
  },

  user: {
    type: String,
    ref: 'User',
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
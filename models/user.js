const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username :{
    type : String,
    required: true, 
    unique : true ,
    lowercase : true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
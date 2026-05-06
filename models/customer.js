const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
const customerSchema = new mongoose.Schema({
  customer_id: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  cnic: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  account_number: {
    type: String,
    required: true
  },

  card_last4: {
    type: String
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});

module.exports = mongoose.model('Customer', customerSchema);
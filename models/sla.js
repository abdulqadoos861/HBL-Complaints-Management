const mongoose = require('mongoose')

const slaSchema = new mongoose.Schema({
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'
    },
    steps:[]
});
module.exports = mongoose.model('sla',slaSchema);
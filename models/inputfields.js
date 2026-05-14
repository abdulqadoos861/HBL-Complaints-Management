const mongoose = require('mongoose')

const inputFieldsSchema = mongoose.Schema({
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'
    },
    label :{type : String,required : true},
    name:{type : String, required : true,},
    type : String,
    required : Boolean,
    options :[],
    palceholder : String,
    order : Number,
    categoryName : String
});

module.exports = mongoose.model('inputFields',inputFieldsSchema)
const mongoose = require('mongoose');

const product_schema = new mongoose.Schema({
    slug:{
        type:String,
        required :true,
        lower:true,
        unique: true
    },
    label :{
        type:String,
        required:true
    },
    is_active:{
        type : Boolean,
        required:true
    },
    categories:{
        type : []
    },
    created_at:{
        type : Date,
        default : Date.now()
    },
    updated_at:{
        type : Date
    }
});

module.exports = mongoose.model('product' , product_schema)
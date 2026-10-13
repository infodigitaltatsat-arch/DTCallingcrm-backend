const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        
    },
    email:{
        type:String,
        default:"",
        trim:true,
        lowercase:true,
    },
    source:{
        type:String,
        enum:["Website","Campaign","Referral","Manual"],
        default:"Website",
    },
    status:{
        type:String,
        enum:["New","Interested","Follow-up","Converted","Lost"],
        default:"New"
    },

},
{timestamps:true}
);
module.exports = mongoose.model("Lead",leadSchema);
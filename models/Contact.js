const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    phone: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,

    },
    company: {
        type: String,
        default: "",
        trim: true,

    },
    notes: {
        type: String,
        default: "",
        trim: true,

    },
},
{ timestamps: true }

)

module.exports = mongoose.model("Contact", contactSchema);
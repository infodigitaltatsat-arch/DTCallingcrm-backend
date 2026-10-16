const mongoose = require('mongoose');


const followUpSchema = new mongoose.Schema({
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact",
        required: true,


    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    scheduledAt: {
        type: Date,
        required: true

    },
    notes: {
        type: String,
        default: "",
        trim: true 

    },
    status: {
        type: String,
        enum: ["Completed", "Pending", "Cancelled"],
        default: "Pending"

    }
},
    { timestamps: true }
)

module.exports = mongoose.model("FollowUp", followUpSchema)
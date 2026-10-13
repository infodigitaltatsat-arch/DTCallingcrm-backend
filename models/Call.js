const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
    {
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
        phone: {
            type: String,
            required: true,
            trim: true,

        },
        status: {
            type: String,
            enum: ["Completed", "Missed", "Busy", "Failed"],
            required: true,

        },
        duration: {
            type: Number,
            default: 0,
            min: 0,

        },
        notes: {
            type: String,
            default: "",
            trim: true,

        },
        calledAt: {
            type: Date,
            default: Date.now,

        }

    },
    { timestamps: true },
);

module.exports = mongoose.model("Call", callSchema)
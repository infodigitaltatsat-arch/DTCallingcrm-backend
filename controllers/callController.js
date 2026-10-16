const mongoose = require('mongoose');
const Call = require('../models/Call');
const Contact = require('../models/Contact');

const getCalls = async (req, res) => {
    try {
        const calls = await Call.find()
            .populate("contact", "name email")
            .populate("agent", "name email")
            .sort({ calledAt: -1 });

        res.status(200).json({
            success: true,
            count: calls.length,
            calls,
        })
    }
    catch (error) {
        console.error("Get calls error: ", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch call history"
        })
    }
};


const getCallById = async (req, res) => {
    try {
        const id  = req.params.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Entre valid ID"
            })
        }

        const call = await Call.findById(id)
            .populate("contact", "name email")
            .populate('agent', "name email");

        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call record not found"
            });
        }

        res.status(200).json({
            success: true,
            call,
        })

    }
    catch (error) {
        console.error("Get call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch call records"
        })
    }
};

const createCall = async (req, res) => {
    try {
        const { contact, phone, status, duration, notes, calledAt } = req.body || {};

        if (!contact || !mongoose.isValidObjectId(contact)
            || typeof phone !== "string" ||
            !phone.trim() || !["Initialized","Completed", "Missed", "Busy", "Failed"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid contact, phone and status are required"
            })
        }

        if (duration !== undefined && (!Number.isFinite(duration) || duration < 0)) {
            return res.status(400).json({
                success: false,
                message: "Duration must be a non-negative number"
            })
        }

        if (notes !== undefined && typeof notes !== "string") {
            return res.status(400).json({
                success: false,
                message: "Notes must be text"
            })
        }

        if (calledAt !== undefined && (Number.isNaN(Date.parse(calledAt)) ||
            typeof calledAt !== "string"
        )) {
            return res.status(400).json({
                success: false,
                message: "calledAt must be a valid date string"
            })

        }

        const existingContact = await Contact.findById(contact);
        if (!existingContact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            })
        }

        const call = await Call.create({
            contact,
            agent: req.user.id,
            phone: phone.trim(),
            status,
            duration: duration ?? 0,
            notes: notes?.trim() ?? "",
            ...(calledAt ? { calledAt: new Date(calledAt) } : {})
        })

        const populatedCall = await Call.findById(call._id)
        .populate("contact","name email")
        .populate("agent", "name email");

        res.status(201).json({
            success:true,
            message:"Call record created successfully",
            call:populatedCall,
        })

    }
    catch(error){
        console.error("Create call error:",error);
        res.status(500).json({
            success:false,
            message:"Failed to create call record",
        })
    }
}

module.exports = {
    getCalls,
    getCallById,
    createCall,
}
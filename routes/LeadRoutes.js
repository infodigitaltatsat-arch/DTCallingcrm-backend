const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const allowedSources = [
    "Website",
    "Campaign",
    "Referral",
    "Manual",
];

const allowedStatuses = [
    "New",
    "Interested",
    "Follow-up",
    "Converted",
    "Lost",
];

router.use(protect);



router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            leads,
        });
    }
    catch (error) {
        console.log("Fetch leads error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leads"
        });
    }
});


// post /api/leads
// create a new lead

router.post('/', async (req, res) => {
    try {
        const { name, phone, email, source } = req.body;
        if (

            typeof name !== "string" || !name.trim() ||
            typeof phone !== "string" || !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required"
            });
        }

        const leadSource = source || "Website";

        if (
            typeof leadSource != "string" ||
            !allowedSources.includes(leadSource)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead source",
                allowedSources,
            })
        }

        const lead = await Lead.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email?.trim() || "",
            source: leadSource,
        });
        res.status(201).json({
            success: true,
            message: "Lead added successfully",
            lead,
        });

    }
    catch (error) {
        console.log("Create lead error:", error.message);
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid lead data",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to add lead"
        })
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead ID",
            })
        }


        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid lead status",
                allowedStatuses,
            })
        }

        const lead = await Lead.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true, }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lead status updated",
            lead,
        })

    }
    catch (error) {
        console.log("update lead status error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update lead",
        })
    }
});

module.exports = router;                                             
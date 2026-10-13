const mongoose = require('mongoose');
const Contact = require('../models/Contact');

// get /api/contact


const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            contacts,
        });
    } catch (error) {
        console.error("Get contact error: ", error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch the contacts'
        });
    }
}


// find GET contact /api/contact
const getContactById = async (req, res) => {
    try {

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact id"
            })
        }

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }
        res.status(200).json({
            success: true,
            contact
        })
    }
    catch (error) {
        console.error("Get contact error: ", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contact"
        })
    }

};


// post /api/contact /create contact

const createContact = async (req, res) => {
    try {
        const { name, phone, email, company, notes } = req.body || {};

        if (
            typeof name !== "string" || !name.trim() ||
            typeof phone !== "string" || !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name and phone number are required"
            })
        }

        if (
            [email, company, notes].some(
                (value) => value != null && typeof value !== "string"
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Email, company and notes must be string"
            })
        }

        const contact = await Contact.create({
            name: name.trim(),
            email: email?.trim(),
            phone: phone.trim(),
            company: company?.trim() || "",
            notes: notes?.trim() || "",

        });
        return res.status(201).json({
            success: true,
            message: "Contact created successfully",
            contact,
        });

    } catch (error) {
        console.error("Created contact error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create contact"
        });
    }
}


// Patch /api/contact/:id

const updateContact = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"

            })
        }

        const allowedFields = ["name","email","phone","company","notes"];
        const updates = {};
        const body = req.body || {};

        for(const field of allowedFields){
            if(Object.prototype.hasOwnProperty.call(body, field)){
                if(typeof body[field]!=="string"){
                    return res.status(400).json({
                        success:false,
                        message:`${field} must be a string`
                    })
                }
                updates[field] = body[field].trim();
            }
        }

        if(Object.keys(updates).length === 0){
            return res.status(400).json({
                success:false,
                message:"Provide at least one valid filed to update"
            })
        }

        if(updates.name !== undefined && !updates.name){
            return res.status(400).json({
                success:false,
                message:"Name cannot be empty",
            })
        }

        if(updates.phone !== undefined && !updates.phone){
            return res.status(400).json({
                success:false,
                message:"Phone number cannot be empty"
            })
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new:true,
                runValidators:true,
            }
        );

        if(!contact){
            return res.status(404).json({
                success:false,
                message:"Contact not found",
            })
        }

        return res.status(200).json({
            success:true,
            message:"Contact updated successfully",
            contact,
        })
    }catch(error){
        console.error("Update contact error:", error.message);
        return res.status(500).json({
            success:false,
            message:"Failed to update Contact"
        })
    }
};

// DELETE /api/contact/:id
const deleteContact = async(req,res)=>{
    try{
        if(!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).json({
                success:false,
                message:"Invalid contact ID"
            })
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);
        if(!contact){
            return res.status(404).json({
                success:false,
                message:"Contact not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Contact deleted successfully"
        })
    }
    catch(error){
        console.log("Delete contact error:",error.message);
        return res.status(500).json({
            success:false,
            message:"Failed to delete contact"
        });
    }
};


module.exports = {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
}
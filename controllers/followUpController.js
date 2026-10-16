const mongoose = require('mongoose');
const FollowUp = require('../models/FollowUp');
const Contact = require('../models/Contact');

const getFollowUps = async (req,res)=>{
    try{
        const {status} = req.query;
        const filter = {} ;
        if(status){
            if(!["Pending","Completed","Cancelled"].includes(status)){
                return res.status(400).json({
                    success:false,
                    message:"Invalid follow-up status"
                })
            }
            filter.status = status;
        }

        const followUps = await FollowUp.find(filter)
        .populate("contact", "name phone email company")
        .populate("agent","name email");

        res.status(200).json({
            success:true,
            count:followUps.length,
            followUps,
        })
    }
    catch(error){
        console.error("Get follow-ups error: ",error);
        res.status(500).json({
            success:false,
            message:"Failed to fetch follow-ups",
        })
    }
}


const getFollowUpById = async(req,res)=>{
    try{
        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid follow-up ID"
            })
        }

        const followUp = await FollowUp.findById(id)
        .populate("contact","name phone email company")
        .populate('agent', "name email");

        if(!followUp){
            return res.status(404).json({
                success:false,
                message:"Follow-up not found"
            })
        }

        res.status(200).json({
            success:true,
            followUp
        })
    }
    catch(error){
        console.error("Get follow-up error",error)
        return res.status(500).json({
            success:false,
            message:"Failed to fetch follow-up"
        })
    }
}


const createFollowUp = async(req,res)=>{
    try{
        const {contact, scheduledAt, notes} = req.body || {};

        if(!contact || !mongoose.isValidObjectId(contact) || 
     typeof scheduledAt !== "string" || Number.isNaN(Date.parse(scheduledAt))){
            return res.status(400).json({
                success:false,
                message:"Valid contact ID and scheduledAt date are required"
            })
        }

        if(notes !== undefined && typeof notes !== "string"){
            return res.status(400).json({
                success:false,
                message:"Notes must be text"
            })
        }

        const existingContact = await Contact.findById(contact);

        if(!existingContact){
            return res.status(404).json({
                success:false,
                message:"Contact not found"
            })
        }

        const followUp = await FollowUp.create({
            contact,
            agent:req.user.id,
            scheduledAt:new Date(scheduledAt),
            notes:notes?.trim() ?? "",
        })

        const populateFollowUp = await FollowUp.findById(followUp._id)
        .populate("contact","name phone email company")
        .populate("agent","name email");

        res.status(201).json({
            success:true,
            message:"Follow-up created successfully",
            followUp:populateFollowUp,
        });
    }
    catch(error){
        console.error("Create follow-up error",error);
        res.status(500).json({
            success:false,
            message:"Failed to create follow-up"
        });
    }
}


const updateFollowUp = async(req,res)=>{
    try{
        const {id} = req.params;

       if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid follow-up ID"
            })
        }

        const {scheduledAt, notes, status} = req.body || {};
        const updates = {};

        if(scheduledAt !== undefined){
            if(typeof scheduledAt !== "string" || Number.isNaN(Date.parse(scheduledAt))){
                return res.status(400).json({
                    success:false,
                    message:"scheduledAt must be a valid date string",
                })
            }
            updates.scheduledAt = new Date(scheduledAt)
        }

        if(notes !== undefined){
            if(typeof notes !== "string"){
                return res.status(400).json({
                    success:false,
                    message:"Notes must be text"
                })
            
            }
            updates.notes = notes.trim();
        }

        if(status !== undefined){
            if(!["Pending","Completed","Cancelled"].includes(status)){
                return res.status(400).json({
                    success:false,
                    message:"Invalid follow-up status"
                })
            }
            updates.status = status;
        }

        if(Object.keys(updates).length === 0){
            return res.status(400).json({
                success:false,
                message:'Provide at least one valid field to update'
            })
        }

        const followUp = await FollowUp.findByIdAndUpdate(id, updates, {
            new:true,
            runValidators:true,
        })
        .populate("contact", "name phone email company")
        .populate("agent", "name email");

        if(!followUp){
            return res.status(400).json({
                success:false,
                message:"Follow-up not found"
            })
        }

        res.status(200).json({
            success:true,
            message:"Follow-up updated successfully",
            followUp,
        })

        
    }
    catch(error){
        console.error("Update follow-up error: ", error)
        return res.status(500).json({
            success:false,
            message:"Failed to update follow-up"
        })
    }
}


const deleteFollowUp = async(req,res)=>{
    try{
        const {id} = req.params;

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({
                success:false,
                message:"Invalid follow-up ID"
            })
        }

        const followUp = await FollowUp.findByIdAndDelete(id);

        if(!followUp){
            return res.status(404).json({
                success:false,
                message:"Follow-up not found"
            })
        }

        res.status(200).json({
            success:true,
            message:"Follow-up deleted successfully"
        });
    }
    catch(error){
        console.error("Delete follow-up error: ",error)
        return res.status(500).json({
            success:false,
            message:"Failed to delete follow-up"
        })
    }
}

module.exports = {
    getFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,

}
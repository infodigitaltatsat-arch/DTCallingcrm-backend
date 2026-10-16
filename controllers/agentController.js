const User = require('../models/User');

const getAgents = async (req, res) => {
    try {
        const agents = await User.find({
            role: "agent"
        }).select("name email role isActive createdAt").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: agents.length,
            agents,
        })

    } catch(error){
        console.error("Get agents error :", error.message);
        return res.status(500).json({
            success:false,
            message:"Failed to fetch agents"
        })
    }
}

module.exports = {getAgents}
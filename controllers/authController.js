const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const generateToken = (userId) =>{
    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )
}

const register = async (req,res)=>{
    try{
        const {name,email,password} = req.body || {};

        if(
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ){
            return res.status(400).json({
                success:false,
                message:"Name, Email and password are required"
            })
        }

        if(password.length < 6){
            return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters"
            })
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)){
            return res.status(400).json({
                success:false,
                message:"A valid email address is required"
            })
        }

        const existingUser = await User.findOne({email:normalizedEmail});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist please login"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name:normalizedName,
            email:normalizedEmail,
            password:hashedPassword,
            role:"agent",
        })

        const token = generateToken(user._id);

        return res.status(201).json({
            success:true,
            message:"Registration successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        })
    }
    catch(error){
        if(error.code === 11000){
            return res.status(409).json({
                success:false,
                message:"Email is already registered"
            })
        }
        console.error("Registration error:", error.message);

        return res.status(500).json({
            success:false,
            message:"Server error during registration"
        })
    }
    
};


const login = async (req,res)=>{
    try{
        const {email, password} = req.body || {};

        if(typeof email !== "string" || typeof password !== "string" || !email.trim() || !password){
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
            })
        }

        const normalizeEmail = email.trim().toLowerCase();
        const user = await User.findOne({
            email:normalizeEmail,

        }).select("+password");

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({
                success:false,
                message:"Invalid email or password",
            });
        }

        if(!user.isActive){
            return res.status(403).json({
                success:false,
                message:"Your account is inactive"
            })
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        });
    }
    catch(error){
        console.error("Login error:",error.message);

        return res.status(500).json({
            success:false,
            message:"Server error during login"
        })
    }
}


module.exports = {register, login};
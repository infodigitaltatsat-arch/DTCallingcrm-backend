const express = require('express');
const {register, login} = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register',(req,res,next)=>{
    if(process.env.ALLOW_PUBLIC_REGISTRATION !== 'true'){
        return res.status(403).json({success:false,message:'Registration is disabled'});
    }
    next();
},register);
router.post('/login',login);

// return the current logged in user details

router.get('/me',protect,(req,res)=>{
    res.status(200).json({
        success:true,
        user:req.user,
    })
});

module.exports = router;

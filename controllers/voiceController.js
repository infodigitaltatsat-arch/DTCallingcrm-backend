const twilio = require('twilio');

const TRIAL_VOICE_TEMPLATE_URL = 'https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech';

// automated voice call
// only pays the message
// do not connect real audio from browser to recipient
const startTrialCall =async(req,res)=>{
    try{
        const {to} = req.body || {};
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const callerId = process.env.TWILIO_CALLER_ID;


        if(!accountSid || !authToken || !callerId){
            return res.status(503).json({
                success:false,
                message:"Twilio configuration is incomplete. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_CALLER_ID."
            });
        }


        if(typeof to !== "string" || !/^\+[1-9]\d{7,14}$/.test(to.trim())){
            return res.status(400).json({
                success:false,
                message:"Enter the destination number in international format"
            })
        }

        const client = twilio(accountSid, authToken);

        const call = await client.calls.create({
            to:to.trim(),
            from:callerId,
            url:TRIAL_VOICE_TEMPLATE_URL,
        });

        return res.status(201).json({
            success:true,
            message:"Twilio accepted the test call. This is an automated message, not a live agent-to-contact conversation.",
        call:{
            sid:call.sid,
            status:call.status,
            to:call.to,
            from:call.from,
        }
        })
    }
    catch(error){
        console.error("Twilio trial call error :",error.message)
    return res.status(502).json({
        success:false,
        message:error.message || "Twilio could not start the trial call",
    })
    
    }
}

module.exports = {startTrialCall};
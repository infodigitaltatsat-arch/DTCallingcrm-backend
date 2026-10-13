require('dotenv').config()

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/LeadRoutes');
const {protect} = require('./middleware/authMiddleware');
const contactRoutes = require('./routes/contactRoutes')
const callRoutes = require('./routes/callRoutes')



const app = express();

app.use(cors({origin: process.env.CLIENT_URI || "http://localhost:5173"}));
app.use(express.json());



// api routes
app.use('/api/auth',authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts',contactRoutes);
app.use('/api/calls',callRoutes);



app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Calling crm api is running"
    })
})

// health endpoint

app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        message: databaseConnected ? "API is healthy" : "Database is disconnected",
        database: databaseConnected ? "Connected" : "Disconnected"
    })
})


// test api --------------------------------------------------------
app.get('/api/test/-protected', protect, (req,res)=>{
    res.status(200).json({
        success:true,
        message:"Protected route accessed successfully",
        user:req.user,
    })
})
// -----------------------------------------------------------------



const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
       await connectDB();
       app.listen(PORT, ()=>{
        console.log(`Calling crm is listening on port http://localhost:${PORT}`)
       });
    }
    catch (error) {
        console.log('Server startup failed: ', error.message)
        process.exit(1);
    }
};

if(require.main === module){
    startServer();
}

module.exports = {app, startServer}
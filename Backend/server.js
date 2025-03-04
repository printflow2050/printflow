const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//variables 
const { MONGO_URL, PORT } = require("./config");

//routes import
const shopRoutes = require('./routes/shop');
const printJobRoutes = require('./routes/printjobs');
const uploadRoutes = require('./routes/upload'); // Add this line

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files from the uploads directory

//db connection
mongoose.connect(MONGO_URL)
.then(()=>{
    console.log("Succesfully connected to  Mongodb..");
})
.catch((err)=>{
    console.log(err);
})

//routes
app.use('/api/shop', shopRoutes); 
app.use('/api/printjobs', printJobRoutes);
app.use('/api/upload', uploadRoutes); // Add this line

app.listen(PORT, ()=>{
    console.log(`Server sucessfully running at port: ${PORT}`);
});
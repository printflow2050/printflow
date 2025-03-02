const express = require("express");
const mongoose = require("mongoose");

//variables 
const {MONGO_URL, PORT} = require("./config");

const app = express();
mongoose.connect(MONGO_URL, ()=>{
    console.log("");
})
app.use(); //


app.listen(PORT, ()=>{
    console.log(`Server sucessfully running at port: ${PORT}`);
});
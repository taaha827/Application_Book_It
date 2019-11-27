//Importing Express
const express = require("express");
const mongoose = require("mongoose");
require('dotenv/config');
//Initializing The Server
const app = express();

const appointmentRoutes = require("./Routes/appointments");
const customerRouters = require('./Routes/customers');
const ownerRoutes  = require('./Routes/owners');
const packageRoutes  = require('./Routes/packages');
const postRoutes  = require('./Routes/posts');
const reviewRoutes =require('./Routes/reviews');
const storeRoutes  = require('./Routes/stores');

app.use("/appointments",appointmentRoutes);
app.use("/customer",customerRouters);
app.use("/owner",ownerRoutes);
app.use("/package",packageRoutes);
app.use("/post",postRoutes);
app.use("/review",reviewRoutes);
app.use("/store",storeRoutes);


//Connection TO Database
mongoose.connect(" mongodb+srv://taaha827:randompassword@cluster0-xezp5.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true},()=>{
    console.log("Connection Successfull")
});


app.listen(process.env.PORT||5000);
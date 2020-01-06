const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    from:{
        type:String,
    },
    numberOfStars:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Owners",
        required:true
    },   
 store:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Stores",
        required:true
    },   
    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Appointments",
        required:true
    },   

    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required:true
    },   
    comment:{
        type:String,
    }
});
module.exports = mongoose.model("AppointmentReviews",reviewSchema);
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Customers",
        required:true
    },
    dateTime:{
        type:Date,
        default:Date.now
    },
    rating:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    totalLikes:{
        type:String,
        default:'0'
    },
    totalDisLikes:{
        type:String,
        default:'0'
    },
    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Appointments"
    },
    stores:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Stores"

    },
    SubComments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Reviews"
    }]
    
});

module.exports = mongoose.model("Reviews",reviewSchema);
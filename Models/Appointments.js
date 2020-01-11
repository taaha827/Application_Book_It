const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Customers',
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Owners',
        required:true
 
    },
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Stores',
        required:true
    },
    date:{
        type: Date,
        default: Date.now,
        required:true
    },
    meetingDate:{
        type:Date
    },
    startTime:{
        type:String,
        required:false
    },
    endTime:{
        type:String,
        required:false
    },
    package:{
        title:String,
        description:String,
        price:Number
    },
    status:{
        type:String,
        }
});


module.exports = mongoose.model("Appointments",appointmentSchema);

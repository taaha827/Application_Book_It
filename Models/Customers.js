const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    imageURL:{
        type:String,
    },
    address:{
        type:String
    },
    location:{
        type:[{
            "lat":String,
            "lng":String
        }]
    },
    notificationToken:{
        type:String
    }

});

module.exports = mongoose.model("Customers",customerSchema);
const mongoose = require('mongoose');

const ownerSchema  = mongoose.Schema({
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
    email:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String
    },
    notificationToken:{
        type:String
    }
});

module.exports = mongoose.model("Owners",ownerSchema);
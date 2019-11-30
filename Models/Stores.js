const mongoose = require('mongoose');
//require('mongoose-double')(mongoose);

const storeSchema = mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Owners",
        required:true 
    },
    name:{
        type:String,
        req:true
    },
    description:{
        type:String
    },
    contact:{
        type:String
    },
    email:{
        type:String
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
    category:{
        type: String
    },
    city:{
        type:String
    },
    startTime:{
        type:String
    },
    closeTime:{
        type:String 
    },
    package:[{
        title:String,
        description:String,
        price:Number
    }],
    subcategory:[String],
    images:[String]
});

module.exports = mongoose.model("Stores",storeSchema);


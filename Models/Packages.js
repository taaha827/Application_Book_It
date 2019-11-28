const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Stores',
        required:true
    },
    title:String,
    description:String,
    price:Number
   
});

module.exports = mongoose.model("Packages",packageSchema);


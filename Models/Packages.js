const mongoose = require('mongoose');

const packageSchema = mongoose.Schema({
    title:String,
    description:String,
    price:Number,
    Store:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Stores',
        required:true
    }
   
});

module.exports = mongoose.model("Packages",packageSchema);


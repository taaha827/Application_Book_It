const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Stores"
    },
    title:String,
    description:String,
    image:[String],
    dateTime:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("Posts",postSchema);
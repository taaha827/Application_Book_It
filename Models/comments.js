const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Posts"
    },
    value:String, 
    Date:Date, 
    subreviews:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comments"
    }],
    CommentBy:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Customers",
            required:true
        }
});

module.exports = mongoose.model("Comments",commentSchema);
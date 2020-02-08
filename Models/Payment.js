const mongoose = require('mongoose');
//require('mongoose-double')(mongoose);

const paymentSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Owners",
        required:true 
    },
    activeStatus: {
        type: Number,
        default: 1
    },
    productId:{
        type: String
    },
    orderId:{
        type:String
    },
    purchaseToken:{
        type:String
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    }
});

module.exports = mongoose.model("Payments",paymentSchema);


const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Customers',
        required:true
    },
    store:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Stores',
        required:true
    }
});


module.exports = mongoose.model("favourites",appointmentSchema);

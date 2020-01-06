const express = require("express");
const router = express.Router();
const appointment = require('../Models/Appointments');
const mongoose = require('mongoose');
const AppointmentReview = require('../Models/OwnerReviews');
const owner = require('../Models/Owners');
const customer = require('../Models/Customers');

/*customer
owner
store
date
startTime
endTime
status */
router.post('/create',(req,res)=>{
    const {customerId,ownerId,storeId,startTime,endTime,status} = req.body;
    if(!req.body){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{
        const newAppointment = new appointment(req.body);
        newAppointment.save().then(result=>{
            res.status(200).send({AppointmentId:result._id,message:"Appointment Created Successfully"});
            return;
        })
        .catch(err => {
            res.status(500).send({message:"Could Not Add New Appointment, Try Again"});
            return;
        });
    }
});


router.post('/giveReview',(req,res)=>{
    const object = new AppointmentReview(req.body);
    object.save().then(result=>{
        res.status(200).send({ReviewID:result._id,message:"Review Given Successfully"});
        return;
    })
    .catch(err => {
        res.status(500).send({message:"Could Not Add New Appointment, Try Again"});
        return;
    });
});

router.get('/getReview/:context/:ID',(req,res)=>{
    if(req.params.context==="owner"){
        AppointmentReview.find({owner:req.params.ID,from:"owner"}).populate("owner").populate("customer").populate("store").populate("appointment").then(result=>{
            if(!result){
                return res.status(404).send({message:"No Review Found"});
            }
            else{
                return res.status(200).send(result);
            }           
        })
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        })
    }
    else if(req.params.context==="customer"){
        AppointmentReview.find({customer:req.params.ID,from:"customer"}).populate("owner").populate("customer").populate("store").populate("appointment").then(result=>{
            if(!result){
                return res.status(404).send({message:"No Review Found"});
            }
            else{
                return res.status(200).send(result);
            }           
        })
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        })
        
    }
});
router.delete('/deleteReview/:AppointmentReviewId',(req,res)=>{
    AppointmentReview.findByIdAndRemove(req.params.appointmentReviewId).then(result=>{
        if(!result){
            return res.status(404).send({message:"Appointment Not Found"});
        }
        else{
            return res.status(200).send({"AppointmentReviewId":result._id,"message":"AppointmentReview Deleted Successfully"});
        }
    })
    .catch(err=>{
    res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});


router.delete('/delete/:AppointmentId/:customerId',(req,res)=>{
    const customerId = req.params.customerId;
    const AppointmentId = req.params.AppointmentId;
    Customer.findOne({_id:customerId}).then(result=>{
        if(!result){
            res.status(400).send({message:"Customer Not Found"});
            return;
        }else{
            appointment.findByIdAndRemove(AppointmentId).then(result=>{
                if(!result){
                    return res.status(404).send({message:"Appointment Not Found"});
                }
                else{
                    return res.status(200).send({"AppointmentId":result._id,"message":"Appointment Deleted Successfully"});
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});

router.get('/getAll/:ownerId',(req,res)=>{
    const ownerId = req.params.ownerId;
    if(!ownerId){
        return res.status(404).send({message:"Owner Id can not be null"});
    }else{
        appointment.find({owner:ownerId}).populate("store").populate("customer").then(result =>{
            return res.status(200).send(result);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.get('/getAppointment/:appointmentId',(req,res)=>{
    const appointmentId = req.params.appointmentId;
    if(!appointmentId){
        return res.status(404).send({message:"Appointment  Not Found"});
    }
    else{
        appointment.findOne({_id:appointmentId}).populate("store").populate("customer").then(result=>{
            if(!result){
                return res.status(400).send({message:"Review Not Found!"});
            }else{
                return res.status(200).send(result);
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.put('/update/:appointmentId',(req,res)=>{
    if(!req.body.content){
        return res.status(400).send({message:"Cannot Update Store with no Reference"});
    }
    else{
        appointment.findByIdAndUpdate(req.params.appointmentId,{
            status:req.body
        },{new:true})
        .then(result =>{
            if(!result){
                return res.status(404).send({message:"Appointment Not found to update"});
            }else{
                return res.status(200).send({AppointmentUpdated:result,message:"Appointment Updated Successfully"});
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


module.exports = router;
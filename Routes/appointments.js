const express = require("express");
const router = express.Router();
const appointment = require('../Models/Appointments');
const mongoose = require('mongoose');

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

router.get('/getAll:ownerId',(req,res)=>{
    const ownerId = req.params.ownerId;
    if(!customerId){
        return res.status(404).send({message:"Owner Id can not be null"});
    }else{
        appointment.find({owner:ownerId}).populate("_stores").populate("_customers").then(result =>{
            return res.status(200).send(result);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.get('/getAppointment/:appointmentId',(req,res)=>{
    const appointmentId = req.param.appointmentId;
    if(!appointmentId){
        return res.status(404).send({message:"Appointment  Not Found"});
    }
    else{
        appointment.findOne({_id:appointmentId}).populate("_stores").populate("_customers").then(result=>{
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
            status:req.body.status
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
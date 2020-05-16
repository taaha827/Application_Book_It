const express = require("express");
const router = express.Router();
const appointment = require('../Models/Appointments');
const mongoose = require('mongoose');
const AppointmentReview = require('../Models/OwnerReviews');
const owner = require('../Models/Owners');
const customer = require('../Models/Customers');
var FCM = require('fcm-node')
var serverKey = 'AAAAJ4SWhiA:APA91bE4P_MfCHL07moUFiAheyDMjtH6wpH_M82vul8jNlmrNyaY2D9H-tuAnwlEXWHT09x8uY8Os-t4pe5Tdo-41TIm6pWKJt-LY6aoLEphiL9SINFOvsU5iK_tYegljT_u8xpzfI51'
let fcm = new FCM(serverKey)
let moment = require('moment')
/*customer
owner
store
date
startTime
endTime
status */

// 'type',
// 'value',
// 'Customer Name',
// 'customer Id'
router.post('/create',(req,res)=>{
    const {customerId,ownerId,storeId,startTime,endTime,status} = req.body;
    if(!req.body){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{

        const newAppointment = new appointment(req.body);
        newAppointment.save().then(result=>{
            appointment.findOne({_id:result.id})
            .populate('owner',{notificationToken:1})
            .populate('customer',{firstName:1,lastName:1})
            .then(result => {
                var message = {
                    to: result.owner.notificationToken,
                    notification: {
                        title: 'Appointment Created',
                        body: `Appointment Created by ${result.customer.firstName} ${result.customer.lastName} ` 
                    },
                    data: {
                        type: 'appointment',
                        value: `Appointment Created by ${result.customer.firstName} ${result.customer.lastName} `,
                        customerName : `${result.customer.firstName} ${result.customer.lastName}`,
                        customerId: result.customer._id
                    }
                }
                console.log('Message=====>',message)
                fcm.send(message, function(err, response) {
                    if(err) {
                        console.log(err)
                        console.log('Something went wrong')
                    }
                    else{
                        console.log('Successful ', response)
                    }
                })
            })
            res.status(200).send({AppointmentId:result._id,message:"Appointment Created Successfully"});
            return;
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({message:"Could Not Add New Appointment, Try Again"});
            return;
        });
    }
});


router.post('/giveReview',(req,res)=>{

    const object = new AppointmentReview(req.body);
    object.save().then(result=>{
        AppointmentReview.findOne({_id:result._id})
        .populate('owner',{firstName:1,lastName:1,notificationToken:1})
        .populate('customer',{firstName:1,lastName:1,notificationToken:1})
        .populate('store',{name:1})
        .populate('appointment',{meetingDate:1,package:1})
        .then(result1 => {
            let to 
            if(result1.from === 'owner') {
                to = result1.customer.notificationToken
                by = result1.owner.firstName + ' ' + result1.owner.lastName
            }else{
                to = result1.owner.notificationToken
                by = result1.customer.firstName + ' ' + result1.customer.lastName
            }
            var message = {
                to:to,
                notification: {
                    title: 'Review Recievedd',
                    body: `${by} left you a review on an appointment ` 
                },
                data: {
                    type: 'Review',
                    value: `
                    A ${result1.numberOfStars} star Review was Given by ${by} on your appointment on ${result1.appointment.meetingDate} at store ${result1.store.name}   
                     `,
                    customerName : `${result1.customer.firstName} ${result1.customer.lastName}`,
                    customerId: result1.customer._id,
                    ownerName : `${result1.owner.firstName} ${result1.owner.lastName}`,
                    ownerId: result1.owner._id,
                    appointmentId: result1.appointment._id,
                    meetingDate: moment(new Date(result1.appointment.meetingDate)).toDate(),
                    package: result1.appointment.package,
                    store: result1.store._id
                }
            }
            if(to !== ''){
                fcm.send(message, function(err, response) {
                    if(err) {
                        console.log(err)
                        console.log('Something went wrong')
                    }
                    else{
                        console.log('Successful ', response)
                    }
                })
    
            }
        })

        res.status(200).send({ReviewID:result._id,message:"Review Given Successfully"});
        return;
    })
    .catch(err => {
        console.log(err)
        res.status(500).send({message:"Could Not Add New Appointment, Try Again"});
        return;
    });
});
//Single Review 
//endpoint store populated customer populated appointment 
//populated customer
router.get('/getSingleReview/:context/:ID',(req,res)=>{
    if(req.params.context==="owner"){
        AppointmentReview.find({"appointment":req.params.ID})
        .populate("customer")
        .populate("store")
        .populate("appointment")
        .then(result=>{
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
        AppointmentReview.find({"appointment":req.params.ID})
            .populate("owner")
            .populate("store")
            .populate("appointment")
            .then(result=>{
            if(!result){
                
                return res.status(404).send({message:"No Review Found"});
            }
            else{
                console.log("In here");
                return res.status(200).send(result);
            }           
        })
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        })
        
    }
});
router.get('/getReview/:storeId',(req,res)=>{
    AppointmentReview.find({"store":req.params.storeId,from:"customer"},{
        "date":1,
        "numberOfStars":1,
        "comment":1,
        "appointment":1
        })
        .populate("customer",{"_id":0,"name":1})
        .populate("store","name")
        .then(result=>{
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
    
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        });
});





router.get('/owner/getReview/:ownerId/:storeId',(req,res)=>{
    AppointmentReview.find({"store":req.params.storeId,from:"owner",owner:req.params.ownerId},{
        "date":1,
        "numberOfStars":1,
        "comment":1,
        "appointment":1
        })
        .populate("owner",{"_id":0,"firstName":1})
        .populate("store",{"name":1})
        .then(result=>{
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
    
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        });
});






router.get('/getReview/:context/:ID',(req,res)=>{
    if(req.params.context==="owner"){
        AppointmentReview.find({owner:req.params.ID,from:"owner"},
        {
        "appointment":1,
        "date":1,
        "numberOfStars":1,
        "comment":1,
        })
        .populate("customer","name")
        .populate("store","name")
        .then(result=>{
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
        AppointmentReview.find({customer:req.params.ID,from:"customer"},{
            "date":1,
            "numberOfStars":1,
            "comment":1,
            "appointment":1
            })
            .populate("owner",{"_id":0,"firstName":1})
            .populate("store",{"name":1})
            .then(result=>{
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
    customer.findOne({_id:customerId}).then(result=>{
        if(!result){
            res.status(400).send({message:"Customer Not Found"});
            return;
        }else{
            appointment.findOne({_id:req.params.AppointmentId})
            .populate('owner',{notificationToken:1})
            .populate('customer',{firstName:1,lastName:1})
            .then(result1 => {
                console.log(result1)
                var message = {
                    to: result1.owner.notificationToken,
                    notification: {
                        title: 'Appointment Deleted',
                        body: `Appointment Deleted by ${result1.customer.firstName} ${result1.customer.lastName} ` 
                    },
                    data: {
                        type: 'appointment',
                        value: `Appointment Deleted by ${result1.customer.firstName} ${result1.customer.lastName} `,
                        customerName : `${result1.customer.firstName} ${result1.customer.lastName}`,
                        customerId: result1.customer._id,
                        appointmentId:result1._id
                    }
                }
                fcm.send(message,function (err, response) {
                    if(err) {
                        console.log('Something went wrong')
                    }
                    else{
                        console.log('Successful ', response)
                    }
                })
            })
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


let getAppointmentReview = (context,ID)=>{
    return new Promise(async function (resolve, reject) {
    if(context==="customer"){
        let app = await AppointmentReview
        .find({customer:ID,from:"customer"},
        {"_id":0,appointment:1})
               let result =[]
                app.forEach(element => {
                    result.push(element.appointment);
                });
                resolve(result);
        
    }
    else{
       let app = await AppointmentReview.find({owner:ID,from:"owner"},{
        "_id":0,        
        "appointment":1
            })
            let result =[]
            app.forEach(element => {
                result.push(element.appointment);
            });
            //console.log(app)
            resolve(result);
    }

    });
}

router.get('/getAll/:ownerId/:storeId',(req,res)=>{
    const ownerId = req.params.ownerId;
    if(!ownerId){
        return res.status(404).send({message:"Owner Id can not be null"});
    }else{
        appointment.find({owner:ownerId,store:req.params.storeId})
        .populate("store")
        .populate("customer")
        .then(async result =>{
            let answers = [];
            let reviews = await getAppointmentReview("owner",ownerId);
            for (var i = 0 ;i<result.length;i++){
                let foundReview = false;
                if(result[i].status==="completed"){
                reviews.forEach(element => {
                    console.log("Comparing "+ element +" with "+ result[i]._id)
                    if(element.toString() === result[i]._id.toString()){
                        console.log("Found A Maych")
                        let a = result[i].toObject();
                        a.hasReview = true;
                        answers.push(a);
                        foundReview = true;
                    }
                });
                if(foundReview){
                    continue;
                }else{
                    let a = result[i].toObject();
                    a.hasReview = false;
                    answers.push(a);
                }
            }else{
                answers.push(result[i])
            }
        }
            return res.status(200).send(answers);
        })
        .catch(err=>{
            console.log(err);
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.get('/getAll/:customerId',(req,res)=>{
    const customerId = req.params.customerId;
    if(!customerId){
        return res.status(404).send({message:"Customer Id can not be null"});
    }else{
        appointment.find({customer:customerId})
        .populate("store")
        .populate("customer")
        .then(async result =>{
            let answers = [];
            let reviews = await getAppointmentReview("customer",customerId);
            for (var i = 0 ;i<result.length;i++){
                let foundReview = false;
                if(result[i].status==="completed"){
                reviews.forEach(element => {
                    console.log("Comparing "+ element +" with "+ result[i]._id)
                    if(element.toString() === result[i]._id.toString()){
                        console.log("Found A Match")
                        let a = result[i].toObject();
                        a.hasReview = true;
                        answers.push(a);
                        foundReview = true;
                    }
                });
                if(foundReview){
                    continue;
                }else{
                    let a = result[i].toObject();
                    a.hasReview = false;
                    answers.push(a);
                }
            }else{
                answers.push(result[i])
            }
        }
            return res.status(200).send(answers);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});

router.get('/store/getAll/:storeId',(req,res)=>{
    const storeId = req.params.storeId;
    if(!storeId){
        return res.status(404).send({message:"Customer Id can not be null"});
    }else{
        appointment.find({store:storeId},{
        "meetingDate":1,
        "startTime":1,
        "endTime":1,
        "status":1
    })
        .then(async result =>{
            let answers =[]
            for (var i = 0 ;i<result.length;i++){
                if(result[i].status==="completed" ||result[i].status==="rejected" ||result[i].status==="cancelled"  ){
                    continue;
                }
                else{
                    answers.push(result[i])
                }
            }
            return res.status(200).send(answers);
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

//add req.body.changedBy
router.put('/update/:appointmentId/:status',(req,res)=>{
    
        appointment.findByIdAndUpdate(req.params.appointmentId,{
            status:req.params.status
        })
        .then(result =>{
            if(!result){
                return res.status(404).send({message:"Appointment Not found to update"});
            }else{
                let  not 
                let by 
                appointment.findOne({_id:result.id})
                .populate('owner',{notificationToken:1,firstName:1,lastName:1})
                .populate('customer',{notificationToken:1,firstName:1,lastName:1})
                .populate('store',{name:1})
                .then(result => {
                    console.log(result)
                    if(req.body.changedBy ==='customer'){
                        not = result.owner.notificationToken
                        by = result.customer.firstName + ' ' + result.customer.lastName
                    }else{
                        not = result.customer.notificationToken
                        by = result.customer.firstName + ' ' + result.customer.lastName
                    }
                    var message = {
                        to: not,
                        notification: {
                            title: 'Appointment Status Changed',
                            body: `Appointment Status change on AppointmentId ${result._id} ` 
                        },
                        data: {
                            type: 'appointment',
                            value: `Appointment Status change on AppointmentId ${result._id} 
                            by ${by}
                            `,
                            customerName : `${result.customer.firstName} ${result.customer.lastName}`,
                            customerId: result.customer._id,
                            appointmentId: result._id,
                            ownerId: result.owner._id,
                            changedBy: req.body.changedBy,
                            storeId: result.store._id,
                            status: result.status
                        }
                    }
                    console.log(message)
                    if(message.to!==''){
                    fcm.send(message,function(err, response) {
                        if(err) {
                            console.log(err)
                            console.log('Something went wrong')
                        }
                        else{
                            console.log('Successful ', response)
                        }
                    })
                }
                })
                return res.status(200).send({AppointmentUpdated:result,message:"Appointment Updated Successfully"});
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    
});

module.exports = router;
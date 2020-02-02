const express = require("express");
const router = express.Router();
const Owner = require('../Models/Owners');
const mongoose = require('mongoose');
const STORES = require('../Models/Stores');
const Customer = require('../Models/Customers')
const POSTS = require('../Models/Posts')
const COMMENTS = require('../Models/comments')
const REVIEWS = require('../Models/OwnerReviews')
/*customer
owner
store
date
startTime
endTime
status */
router.post('/create',(req,res)=>{
    console.log("Request Body");
    console.log(req.body);
    if(!req.body){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{
        const newAppointment = new Owner(req.body);
        newAppointment.save().then(result=>{
            
            res.status(200).send(result._id);
            return;
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({message:"Could Not Add New Owner, Try Again"});
            return;
        });
    }
});



router.delete('/delete/:OwnerId',(req,res)=>{
    const OwnerId = req.params.OwnerId;
    Owner.findOne({_id:OwnerId}).then(result=>{
        if(!result){
            res.status(400).send({message:"Owner Not Found"});
            return;
        }else{
            STORES.find({owner:OwnerId})
            .then(res =>{
                res = res.map(val=>{return val._id})
                STORES.deleteMany({owner:OwnerId}).then(res12=>{console.log(res12)}).catch(err=>{console.log(err)})
                POST.find({store:{$in:res}})
                .then(postss =>{
                    postss = postss.map(val=>{return val._id})
                    POST.deleteMany({store:{$in:res}}).then(test =>{console.log(test)}).catch(err=>{console.log(err)})
                    COMMENTS.deleteMany({post:{$in:{postss}}})
                    .then(test1=>{console.log(test1)})
                    .catch(err=>{console.log(err)})
                    REVIEWS.deleteMany({owner:OwnerId})
                    .then(reulting =>{console.log(reulting)})
                    .catch(err=>{console.log(err)})
                })


        }).catch(err=>{console.log(err)})
            Owner.findByIdAndRemove(OwnerId).then(result=>{
                if(!result){
                    return res.status(404).send({message:"Owner Not Found"});
                }
                else{
                    return res.status(200).send({"OwnerId":result._id,"message":"Owner Deleted Successfully"});
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});

router.get('/getOwner/:OwnerId',(req,res)=>{
    const OwnerId = req.params.OwnerId;
    if(!OwnerId){
        return res.status(404).send({message:"Owner  Not Found"});
    }
    else{
        Owner.findOne({_id:OwnerId}).then(result=>{
            if(!result){
                return res.status(400).send({message:"Owner Not Found!"});
            }else{
                return res.status(200).send(result);
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});

const userCredential = require('../Models/UserCredential')
router.put('/update/:ownerid',(req,res)=>{
    if(!req.body){
        return res.status(400).send({message:"Cannot Update Owner with no Reference"});
    }
    else{
        Owner.findById(req.params.ownerid)
        .then(async result =>{
            if(!result){
                return res.status(404).send({message:"Owner Not found to update"});
            }else{
                let em = result.email.toString()
                console.log('Email:===========>',em, 'Type: =======>',typeof(em))
                await result.updateOne({
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    email:req.body.email,
                    imageUrl:req.body.imageUrl,
                    phone:req.body.phone})
//                userCredential.findOneAndUpdate({email:em},,{$set:{email:req.body.email}, new:true})
                console.log({email:em})
                userCredential.findOneAndUpdate({email:em},{email:req.body.email})
                .then(rest => {
                    console.log(rest)
                    if(rest) {
                        return res.status(200).send({AppointmentUpdated:result,message:"Owner Updated Successfully"});
                    }
                })
                .catch(err=>{
                        console.log('General ======>', err)
                    return res.status(500).send({message:"Could Not Process Request"});
                })
            }
        })
        }
    });

router.get('/getOwnerId/:email',(req,res)=>{
    console.log("In getOwnerId");
    console.log(req.params.email);
    Owner.find({email:req.params.email}).then(user=>{
        console.log(user.length)
        if(user.length===0){
            return res.status(404).send({message:"User Not found"});
        }
        else{        console.log(user);
            return res.status(200).send({ownerId:user[0]._id,owner:user[0]});}
    })
});


router.get('/setNotificationToken/:type/:email/:token',(req,res)=>{
    console.log({email:req.params.token})
    if(req.params.type ==='owner') {
        Owner.findOneAndUpdate({email:req.params.email},{notificationToken: req.params.token})
        .then(result =>{
            console.log(result)
            console.log('Added NotificationToken')
            return res.status(200)
        })
        .catch(err =>{console.log(err)})
    }
    else {
        Customer.findOneAndUpdate({email:req.params.email},{notificationToken: req.params.token})
        .then(result =>{
            console.log(result)
            console.log('Added NotificationToken')
            return res.status(200)
        })
        .catch(err =>{console.log(err)})

    }
})
router.get('/removeNotificationToken/:type/:email/',(req,res)=>{
    if(req.params.type ==='owner') {
        Owner.findOneAndUpdate({email:req.params.email},{notificationToken:''})
        .then(result =>{
            console.log(result)
            console.log('Removed NotificationToken')
        })
        .catch(err =>{console.log(err)})
    }
    else {
        Customer.findOneAndUpdate({email:req.params.email},{notificationToken:''})
        .then(result =>{
            console.log('Removed NotificationToken')
        })
        .catch(err =>{console.log(err)})

    }
})


module.exports = router;
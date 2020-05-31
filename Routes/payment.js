//passport.authenticate('jwt', { session: false }) Add this to every route

const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('../config/passport')
const Payment = require('../Models/Payment');
const userCredential = require('../Models/UserCredential')
const stores = require('../Models/Stores')
router.post('/create', (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else {
        const productId = req.body['productId'];
        const newPayment = new Payment(req.body);
        newPayment.save().then(result => {
            Payment.find({user: result.user})
            .then(payments =>{
                if(!payments){
                    return res.status(404).send({message:"No payments found "})
                }
                else{
                    return res.status(200).send(payments)
                }
            })
        })
            .catch(err => {
                console.log(err)
                res.status(500).send({ message: "Could Not Add New Payment, Try Again" });
                return;
            });
    }
});

router.get('/get/:userId',(req,res)=>{
    if(req.params.userId){
        console.log('In get payments with id ', req.params.userId )
        Payment.find({user:req.params.userId})
        .then(payments=>{
            console.log(payments)
            if(!payments){
                return res.status(404).send({message:'No Payments Found'})
            }
            else{
                return res.status(200).send({payments})
            }
        })
        .catch(err=>{
            return res.status(500).send({message:'Could not process request!!'})
        })
    }   
    else{
        return res.status(402).send({message:'User id can not be empty'})
    }
})
router.get('/get/status/:ownerId',async (req,res)=>{
    if(req.params.ownerId){
        let storeCount = await stores.countDocuments({owner:req.params.ownerId})
        console.log(storeCount)
        if(storeCount <= 1){
            return res.status(200).send({status:'active'})
        } else{
            Payment.find({user:req.params.ownerId}).sort({startDate: -1}).limit(1)
            .then(payments=>{
                // console.log(payments)
                // console.log(payments)
                if(!payments){
                    return res.status(404).send({status:404,message:'No Subscriptions Found'})
                }
                else{
                   let p = payments[0]
                    var diff = new Date().setHours(12) - new Date(p.startDate).setHours(12);
                    let a  = Math.round(diff/8.64e7);
                    console.log(a)
                    if(p.productId == 'monthly_subscription'){
                        // console.log(date)
                        // console.log(endDate.setDate(currentDate.getDate()+30).toLocaleDateString()  )   
                        // endDate.setDate(currentDate.getDate()+30)  
                        if(a<=30){
                            return res.status(200).send({status:'active'})
                        }else {
                            return res.status(200).send({status:'expired'}) 
                        }         
                    } else{
                        // endDate.setFullYear(date.getFullYear()+1)
                        if(a<=365){
                            return res.status(200).send({status:'active'}.toLocaleString())
                        }else {
                            return res.status(200).send({status:'expired'}) 
                        } 
                    }
                
                }
            })
            .catch(err=>{
                console.log(err)
                return res.status(500).send({message:'Could not process request!!'})
            })
        }
      
    }   
    else{
        return res.status(402).send({message:'User id can not be empty'})
    }
})
module.exports = router;





// Appointments for Customer 














//passport.authenticate('jwt', { session: false }) Add this to every route

const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('../config/passport')
const Payment = require('../Models/Payment');
const userCredential = require('../Models/UserCredential')

router.post('/create', (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else {
        const productId = req.body['productId'];
        let startDate = new Date();
        let endDate = new Date();
        if(productId ==='monthly_subscription'){
            endDate.setDate(startDate.getDate()+30) 
        }else if(productId==='yearly_subscription'){
            endDate.setFullYear(startDate.getFullYear()+1)
        }
        req.body.startDate = moment(startDate).toDate()
        req.body.endDate = moment(endDate).toDate()
        
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
router.get('/get/status/:ownerId',(req,res)=>{
    if(req.params.ownerId){
        
        Payment.find({user:req.params.ownerId})
        .then(payments=>{
            // console.log(payments)
            if(!payments){
                return res.status(404).send({status:404,message:'No Subscriptions Found'})
            }
            else{
                let result = []
                let currentDate = new Date()
                payments.forEach(payment => {
                    if(currentDate < payment.endDate){
                        console.log('Subscription is valid')
                        // console.log(payment)
                        result.push({
                            orderId: payment.orderId,
                            status:'active',
                            purchaseToken: payment.purchaseToken,
                            owner:payment.user,
                            startDate:payment.startDate,
                            endDate:payment.endDate

                        })
                    }
                    else if(currentDate > payment.endDate){
                        console.log('Subscription has expired')
                        result.push({
                            orderId: payment.orderId,
                            status:'expired',
                            purchaseToken: payment.purchaseToken,
                            owner:payment.user,
                            startDate:payment.startDate,
                            endDate:payment.endDate
                        })
                    }
                })
                return res.status(200).send(result)
            }
        })
        .catch(err=>{
            console.log(err)
            return res.status(500).send({message:'Could not process request!!'})
        })
    }   
    else{
        return res.status(402).send({message:'User id can not be empty'})
    }
})
module.exports = router;





// Appointments for Customer 














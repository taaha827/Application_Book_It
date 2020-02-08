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
        if(productId ==='monthly'){
            endDate.setDate(startDate.getDate()+30) 
        }else if(productId==='yearly'){
            endDate.setFullYear(startDate.getFullYear()+1)
        }
        req.body.startDate = startDate
        req.body.endDate = endDate
        
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
module.exports = router;





// Appointments for Customer 














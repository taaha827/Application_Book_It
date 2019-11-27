const express = require("express");
const router = express.Router();
const{ ensure} = require('../../Auth/config/auth');
const Customer = require('../Models/Customers');
const mongoose = require('mongoose');

router.post('/create',(req,res)=>{
    if(!req.body.content){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{
        const newCustomer = new Customer(req.body.customer);
        newCustomer.save().then(result=>{
            res.status(200).send({customerId:result._id,message:"Customer Created Successfully"});
            return;
        })
        .catch(err => {
            res.status(500).send({message:"Could Not Add New Appointment, Try Again"});
            return;
        });
    }
});



router.delete('/delete/:customerId',(req,res)=>{
    const customerId = req.params.customerId;
    Customer.findByIdAndRemove(customerId).then(result=>{
        if(!result){
            res.status(400).send({message:"Customer Not Found"});
            return;
        }else{
                    return res.status(200).send({"CustomerId":result._id,"message":"Customer Deleted Successfully"});
                }
            })
        
    .catch(err=>{
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});


router.get('/getCustomer/:customerId',(req,res)=>{
    const customerId = req.param.customerId;
    if(!customerId){
        return res.status(404).send({message:"Customer  Not Found"});
    }
    else{
        Customer.findOne({_id:customerId}).then(result=>{
            if(!result){
                return res.status(400).send({message:"Customer Not Found!"});
            }else{
                return res.status(200).send(result);
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.put('/update/:customerId',(req,res)=>{
    if(!req.body.content){
        return res.status(400).send({message:"Cannot Update Customer with no Reference"});
    }
    else{
        Customer.findByIdAndUpdate(req.params.customerId,{
            status:req.body.status
        },{new:true})
        .then(result =>{
            if(!result){
                return res.status(404).send({message:"Custoemr Not found to update"});
            }else{
                return res.status(200).send({UpdatedCustomer:result,message:"Customer Updated Successfully"});
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


module.exports = router;

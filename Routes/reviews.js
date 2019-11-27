const express = require('express');
const router = express.Router();
const Customer = require('../Models/Customers');
const Review = require('../Models/Reviews');

//API Routes

router.post('/create',(req,res)=>{
    const {customerId,rating,desc,appointmentId,reviewId} = req.body;
    if(!req.body.content){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{
        const newReview = new Review({
            customerId,
            rating,
            desc,
            appointmentId,
            reviewId
        });
        newReview.save().then(result=>{
            res.status(200).send({reviewId:result._id,message:"Review Created Successfully"});
            return;
        })
        .catch(err => {
            res.status(500).send({message:"Could Not Add New Review, Try Again"});
            return;
        });
    }
});



router.delete('/delete/:reviewId/:customerId',(req,res)=>{
    const customerId = req.params.customerId;
    const reviewId = req.params.reviewId;
    Customer.findOne({_id:customerId}).then(result=>{
        if(!result){
            res.status(400).send({message:"Customer Not Found"});
            return;
        }else{
            Review.findByIdAndRemove(reviewId).then(result=>{
                if(!result){
                    return res.status(404).send({message:"Review Not Found"});
                }
                else{
                    return res.status(200).send({"reviewId":result._id,"message":"Review Deleted Successfully"});
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});

router.get('/getAll:storeId',(req,res)=>{
    const storeId = req.params.storeId;
    if(!customerId){
        return res.status(404).send({message:"Customer Id can not be null"});
    }else{
        Review.find({stores:storeId}).populate("_customers").populate("_subreviews").then(result =>{
            return res.status(200).send(result);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.get('/getReview/:reviewId',(req,res)=>{
    const reviewId = req.param.reviewId;
    if(!reviewId){
        return res.status(404).send({message:"Review Not Found"});
    }
    else{
        Review.findOne({_id:reviewId}).populate("_customer").populate("_subreviews").then(result=>{
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


router.put('/update/:reviewId',(req,res)=>{
    if(!req.body.content){
        return res.status(400).send({message:"Cannot Update Store with no Reference"});
    }
    else{
        Review.findByIdAndUpdate(req.params.reviewId,{
            customer:req.body.customerId,
            rating:req.body.name,
            description:req.body.description,
            totalLikes:req.body.totalLikes,
            totalDislikes:req.body.disLikes,
        },{new:true})
        .then(result =>{
            if(!result){
                return res.status(404).send({message:"Review Not found to update"});
            }else{
                return res.status(200).send({UpdateReview:result,message:"Store Updated Successfully"});
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});

module.exports = router;

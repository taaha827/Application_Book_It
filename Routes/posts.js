const express = require("express");
const router = express.Router();
const Post = require('../Models/Posts');
const mongoose = require('mongoose');
const Owner = require('../Models/Owners');
var aws = require('aws-sdk');
const CUSTOMERS = require('../Models/Customers');
var BUCKET = 'asifbucketclass';
aws.config.loadFromPath('./config.json');
var s3 = new aws.S3();

router.post('/create', (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else {
        const newPosts = new Post(req.body);
        newPosts.save().then(result => {
            res.status(200).send({ postId: result._id, message: "Post Created Successfully" });
            return;
        })
            .catch(err => {
                res.status(500).send({ message: "Could Not Add New Appointment, Try Again" });
                return;
            });
    }
});



router.delete('/delete/:PostId/:ownerId', async (req, res) => {
    const ownerId = req.params.ownerId;
    const PostId = req.params.PostId;
    Owner.findOne({ _id: ownerId }).then(async result => {
        if (!result) {
            res.status(400).send({ message: "Owner Not Found" });
            return;
        } else {
            objects = [];
            let postToDelete = await Post.find({_id:PostId});
            postToDelete[0].image.forEach(item=>{
                objects.push({Key:item});
            });
            var params = {
                Bucket: 'asifbucketclass',
                Delete: { // required
                    Objects: objects,
                },
            };
            s3.deleteObjects(params, function (err, data) {
                if (err) return res.status(515).send({ message: "Images not deleted from server try again" }) // an error occurred
                else console.log("Deleted Images of posts and stores");           // successful response
            });

            Post.findByIdAndRemove(PostId).then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Post Not Found" });
                }
                else {
                    return res.status(200).send({ "PostId": result._id, "message": "Post Deleted Successfully" });
                }
            })
        }
    })
        .catch(err => {
            console.log(err);
            res.status(500).send({ message: "Server Could Not Process Request Try Again" });
        });
});

router.get('/getAll/:storeId/:customerId', (req, res) => {

    const storeId = req.params.storeId;

    if (!storeId) {
        return res.status(404).send({ message: "Store Id can not be null" });
    } else {
        Post.find({ store: storeId }).then(result => {
            results=[]
            result.forEach(element=>{
                let middle = element.toObject();
                middle.totalLikes = element.likes.length
                middle.totalComments = element.comments.length
                if(element.likes){
                    console.log(req.params.customerId)
        if(element.likes.includes(req.params.customerId)){
    middle.hasLiked= true
                                        }
                }
                if(element.comments){
                    delete middle['comments']
                }
                delete middle['likes']
                results.push(middle)
            })
            return res.status(200).send(results);
        })
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: "Could Not Process Request" });

            })
    }
});


router.get('/getPost/:postId/:customerId', (req, res) => {
    const postId = req.params.postId;
    if (!postId) {
        return res.status(404).send({ message: "Post  Not Found" });
    }
    else {
        Post.findOne({ _id: postId }).populate("comments",{value:1,Date:1,CommentBy:1})
        .then(result => {
            if (!result) {
                return res.status(400).send({ message: "Post Not Found!" });
            } else {
                index= 0
                middle = result.toObject()
                getComments(result.comments)
                .then(com=>{
                    console.log("Got new Comments")
                    middle.comments= com
                    console.log(middle.newComments)
                    if(result.likes && result.likes.includes(req.params.customerId)){
                            console.log("In has Liked")
                            middle.hasLiked= true
                        }   
                        delete middle.likes
                        middle.totalLikes = result.likes.length
                        console.log("Return result")
                        return res.status(200).send(middle);
                })
                .catch(err=>{
                    console.log(err)
                    return res.status(505)
                })
                }
            })
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: "Could Not Process Request" });
            })
    }
});

let getComments = (comments)=>{
    return new Promise(async function(resolve, reject){
        newComments = []
        for (let index = 0; index < comments.length; index++) {
            const element = comments[index];
            if(element.CommentBy){
                let customer =await getCustomer(element.CommentBy)
                console.log("Got customer")
                console.log(customer)
                newComments.push({
                    _id:element._id,
                    commentBy:customer.name
                })
            }
        }
            resolve(newComments)     
})
}
let getCustomer = (storeId) =>{
    return new Promise(function(resolve, reject){
        CUSTOMERS.findOne({_id:storeId},{firstName:1,lastName:1,imageURL:1})
        .then(Customer=>{
            if(!Customer){
                return null;
            }
            else{
                if(!Customer){
                    resolve({name:Customer.firstName+" "+Customer.lastName});
                }
                else{
                    resolve({name:Customer.firstName+" "+Customer.lastName,image:Customer.imageURL});
                    
                }
            }
        }).catch(err=>{console.log(err);});     
      });
}
router.put('/update/:postId', async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Cannot Update Post with no Reference" });
    }
    else {
        let imagesToDelete = await getImagestoRemove(req.params.postId, req.body.image);
        if (imagesToDelete != null && imagesToDelete.length != 0) {
            objects = [];
            for (var i =0;i<imagesToDelete.length;i++){
                objects.push({Key:imagesToDelete[i]});
            }
            var params = {
                Bucket: 'asifbucketclass',
                Delete: { // required
                    Objects: objects,
                },
            };
            s3.deleteObjects(params, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(515).send({ message: "Posts not deleted Images were not delted" });// an error occurred
                }  
                console.log("Deleted Successfully");        // successful response
            });
        }
        Post.findByIdAndUpdate(req.params.postId, {
            store: req.body.storeId,
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
        }).then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Post Not found to update" });
                } else {
                    return res.status(200).send({ AppointmentUpdated: result, message: "Post Updated Successfully" });
                }
            })
            .catch(err => {
                return res.status(500).send({ message: "Could Not Process Request" });
            });
    }
});

router.post('/like/:postId/:customerId',(req,res)=>{
    const postId = req.params.postId;
    if (!postId) {
        return res.status(404).send({ message: "Post  Not Found" });
    }
    
    else {
        try{
            console.log("In here")
        Post.find({_id :req.params.postId})
        .then(result=>{
            if(!result){
                console.log("In here 1")
                return res.status(501)
            }
            else{
                console.log("In here 2")
                
                if(result[0].likes){
                    console.log("In here 3")
                    console.log(result[0])
                    if(result[0].likes.includes(req.params.customerId)){
                        console.log("In here 4")

                        return res.status(201).send({message:"already Liked"})
                    }
                    else{
                        console.log("In here 5")
    
                        Post.findOneAndUpdate({_id :req.params.postId},
                            {$push:{likes:req.params.customerId}})
                            .then(result=>{
                                console.log("In here 6")
    
                                return res.status(200).send(result)
                            })     
                            .catch(err=>{
                                console.log(err)
                                return res.status(503)
                            })
    
                }
            }
                else{
                    console.log("In here 5")

                    Post.findOneAndUpdate({_id :req.params.postId},
                        {$push:{likes:req.params.customerId}})
                        .then(result=>{
                            console.log("In here 6")

                            return res.status(200).send(result)
                        })     
                        .catch(err=>{
                            console.log(err)
                            return res.status(503)
                        })
                }
            }
        })
        .catch(err=>{
            console.log(err)
            return res.status(505)
        })
        return 
            }
            catch(err){
                return res.status(509).send({messsage:"Error REcieved"})
            }
    
        }
        })

router.post('/dislike/:postId/:customerId',(req,res)=>{
    const postId = req.params.postId;
    if (!postId) {
        return res.status(404).send({ message: "Post  Not Found" });
    }
    else {
        Post.find({_id :req.params.postId})
        .then(result=>{
            if(!result){
                return res.status(501)
            }
            else{
                if(result[0].likes){
                    if(result[0].likes.includes(req.params.customerId)){
                        Post.findOneAndUpdate({_id :req.params.postId},
                            {$pull:{likes:req.params.customerId}})
                            .then(result=>{
                                return res.status(200).send(result)
                            })     
                            .catch(err=>{
                                console.log(err)
                                return res.status(503)
                            })
                        }else{
                            return res.status(201).send({messsage:"ALready Disliked"})
                        }
                }
            }
        })
        .catch(err=>{
            console.log(err)
            return res.status(505)
        })
        return 
            }
        })
    
let getImagestoRemove = (postId, updatedImages) => {
    return new Promise(function (resolve, reject) {
        Post.findById(postId).then(result => {
            if (!result) {
                return null;
            }
            else {
                toDelete = [];
                for (var i = 0; i < result.image.length; i++) {
                    if (!updatedImages.includes(result.image[i])) {
                        toDelete.push(result.image[i]);
                    }
                }
                resolve(toDelete);
            }
        }).catch(err => { console.log(err); });
    });
}

module.exports = router;
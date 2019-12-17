const express = require("express");
const router = express.Router();
const Post = require('../Models/Posts');
const mongoose = require('mongoose');
const Owner = require('../Models/Owners');
var aws = require('aws-sdk');
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



router.delete('/delete/:PostId/:ownerId', (req, res) => {
    const ownerId = req.params.ownerId;
    const PostId = req.params.PostId;
    Owner.findOne({ _id: ownerId }).then(result => {
        if (!result) {
            res.status(400).send({ message: "Owner Not Found" });
            return;
        } else {
            objects = [];
            Posts.find({ store: storeId }).select('image').then(images => {
                images.forEach(element => {
                    element["image"].forEach(element1 => {
                        objects.push({ Key: "./uploads/" + element1 });
                    });
                });
            })
                .catch(err => { console.log(err) });
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
            res.status(500).send({ message: "Server Could Not Process Request Try Again" });
        });
});

router.get('/getAll/:storeId', (req, res) => {

    const storeId = req.params.storeId;

    if (!storeId) {
        return res.status(404).send({ message: "Store Id can not be null" });
    } else {
        Post.find({ store: storeId }).then(result => {
            return res.status(200).send(result);
        })
            .catch(err => {
                return res.status(500).send({ message: "Could Not Process Request" });
            })
    }
});


router.get('/getPost/:postId', (req, res) => {
    const postId = req.params.postId;
    if (!postId) {
        return res.status(404).send({ message: "Post  Not Found" });
    }
    else {
        Post.findOne({ _id: postId }).then(result => {
            if (!result) {
                return res.status(400).send({ message: "Post Not Found!" });
            } else {
                return res.status(200).send(result);
            }
        })
            .catch(err => {
                return res.status(500).send({ message: "Could Not Process Request" });
            })
    }
});


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
        post.findByIdAndUpdate(req.params.postId, {
            store: req.body.storeId,
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,

        }, { new: true })
            .then(result => {
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
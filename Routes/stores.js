
const express = require('express');
const router = express.Router();
const Store = require('../Models/Stores');
const owner = require('../Models/Owners');
const Posts = require('../Models/Posts');

const multer = require('multer');
var storeLocation =  'uploads/Store/';
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, storeLocation);
    },
    filename: function(req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
  });
var server_port =  process.env.PORT || 5000;
var server_host =  '0.0.0.0';
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

var aws = require('aws-sdk');
var BUCKET = 'asifbucketclass';
aws.config.loadFromPath('./config.json');
var s3 = new aws.S3();

//API Routes

router.post('/create',(req,res)=>{
    const {ownerId,name,desc,contact,email,address,location,category,subcategory,images} = req.body;
    console.log(req.body);
    if(!req.body){
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else{
        const newStore = new Store(req.body);
        newStore.save().then(store=>{
            res.status(200).send({storeId:store._id,message:"Store Created Successfully"});
            return;
        })
        .catch(err => {
            res.status(500).send({message:"Could Not Create New Store, Try Again"});
            return;
        });
    }
});



router.delete('/delete/:storeId/:ownerId',async (req,res)=>{
    const ownerId = req.params.ownerId;
    const storeId = req.params.storeId;
    owner.findOne({_id:ownerId}).then(async (ownerObj)=>{
        if(!ownerObj){
            res.status(400).send({message:"Owner Not Found"});
            return;
        }else{
            console.log("finding store imagmes");
            objects =[];
            //Deleting Images
            const storeImages =await Store.find({_id:storeId}).select('images');
            objects.push({Key:storeImages[0]["images"]});
            const postImages = await Posts.find({_id:"5de259101c9d440000567b7d"});
            console.log(postImages);
            postImages.forEach(element=>{
                        console.log(typeof element);
                        console.log("In Posts pushing Images of each post");
                        element["image"].forEach(element1=>{
                            console.log("Pushing: "+element1);
                            objects.push({Key:element1});
                        });
                    });
            console.log(objects);    
            var params = {
                Bucket: 'asifbucketclass', 
                Delete: { // required
                  Objects:objects,
                },
              };
                        
              s3.deleteObjects(params, function(err, data) {
                if (err) return res.status(515).send({message:"Store not deleted Images were not delted"});// an error occurred
                else     console.log("Deleted Images of posts and stores");           // successful response
              });
            Store.findByIdAndRemove(storeId).then(store=>{
                if(!store){
                    return res.status(404).send({message:"Store Not Found"});
                }
                else{
                    Posts.deleteMany({store:storeId}),function(err){
                        if(err){
                            return res.status(414).json({message:"Not all Posts Deleted of store"});
                        }
                        }
                        return res.status(200).send({"storeId":store._id,"message":"Store Deleted Successfully"});
                }
            })
        }
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});

router.get('/getAll/:ownerId',(req,res)=>{
    const ownerId = req.params.ownerId;
    if(!ownerId){
        return res.status(404).send({message:"Owner Id can not be null"});
    }else{
        Store.find({owner:ownerId}).populate("owner").then(stores =>{
            return res.status(200).send(stores);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        });
    }
});


router.get('/getStore/:storeId',(req,res)=>{
    const storeID = req.params.storeId;
    console.log(req.params.storeId);
    if(!storeID){
        return res.status(404).send({message:"Store Not Found"});
    }
    else{
        Store.findOne({_id:storeID}).populate("_owner").then(store=>{
            if(!store){
                return res.status(400).send({message:"Store Not Found!"});
            }else{
                return res.status(200).send(store);
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.put('/update/:storeId',async (req,res)=>{
    if(!req.params.storeId){
        return res.status(400).send({message:"Cannot Update Store with no Reference"});
    }
    else{
        let storeImage = await getStoreImage(req.params.storeId);
        console.log(storeImage);
        if(storeImage!=null && req.body.images && storeImage != req.body.images){
         
            
            console.log(storeImage);
            objects =[];
            objects.push({Key:storeImage});
            var params = {
                Bucket: 'asifbucketclass', 
                Delete: { // required
                  Objects:objects,
                },
              };
                        
              s3.deleteObjects(params, function(err, data) {
                if (err){
                    console.log(err);
                     return res.status(515).send({message:"Store not deleted Images were not delted"});// an error occurred
            }else     console.log("Deleted Images of posts and stores");           // successful response
              });
        }
        Store.findByIdAndUpdate(req.params.storeId,{
            owner:req.body.owner,
            name:req.body.name,
            description:req.body.description,
            contact:req.body.contact,
            email:req.body.email,
            address:req.body.address,
            category:req.body.category,
            subcategory:req.body.subcategory,
            images:req.body.images,
            package:req.body.package
        },{new:true})
        .then(store =>{
            if(!store){
                return res.status(404).send({message:"Store Not found to update"});
            }else{
                return res.status(200).send({UpdateStore:store,message:"Store Updated Successfully"});
            }
        })
        .catch(err=>{
            console.log(err);
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
})

var options = { new: true };
router.post('/Image/Upload/:storeId',upload.single("storeImage")
,(req,res)=>{
    Store.findByIdAndUpdate(req.params.storeId,{
        $push: {
            images: server_host+":"+server_port+"/"+req.file.path
    
    }},{new:true}).then(result=>{
        if(!result){
            return res.status(400).send({message:"Could Not store Image"});
        }else{
            return res.status(200).send({imageURL:server_host+":"+server_port+"/"+req.file.path,message:"image Stored Succesfully"});
        }
    })
    .catch(err =>{
        return res.status(500).send({message:"Could Not Process Request"});
    });
});
      

// add if (!req.user) to add authentication issues 
router.post('/Image/Remove/:storeId/:image',(req,res)=>{
    
    Store.findByIdAndUpdate(req.params.storeId,{
        $pull: {
            images: req.file.path
        }
    
    },{new:true}).then(result=>{
        if(!result){
            return res.status(400).send({message:"Could Not remove Image"});
        }else{
            return res.status(200).send({message:"image Removed Succesfully"});
        }
    })
    .catch(err =>{
        return res.status(500).send({message:"Could Not Process Request"});
    });
});

router.get('/getStoreCount/:id',(req,res)=>{
    Store.find({owner:req.params.id}).then(stores=>{
        if(stores.length==0){
            return res.status(200).send({count:0,storeId:""});    
        }
        return res.status(200).send({count:stores.length,storeId:stores[0]["_id"]});
    }).catch(err=>{console.log(err)});
});

let getStoreImage = (storeId) =>{
    return new Promise(function(resolve, reject){
        Store.findById(storeId).then(store=>{
            if(!store){
                return null;
            }
            else{
                
                resolve(store.images);
            }
        }).catch(err=>{console.log(err);});     
      });
}
router.delete('/delete/image/',(req,res)=>{
    objects =[];
    objects.push({Key:req.body.imageName});
    var params = {
        Bucket: 'asifbucketclass', 
        Delete: { // required
          Objects:objects,
        },
      };
         console.log(objects);             
      s3.deleteObjects(params, function(err, data) {
        if (err){
            console.log(err);
             return res.status(515).send({message:"Store not deleted Images were not delted"});// an error occurred
    }else     return res.status(200).send({message:"Image Deleted Succesfully"});         // successful response
      });
})
module.exports = router;
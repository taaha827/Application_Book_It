const express = require("express");
const router = express.Router();
const Owner = require('../Models/Owners');
const Store = require('../Models/Stores');
const Customer = require('../Models/Customers');
const Posts = require('../Models/Posts');
const multer = require('multer');

const mongoose = require('mongoose');
var storeLocation =  'uploads/Store/';
var customerLocation =  'uploads/Customer/';
var ownerLocation =  'uploads/Owner/';
var packageLocation =  'uploads/Posts/';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("Deciding Location");
        if(req.body.collection==="store"){
      cb(null, storeLocation);
    }
    if(req.body.collection==="customer"){
        cb(null, customerLocation);
      }
      if(req.body.collection==="owner"){
        cb(null, ownerLocation);
      }
      if(req.body.collection==="post"){
        cb(null, packageLocation);
      }
      console.log("calling Default Location");
      cb(null, storeLocation);
      
    },
    filename: function(req, file, cb) {
        console.log("File Name is "+new Date().toISOString() + file.originalname);
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
  });
var server_port =  process.env.PORT || 5000;
var server_host =  'http://powerful-peak-07170.herokuapp.com'||"http://127.0.0.1";
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        console.log("Valid Type ");
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

router.post('/Image/Upload/',upload.single("Image")
,(req,res)=>{
    console.log("In Image Upload");
    if(req.body.collection=="store"){
    Store.findByIdAndUpdate(req.body.id,{
        $push: {
            images: server_host+"/"+req.file.path
    }
    },{new:true}).then(result=>{
        if(!result){
            return res.status(400).send({message:"Could Not store Image"});
        }else{
            return res.status(200).send({imageURL:server_host+"/"+req.file.path,message:"image Stored Succesfully"});
        }
    })
    .catch(err =>{
        return res.status(500).send({message:"Could Not Process Request"});
    }); 
    }


    //Customers 
    if(req.body.collection=="customer"){
        
        console.log("In Cusomter");
        Customer.findByIdAndUpdate(req.body.id,{
            imageURL: server_host+"/"+req.file.path.replace("\\","/")
        },{new:true}).then(result=>{
            console.log(result);
            if(!result){
                return res.status(400).send({message:"Could Not store Image"});
            }else{
                return res.status(200).send({imageURL:server_host+"/"+req.file.path.replace("\\","/"),message:"image Stored Succesfully"});
            }
        })
        .catch(err =>{
            return res.status(500).send({message:"Could Not Process Request"});
        }); 
        }


        //Owners  
        if(req.body.collection=="owner"){
            Owner.findByIdAndUpdate(req.body.id,{
                
                    imageUrl: server_host+"/"+req.file.path
            
            },{new:true}).then(result=>{
                if(!result){
                    return res.status(400).send({message:"Could Not store Image"});
                }else{
                    return res.status(200).send({imageURL:server_host+"/"+req.file.path,message:"image Stored Succesfully"});
                }
            })
            .catch(err =>{
                return res.status(500).send({message:"Could Not Process Request"});
            }); 
            }





            //Packages
            if(req.body.collection=="post"){
                Posts.findByIdAndUpdate(req.body.id,{
                        image: server_host+"/"+req.file.path
                },{new:true}).then(result=>{
                    if(!result){
                        return res.status(400).send({message:"Could Not store Image"});
                    }else{
                        return res.status(200).send({imageURL:server_host+"/"+req.file.path,message:"image Stored Succesfully"});
                    }
                })
                .catch(err =>{
                    return res.status(500).send({message:"Could Not Process Request"});
                }); 
                }
                        
});


module.exports = router;
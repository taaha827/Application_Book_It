const express = require('express');
const router = express.Router();
const Store = require('../Models/Stores');
const Package = require('../Models/Packages');
const owner = require('../Models/Owners');
//API Routes
router.post('/create',(req,res)=>{
    console.log(req.body.title);
    console.log(req.body.description);
    console.log(req.body.price);
    console.log(req.body.store);
    if(!req.body){
        return res.status(400).send({message:"Package Cannot Be Null"})
    }
    else{
        const newPackage = new Package(req.body);
        newPackage.save().then(result=>{
            res.status(200).send({packageId:result._id,message:"Oackage Created Successfully"});
            return;
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({message:"Could Not Create New Package, Try Again"});
            return;
        });
    }
});



router.delete('/delete/:packageId/:ownerId',(req,res)=>{
    const ownerId = req.params.ownerId;
    const packageId = req.params.packageId;
    owner.findOne({_id:ownerId}).then(ownerObj=>{
        if(!ownerObj){
            res.status(400).send({message:"Owner Not Found"});
            return;
        }else{
            Package.findByIdAndRemove(packageId).then(result=>{
                if(!result){
                    return res.status(404).send({message:"Package Not Found"});
                }
                else{
                    return res.status(200).send({"PackageId":result._id,"message":"Package Deleted Successfully"});
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).send({message:"Server Could Not Process Request Try Again"});
    });
});

router.get('/getAll/:storeId',(req,res)=>{
    const storeId = req.params.storeId;
    if(!storeId){
        return res.status(404).send({message:"Store Id can not be null"});
    }else{
        Package.find({store:storeId}).populate("_stores").then(result =>{
            return res.status(200).send(result);
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.get('/getStore/:packageId',(req,res)=>{
    const packageId = req.params.packageId;
    if(!packageId){
        return res.status(404).send({message:"Package Not Found"});
    }
    else{
        Package.findOne({_id:packageId}).populate("_stores").then(result=>{
            if(!result){
                return res.status(400).send({message:"Package Not Found!"});
            }else{
                return res.status(200).send(result);
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
});


router.put('/update/:storeId',(req,res)=>{
    if(!req.body){
        return res.status(400).send({message:"Cannot Update Store with no Reference"});
    }
    else{
        Package.findByIdAndUpdate(req.params.storeId,{
            title:req.body.package.title,
            description:req.body.package.description,
            price:req.body.package.price,
            store:req.body.package.store
        },{new:true})
        .then(result =>{
            if(!result){
                return res.status(404).send({message:"Package Not found to update"});
            }else{
                return res.status(200).send({UpdatedPackage:result,message:"Package Updated Successfully"});
            }
        })
        .catch(err=>{
            return res.status(500).send({message:"Could Not Process Request"});
        })
    }
})



module.exports = router;
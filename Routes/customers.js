//passport.authenticate('jwt', { session: false }) Add this to every route

const express = require("express");
const router = express.Router();
const CUSTOMERS = require('../Models/Customers');
const mongoose = require('mongoose');
const STORES = require('../Models/Stores');
const OWNERS = require('../Models/Owners')
const POSTS = require('../Models/Posts');
const APPOIENTMENTS = require('../Models/Appointments');
const COMMENT = require('../Models/comments');
const AppointmentReview = require('../Models/OwnerReviews')
const passport = require('../config/passport')
const favourites = require('../Models/favourites');
const userCredential = require('../Models/UserCredential')



router.post('/create', (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else {
        const newCustomer = new CUSTOMERS   (req.body);
        newCustomer.save().then(result => {
            res.status(200).send(result._id);
            return;
        })
            .catch(err => {
                res.status(500).send({ message: "Could Not Add New Customer, Try Again" });
                return;
            });
    }
});



router.delete('/delete/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    CUSTOMERS.findByIdAndRemove(customerId).then(result => {
        if (!result) {
            res.status(400).send({ message: "Customer Not Found" });
            return;
        } else {
            return res.status(200).send({ "CustomerId": result._id, "message": "Customer Deleted Successfully" });
        }
    })

        .catch(err => {
            res.status(500).send({ message: "Server Could Not Process Request Try Again" });
        });
});


router.get('/getCustomer/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    if (!customerId) {
        return res.status(404).send({ message: "Customer  Not Found" });
    }
    else {
        CUSTOMERS.findOne({ _id: customerId }).then(result => {
            if (!result) {
                return res.status(400).send({ message: "Customer Not Found!" });
            } else {
                console.log("Found Customer: "+result)
                return res.status(200).send(result);
            }
        })
            .catch(err => {
                return res.status(500).send({ message: "Could Not Process Request" });
            })
    }
});


router.put('/update/:customerId', (req, res) => {
    if (!req.body) {
        return res.status(400).send({ message: "Cannot Update Customer with no Reference" });
    }
    else {
        CUSTOMERS.findByIdAndUpdate(req.params.customerId, req.body, { new: true })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Custoemr Not found to update" });
                } else {
                    userCredential.findOneAndUpdate({email:req.body.email},{ $set: { email: req.body.email }}, {new:true})
                    .then(ansert => {
                        return res.status(200).send({ UpdatedCustomer: result, message: "Customer Updated Successfully" });
                    }).catch(err=>{
                        return res.status(500).send({ message: "Could Not Process Request" });
                    })
                }
            })
            .catch(err => {
                return res.status(500).send({ message: "Could Not Process Request" });
            })
    }
});

router.get('/getCustomerId/:email', (req, res) => {
    console.log(req.params.email);
    CUSTOMERS.find({ email: req.params.email }).then(user => {
        console.log(user[0]._id);
        if (!user) {
            return res.status(404).send({ message: "User Not found" });
        }
        else { return res.status(200).send({ ownerId: user[0]._id }); }
    })
});

router.get('/getCustomerObject/:email', (req, res) => {
    CUSTOMERS.find({ email: req.params.email }).then(user => {
        console.log({ email: req.params.email });
        if (user.length===0) {
            return res.status(404).send({ message: "User Not found" });
        }
        else { return res.status(200).send({ ownerId: user[0] }); }
    })
});

let dummy = ()=>{
    console.log("hahah")
}
// Stores for Customer 
router.get('/getStores/all', (req, res) => {
    STORES.find().select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "Stores Not Found" });
            }
            else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(503).send({ message: "Could NOt Process Request" });
        });
});

router.get('/favorites/:customerId', (req,res) =>{
    favourites.find({customer:req.params.customerId})
    .populate('store',{ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Stores Not Found" });
        }
        else {
            return res.status(200).send(result);
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(503).send({ message: "Could NOt Process Request" });
    });

})
router.post('/addToFavorites/', (req,res) => {
    let f = new favourites(req.body)
    f.save().then(result => {
        res.status(200).send(result._id);
        return;
    })
        .catch(err => {
            res.status(500).send({ message: "Could Not Add as faviourite, Try Again" });
            return;
        });

})

router.put('/removeFromFavorite/:storeId/:customerId', (req,res) =>{ 
    favourites.findOneAndRemove({store:req.params.storeId,customer:req.params.customerId})
    .then(result => {
        if(!result) {
            return res.status(500).send({message: "Could not remove from Favorites"})
        }
        else{
            return res.status(200).send({message:"Removed from Favorites"})
        }
    })
    .catch(err =>{
        return res.status(505).send({message:'Couldnt process request'})
    })
})

router.get('/getStores/all/:name', (req, res) => {
    STORES.find({ "name": { "$regex": req.params.name, "$options": "i" } }).select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "Stores Not Found" });
            }
            else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(503).send({ message: "Could NOt Process Request" });
        });
});
function getRandomArbitrary(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
  }
  //, passport.authenticate('jwt', { session: false })
router.get('/getStores/all/:category/:subCategory', async (req, res) => {
    if(req.params.category =='All') {
        // Random Any Stores
        if(req.params.subCategory =='All') {
            STORES.find({})
            .select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Stores Not Found" });
                }
                else {
                    return res.status(200).send(result);
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(503).send({ message: "Could NOt Process Request" });
            });
        }        
        else{
            let limitrecords=30;
            console.log('In Here!!!')
            STORES.find({ "subcategory": { "$regex": req.params.subCategory, "$options": "i" }})
            .select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Stores Not Found" });
                }
                else {
                    return res.status(200).send(result);
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(503).send({ message: "Could NOt Process Request" });
            });
    
            
        }
    }
    else{
        if(req.params.subCategory =='All'){
        STORES.find({category:req.params.category })
        .select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "Stores Not Found" });
            }
            else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(503).send({ message: "Could NOt Process Request" });
        });
        }
        else{
            console.log("In HERE")
            STORES.find({category:req.params.category ,subcategory:req.params.subCategory})
            .select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1 })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Stores Not Found" });
                }
                else {
                   return res.jsonp(result);
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(503).send({ message: "Could NOt Process Request" });
            });
    
        }

    }
});

router.post('/findStores', async (req, res) =>{
    let StoresDistance = await STORES.find({}).select({location:1})
    console.log(StoresDistance)
    let foundStores = []
    for (let index = 0; index < StoresDistance.length; index++) {
        const storeDistance = StoresDistance[index];
        console.log('Latitude ',storeDistance.location[0].lat,'Longitude',storeDistance.location[0].lng)
        let distanceFromLocation = measure(req.body.lat,req.body.lng,storeDistance.location[0].lat,storeDistance.location[0].lng)
        console.log('Distance', distanceFromLocation)
        if(distanceFromLocation<30){
            foundStores.push(storeDistance._id)
        }
    }
    STORES.find().where('_id').in(foundStores)
    .select({ name: 1, description: 1, contact: 1, starttime: 1, closetime: 1, images: 1, category: 1,location:1 })
    .then(result => {
        if (!result) {
            return res.status(404).send({ message: "Stores Not Found" });
        }
        else {
            return res.status(200).send(result);
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(503).send({ message: "Could NOt Process Request" });
    });
    

})
function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6371; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d ; // meters
}

router.get('/getStore/:storeId', async (req, res) => {
    let result = {};
    let posts = await POSTS.find({ store: req.params.storeId });
    let store = await STORES.findById(req.params.storeId).populate('owner');
    result['store'] = store;
    console.log(store);
    result['posts'] = [];
    posts.forEach(item => {
        result['posts'].push({
            image: item.image[0],
            comments: item.comments.length,
            likes: item.likes,
            title: item.title,
            description: item.description
        });
    });
    return res.status(200).send(result);
});

router.get('/appointment/get/:appointmentId', (req, res) => {
    APPOIENTMENTS.find({ _id: req.params.appointmentId }).populate('store')
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "No Appointments Found" });
            }
            else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
        })

})
router.get('/appointment/getAll/:customerId', (req, res) => {
    APPOIENTMENTS.find({ customer: req.params.customerId }).populate('store')
        .then(result => {
            if (!result) {
                return res.status(404).send({ message: "No Appointments Found" });
            }
            else {
                return res.status(200).send(result);
            }
        })
        .catch(err => {
            console.log(err);
        })
});
router.get('/appointments/:storeId', (req, res) => {
    APPOIENTMENTS.find({ store: req.params.storeId }).select({ startTime: 1, endTime: 1, _id: 0 })
        .then(result => {
            Result = {}
            Result['ReservedTimes'] = [];
            result.forEach(item => {
                let start = new Date(item.startTime)
                let end = new Date(item.endTime);
                Result['ReservedTimes'].push({
                    Date: start.getDate(),
                    Month: start.getMonth(),
                    Year: start.getFullYear(),
                    startHour: start.getHours(),
                    endHour: end.getHours()
                });
            })
            return res.status(200).send(result);
        })
        .catch(err => {
            console.log(err);
            res.status(503);
        })
})


router.post('/appointment/:storeId', async (req, res) => {
    let a = new Date(req.body.startTime);
    console.log("Hours from request " + a.getHours());
    let storeTiming = await STORES.findById(req.params.storeId).select({ startTime: 1, closeTime: 1 });
    let startTime = calculateTime(storeTiming.startTime);
    let close = calculateTime(storeTiming.closeTime);
    if (a.getHours() < startTime || a.getHours() > close) {
        return res.status(301).send({ message: "Store is not operational at this time" });
    }
    let newappointment = new APPOIENTMENTS(req.body);
    newAppointment.save().then(result => {
        res.status(200).send({ AppointmentId: result._id, message: "Appointment Created Successfully" });
        return;
    })
        .catch(err => {
            res.status(500).send({ message: "Could Not Add New Appointment, Try Again" });
            return;
        });

});

let calculateTime = (time) => {
    console.log("I am here " + time.toLowerCase());
    if (time.toLowerCase().includes('am')) {
        console.log('Found Something');
        time = time.split('am')[0];
        return parseInt(time);
    }
    else if (time.toLowerCase().includes('pm')) {
        console.log('Found Something');
        time = time.split('pm')[0];
        return parseInt(time) + 12;
    }
}



router.get('/post/getcomments/:postId', async (req, res) => {
    kakashi ={}
    console.log("In Get Comments")
    kakashi["comments"]=[];
    let result = await POSTS.findById(req.params.postId).select({comments:1});
    let a = await getComments(result)
    if(a === null){
        return res.status(404).send({message:"Could not find Post"})
    }
    return res.status(200).send(a);
})

let getComments = (comments)=>{
    return new Promise(async function(resolve, reject){
        console.log("Calling C")
        const finalComments = []
        console.log(comments)

        newComments = await getC(comments)
        if(newComments === null){
            resolve(null)
        }
        for (let index = 0; index < newComments.length; index++) {
            let temp={}
            const element = newComments[index];
            console.log('Element==========>',element)
            if(element.CommentBy){
            let cName = await getCustomer(element.CommentBy)
            if(cName ==null){
                cName = {}
                cName._id =0,
                cName.name="Default User"

            }
            temp.CommentId = element._id
            temp._id = cName._id
            temp.commentBy = cName.name
            temp.value = element.value
            temp.date = element.Date
            temp.subComments =[]
            for (let index = 0; index < element.subreviews.length; index++) {
                const element1 = element.subreviews[index];
                let subComment =await getC({comments:[element1]})
                console.log('Subcomment Customers----------------->',subComment[0])
                if(subComment[0].CommentBy){
                let getSubCN = await getCustomer(subComment[0].CommentBy)
                if(getSubCN ==null){
                    getSubCN={}
                    getSubCN._id =0,
                    getSubCN.name="Default User"

                }
    
                temp.subComments.push({
                    CommentById: getSubCN._id,
                    CommentBy: getSubCN.name,
                    value:subComment[0].value,
                    Date: subComment.Date
                })
            }
            else{
                let getSubCN = await getOwner(subComment[0].ownerComment)
                if(getSubCN ==null){
                    getSubCN = {}
                    getSubCN._id =0,
                    getSubCN.name="Default User"
                }
                temp.subComments.push({
                    CommentById: getSubCN._id,
                    CommentBy: getSubCN.name,
                    value:subComment[0].value,
                    Date: subComment.Date
                })

            }
            }
            finalComments.push(temp)
            }
            else{
                let oName = await getOwner(element.ownerComment)
                if(oName ==null){
                    oName = {}
                    oName._id =0,
                    oName.name="Default User"
                }
                temp.CommentId = element._id
                temp._id = oName._id
                temp.commentBy = oName.name
                temp.value = element.value
                temp.date = element.Date
                temp.subComments =[]
                for (let index = 0; index < element.subreviews.length; index++) {
                    const element1 = element.subreviews[index];
                    let subComment =await getC({comments:[element1]})
                    console.log('Sub COMMENTS==================>',subComment[0])
                    if(subComment[0].CommentBy){
                    let getSubCN = await getCustomer(subComment[0].CommentBy)
                    if(getSubCN ==null){
                        getSubCN = {}
                        getSubCN._id =0,
                        getSubCN.name="Default User"
                    }
    
                    temp.subComments.push({
                        CommentById: getSubCN._id,
                        CommentBy: getSubCN.name,
                        value:subComment[0].value,
                        Date: subComment.Date
                    })
                }
                    else{
                        let getSubCN = await getOwner(subComment[0].ownerComment)
                        if(getSubCN ==null){
                            getSubCN={}
                            getSubCN._id =0,
                            getSubCN.name="Default User"
                        }
        
                        temp.subComments.push({
                            CommentById: getSubCN._id,
                            CommentBy: getSubCN.name,
                            value:subComment[0].value,
                            Date: subComment.Date
                        })
    
                    }
                }
                finalComments.push(temp)
                 
            }
        }
            resolve(finalComments)     
})
}

router.get('/getReview/store/:StoreID',(req,res)=>{
        AppointmentReview.find({store:req.params.StoreID,from:"customer"},
        {
        "appointment":1,
        "date":1,
        "numberOfStars":1,
        "comment":1,
        })
        .populate("customer",{_id:1,firstName:1,lastName:1})
        .populate("store","name")
        .then(result=>{
            if(!result){
                return res.status(404).send({message:"No Review Found"});
            }
            else{
                return res.status(200).send(result);
            }           
        })
        .catch(err=>{
            console.log(err);
            return res.status(505).send({message:"Could  Not Process Request"});
        })
    
        
    });

let getCustomer = (storeId) =>{
    return new Promise(function(resolve, reject){
       
        console.log("CustomerId:"+storeId)
        CUSTOMERS.findOne({_id:storeId},{_id:1,firstName:1,lastName:1,imageURL:1})
        .then(Customer=>{
            if(!Customer){
                console.log(storeId)
                console.log("In not Customer")
                resolve( null);
            }
            else{
                console.log(Customer)
                if(!Customer){
                    resolve({_id: Customer._id,name:Customer.firstName+" "+Customer.lastName});
                }
                else{
                    resolve({_id: Customer._id,name:Customer.firstName+" "+Customer.lastName,image:Customer.imageURL});
                    
                }
            }
        }).catch(err=>{console.log(err);});     
      });
}

let getOwner = (ownerId) =>{
    return new Promise(function(resolve, reject){
       
        
        OWNERS.findOne({_id:ownerId},{_id:1,firstName:1,lastName:1,imageURL:1})
        .then(Owner=>{
            if(!Owner){
                console.log(Owner)
                console.log("In not Owner")
                resolve(null);
            }
            else{
                console.log(Owner)
                if(!Owner){
                    resolve({_id: Owner._id,name:Owner.firstName+" "+Owner.lastName});
                }
                else{
                    resolve({_id: Owner._id,name:Owner.firstName+" "+Owner.lastName,image:Owner.imageURL});
                    
                }
            }
        }).catch(err=>{console.log(err);});     
      });
}
let getC = (references)=>{
    
    return new Promise(function(resolve, reject){
            if(!references||!references.comments){
                resolve(null)
            }
            COMMENT.find({_id: { $in:references.comments}})
            .then(result=>{
                console.log("Resolving")
                resolve (result);
            })
      });

}

router.post('/post/subComment/:commentId', (req, res) => {
    let comment = new COMMENT(req.body);
    comment.save().then(result=>{
        COMMENT.findOneAndUpdate({_id:req.params.commentId},
            {$push:{subreviews:result._id}})
        .then(result1=>{
            return res.status(200).send({id:result1._id});
        }).catch(err=>{
            console.log(err);
        })
    }).catch(err=>{
        console.log(err);
        return res.status(504).send({message:"Not possible"});
    })
});

router.post('/post/comment/:postId', (req, res) => {
    let comment = new COMMENT(req.body);
    comment.save().then(result=>{
        POSTS.findOneAndUpdate({_id:req.params.postId},{$push:{comments:result._id}})
        .then(result1=>{
            return res.status(200).send({id:result1._id});
        }).catch(err=>{
            console.log(err);
        })
    }).catch(err=>{
        console.log(err);
        return res.status(504).send({message:"Not possible"});
    })
});
router.delete('/post/subComment/:subcommentId/:commentId', (req, res) => {
    try{
    COMMENT.remove({_id:req.params.subcommentId})
    COMMENT.findOneAndUpdate({_id:req.params.commentId},
        {$pull:{subreviews:req.params.subcommentId}})
    .then(result1=>{
        return res.status(200).send({id:result1._id});
    }).catch(err=>{
        console.log(err);
    })
    }
    catch(err){
        return res.status(500).send({message:"Couldn't Process Request"});
    }
});

router.delete('/post/comment/:commentId', (req, res) => {
    try{
        COMMENT.remove({_id:req.params.commentId})
        POSTS.update({comments:req.params.commentId},
            {$pull:{comments:req.params.commentId}})
            .then(result1=>{
                return res.status(200).send({id:result1._id});
            }).catch(err=>{
                console.log(err);
            })
        }
    catch(err){
        return res.status(500).send("Could not process request")
    }
});

module.exports = router;





// Appointments for Customer 














const express = require("express");
const router = express.Router();
const CUSTOMERS = require('../Models/Customers');
const mongoose = require('mongoose');
const STORES = require('../Models/Stores');
const POSTS = require('../Models/Posts');
const APPOIENTMENTS = require('../Models/Appointments');
const COMMENT = require('../Models/comments');
const AppointmentReview = require('../Models/OwnerReviews')
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
        CUSTOMERS.findByIdAndUpdate(req.params.customerId, {
            status: req.body
        }, { new: true })
            .then(result => {
                if (!result) {
                    return res.status(404).send({ message: "Custoemr Not found to update" });
                } else {
                    return res.status(200).send({ UpdatedCustomer: result, message: "Customer Updated Successfully" });
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

// For Post 
// first image
// total like 
// total commments 
// name 
// description 

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
            let cName = await getCustomer(element.CommentBy)
            temp.CommentId = element._id
            temp._id = cName._id
            temp.commentBy = cName.name
            temp.value = element.value
            temp.date = element.Date
            temp.subComments =[]
            for (let index = 0; index < element.subreviews.length; index++) {
                const element1 = element.subreviews[index];
                let subComment =await getC({comments:[element1]})
                if(element.CommentBy){
                let getSubCN = await getCustomer(subComment[0].CommentBy)
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
        console.log("In here 1 ")
        console.log("CustomerId:"+storeId)
        CUSTOMERS.findOne({_id:storeId},{_id:1,firstName:1,lastName:1,imageURL:1})
        .then(Customer=>{
            if(!Customer){
                console.log(Customer)
                console.log("In not Customer")
                return null;
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

// let getComments=  (item)=>{
//     return new Promise(async function(resolve, reject){
//         console.log("waiting for comments");
//         let com = await COMMENT.findById(item).populate('subreviews')
//         console.log("found Comment ");
//         console.log(com)
//         let subComments = []
//         subComments["answers"]=[];
//          com.subreviews.forEach(item=>{
//             subComments["answers"].push({sub:item.value});
//         })
//         console.log("Returning Resolve");
//         console.log(subComments["answers"]);
//         resolve(subComments["answers"]);
//       });
   
// }
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














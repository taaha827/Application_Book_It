const express = require("express");
const router = express.Router();
const Customer = require('../Models/Customers');
const mongoose = require('mongoose');
const STORES = require('../Models/Stores');
const POSTS = require('../Models/Posts');
const APPOIENTMENTS = require('../Models/Appointments');
const COMMENT = require('../Models/comments');
router.post('/create', (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: 'All Required fields Not Entered' });
        return;
    }
    else {
        const newCustomer = new Customer(req.body);
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
    Customer.findByIdAndRemove(customerId).then(result => {
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
        Customer.findOne({ _id: customerId }).then(result => {
            if (!result) {
                return res.status(400).send({ message: "Customer Not Found!" });
            } else {
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
        Customer.findByIdAndUpdate(req.params.customerId, {
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
    Customer.find({ email: req.params.email }).then(user => {
        console.log(user[0]._id);
        if (!user) {
            return res.status(404).send({ message: "User Not found" });
        }
        else { return res.status(200).send({ ownerId: user[0]._id }); }
    })
});

router.get('/getCustomerObject/:email', (req, res) => {
    Customer.find({ email: req.params.email }).then(user => {
        console.log(user[0]._id);
        if (!user) {
            return res.status(404).send({ message: "User Not found" });
        }
        else { return res.status(200).send({ ownerId: user[0] }); }
    })
});


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
    kakashi["comments"]=[];
    let result = await POSTS.findById(req.params.postId).select({comments:1});
    for(var i =0;i<result.comments.length;i++){
        let answer = await getComments(result.comments[i]);
        kakashi["comments"].push({main:result.comments[i].value,sub:answer});
    }
    return res.status(200).json(kakashi["comments"]);
})
let getComments=  (item)=>{
    return new Promise(async function(resolve, reject){
        console.log("waiting for comments");
        let com = await COMMENT.findById(item).populate('subreviews')
        console.log("found Comment ");
        let subComments = []
        subComments["answers"]=[];
         com.subreviews.forEach(item=>{
            subComments["answers"].push({sub:item.value});
        })
        console.log("Returning Resolve");
        console.log(subComments["answers"]);
        resolve(subComments["answers"]);
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
module.exports = router;





// Appointments for Customer 














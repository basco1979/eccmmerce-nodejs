const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');


router.get('/', async (req, res) => {
    const orders = await Order.find();
    if(!orders){
        res.status(500).json({success:false})
    }
    res.send(orders);
})

router.post('/', (req, res) => {
    const order = new Order({
        name : req.body.name,
        image : req.body.image,
        countInStock : req.body.countInStock
    })
    order.save().then((createOrder => {
        res.status(201).json(createOrder);
    })).catch((err)=>{
        res.status(500).json({
            error : err,
            success : false
        })
    })
})

module.exports = router;
const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');
const {OrderItem} = require('../models/orderItem');


router.get('/', async (req, res) => {
    const orders = await Order.find().populate('user', 'name').sort({'dateOrdered' : -1});
    if(!orders){
        res.status(500).json({success:false})
    }
    res.send(orders);
})

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({path : 'orderItem', populate : {path : 'product', populate : 'category'}});
    if(!order){
        res.status(500).json({success:false})
    }
    res.send(order);
})

router.post('/', async (req, res) => {

    const orderItemIds = Promise.all(req.body.orderItem.map(async(orderitem)=>{
        let newOrderItem = new OrderItem({
            quantity : orderitem.quantity,
            product : orderitem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;

    }))

    const orderItemsIdsResolved = await orderItemIds;
    let order = new Order({
        orderItem : orderItemsIdsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city : req.body.city,
        zip : req.body.zip,
        country : req.body.country,
        phone : req.body.phone,
        status : req.body.status,
        totalPrice : req.body.totalPrice,
        user : req.body.user
    })
    order = await order.save()
    if (!order) return res.status(404).send('the order connot be created')
    res.send(order)
})

module.exports = router;
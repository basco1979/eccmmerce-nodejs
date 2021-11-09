const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')
const { OrderItem } = require('../models/orderItem')


router.get('/', async (req, res) => {
    const orders = await Order.find()
        .populate('user', 'name')
        .sort({ dateOrdered: -1 })
    if (!orders) {
        res.status(500).json({ success: false })
    }
    res.send(orders)
})

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItem',
            populate: { path: 'product', populate: 'category' },
        })
    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order)
})

router.post('/', async (req, res) => {
    const orderItemIds = Promise.all(
        req.body.orderItem.map(async (orderitem) => {
            let newOrderItem = new OrderItem({
                quantity: orderitem.quantity,
                product: orderitem.product,
            })

            newOrderItem = await newOrderItem.save()

            return newOrderItem._id
        })
    )

    const orderItemsIdsResolved = await orderItemIds
    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                'product',
                'price'
            )
            const totalPrice = orderItem.product.price * orderItem.quantity
            return totalPrice
        })
    )
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order({
        orderItem: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save()
    if (!order) return res.status(404).send('the order connot be created')
    res.send(order)
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    )
    if (!order) return res.status(404).send('the order connot be updated')
    res.send(order)
})

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItem.map(async (orderIt) => {
                    await OrderItem.findByIdAndRemove(orderIt)
                })
                return res.status(200).json({
                    success: true,
                    meessage: 'the order is deleted',
                })
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'order not found' })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

router.get('/get/totalSales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
    ])
    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }
    res.send({ totalSales: totalSales.pop().totalSales })
})

router.get('/get/count', async (req, res) => {
    const ordersCount = await Order.countDocuments()
    if (!ordersCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        ordersCount: ordersCount,
    })
})

router.get('/get/userOrders/:userId', async (req, res) => {
    const userOrders = await Order.find({ user: req.params.userId })
        .populate({
            path: 'orderItem',
            populate: { path: 'product', populate: 'category' },
        })
        .sort({ dateOrdered: -1 })
    if (!userOrders) {
        res.status(500).json({ success: false })
    }
    res.send(userOrders)
})



module.exports = router

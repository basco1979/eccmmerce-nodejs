const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const {Product} = require('../models/product');


router.get('/', async (req, res) => {
    const products = await Product.find();
    if(!products){
        res.status(500).json({success:false})
    }
    res.send(products);
})

router.post('/', async (req, res) => {
    const category = await Category.findById(req.body.category);
    if(!category)return res.status(400).send('Invalid category');

    const product = new Product({
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescription,
        brand : req.body.brand, 
        image : req.body.image,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,
        isFeatured : req.body.isFeatured,
    })
    
    product = await product.save();
    if(!product) return res.status(500).send("The product cannot be created");
    
    res.send(product);
})


module.exports = router;
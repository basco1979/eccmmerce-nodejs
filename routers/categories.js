const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');   
const { Category } = require('../models/category')

router.get('/', async (req, res) => {
    const categories = await Category.find()
    if (!categories) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(categories)
})

router.get('/:id', async(req, res)=>{
   const category = await Category.findById(req.params.id);
   if (!category) {
    res.status(500).json({ success: false, message:"The category with the given ID not exists" })
}
res.status(200).send(category)
})

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
    category = await category.save()
    if (!category) return res.status(404).send('the category connot be created')
    res.send(category)
})

router.put('/:id', async(req, res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Category Id')
    }
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name : req.body.name,
            color : req.body.color,
            icon : req.body.icon
        },
        {new: true}
    )
    if (!category) return res.status(404).send('the category connot be updated')
    res.send(category)
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then((category) => {
            if (category) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        meessage: 'the category is deleted',
                    })
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'category not found' })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

module.exports = router

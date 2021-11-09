const express = require('express')
const { Category } = require('../models/category')
const router = express.Router()
const { Product } = require('../models/product')
const mongoose = require('mongoose')

const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const validFile = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid image type')
        if (validFile) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})

const uploadOptions = multer({ storage: storage })

/* router.get('/', async (req, res) => {
    const products = await Product.find().populate('category');
    if(!products){
        res.status(500).json({success:false})
    }
    res.send(products);
}) */

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send(product)
})

//filtrar con query params
router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = { category: req.query.categories }
    }

    const products = await Product.find(filter).populate('category')
    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products)
})

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const file = req.file
    if (!file) return res.status(400).send('No image in the request')
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get(
        'host'
    )}/backend/public/uploads`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save()
    if (!product) return res.status(500).send('The product cannot be created')

    res.send(product)
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(400).send('Invalid product')

    const file = req.file
    let imagepath
    if (file) {
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get(
            'host'
        )}/backend/public/uploads`
        imagepath = `${basePath}${fileName}`
    }
    else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            image: imagepath,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )
    if (!updatedProduct) return res.status(404).send('the product connot be updated')
    res.send(updatedProduct)
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    meessage: 'the product is deleted',
                })
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'product not found' })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments()
    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount,
    })
})

router.get('/get/featured/', async (req, res) => {
    const productFeatured = await Product.find({
        isFeatured: true,
    })
    if (!productFeatured) {
        res.status(500).json({ success: false })
    }
    res.send(productFeatured)
})

//limitar la cantidad de featured
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0

    const productFeatured = await Product.find({
        isFeatured: true,
    }).limit(+count)
    if (!productFeatured) {
        res.status(500).json({ success: false })
    }
    res.send(productFeatured)
})


//Para subir varias imagenes
router.put('/gallery-images/:id', 
uploadOptions.array('images', 10), 
async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagepaths = [];
    const basePath = `${req.protocol}://${req.get(
        'host'
    )}/backend/public/uploads`;
    if(files){
        files.map(file=>{
            imagepaths.push(`${basePath}${file.fileName}`)
        })
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagepaths,
        },
        { new: true }
    )
    if (!product) return res.status(404).send('the product connot be updated')
    res.send(product)
})
module.exports = router

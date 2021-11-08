const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { User } = require('../models/user')

router.get('/', async (req, res) => {
    const users = await User.find().select('-passwordHash')
    if (!users) {
        res.status(500).json({ success: false })
    }
    res.send(users)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
        res.status(500).json({
            success: false,
            message: 'The user with the given ID not exists',
        })
    }
    res.status(200).send(user)
})

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin,
    })

    user = await user.save()
    if (!user) return res.status(400).send('the user cannot be created')
    res.send(user)
})

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin,
    })

    user = await user.save()
    if (!user) return res.status(400).send('the user cannot be created')
    res.send(user)
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    const secret = process.env.SECRET
    if (!user) return res.status(400).send('The user not found')

    if (user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
        const token = jwt.sign(
            {
                userID: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1h' }
        )
        res.status(200).send({ user: user.email, token })
    } else {
        res.status(400).send('Wrong password')
    }
})

router.put('/:id', async (req, res) => {
    const userExists = await User.findById(req.params.id)
    let newPassword
    if (req.body.passwordHash) {
        newPassword = bcrypt.hashSync(req.body.passwordHash, 10)
    } else {
        newPassword = userExists.passwordHash
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
            phone: req.body.phone,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            isAdmin : req.body.isAdmin
        },
        { new: true }
    )
    if (!user) return res.status(404).send('the user connot be updated')
    res.send(user)
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    meessage: 'the user is deleted',
                })
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'user not found' })
            }
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments()
    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount,
    })
})

module.exports = router

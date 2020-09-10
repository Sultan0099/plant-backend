const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');

const User = require('../models/user');
const UserAddress = require('../models/userAddress');

router.post('/signup', (req, res, next) => {

    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {

            if (user) {
                return res.status(400).json({
                    message: 'Email Already Exists'
                })
            } else {

                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Something went wrong'
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hash,
                            createdAt: new Date().toISOString()
                        });

                        user.save()
                            .then(user => {
                                console.log("docs", user);
                                const payload = {
                                    userId: user._id,
                                    iat: Math.floor(Date.now() / 1000) - 30,
                                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 24),
                                }
                                jwt.sign(payload, 'mysecretkey', (err, token) => {
                                    if (err) {
                                        return res.status(500).JSON({
                                            message: 'Authentication Failed'
                                        });
                                    } else {
                                        res.status(200).json({
                                            user: {
                                                userId: user._id,
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                email: user.email
                                            },
                                            token: token
                                        })
                                    }
                                })
                            })
                            .catch(er => {
                                res.status(500).json({
                                    error: er
                                });
                            });


                    }

                });

            }


        });


});


router.post('/login', (req, res, next) => {

    User.findOne({ email: req.body.email })
        .select('_id firstName lastName email password')
        .exec()
        .then(user => {
            if (user) {

                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: 'Login Failed'
                        })
                    } else {
                        if (result) {
                            const payload = {
                                userId: user._id,
                                iat: Math.floor(Date.now() / 1000) - 30,
                                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 24),
                            }
                            jwt.sign(payload, 'mysecretkey', (err, token) => {
                                if (err) {
                                    return res.status(500).JSON({
                                        message: 'Authentication Failed'
                                    });
                                } else {
                                    res.status(200).json({

                                        user: {
                                            userId: user._id,
                                            firstName: user.firstName,
                                            lastName: user.lastName,
                                            email: user.email
                                        },
                                        token: token

                                    })
                                }
                            })
                        } else {
                            res.status(500).json({
                                message: 'Incorrect Password'
                            });
                        }
                    }
                });

            } else {
                res.status(500).json({
                    message: 'Email doesn\'t not exists'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        })


});

router.post('/new-address', authenticate, (req, res, next) => {
    const { userId } = req.user;
    UserAddress.findOne({ "user": userId })
        .exec()
        .then(user => {

            if (user) {

                UserAddress.findOneAndUpdate({ "user": userId }, {
                    $push: {
                        "address": req.body.address
                    }
                }, {
                    new: true
                })
                    .then(doc => {
                        res.status(201).json({
                            message: doc
                        });
                    });

            } else {

                const userAddress = new UserAddress({
                    _id: new mongoose.Types.ObjectId(),
                    user: userId,
                    address: req.body.address
                });

                userAddress.save()
                    .then(doc => {
                        res.status(201).json({
                            message: doc
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            error: error
                        });
                    })

            }

        });

});

router.get('/get-addresses/:userId', authenticate, (req, res, next) => {

    UserAddress.findOne({ "user": req.params.userId })
        .select('_id user address')
        .exec()
        .then(user => {
            res.status(200).json({
                message: user
            })
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })

});

router.get("/get", authenticate, async (req, res, next) => {
    try {
        console.log(req.user);

        const { userId } = req.user;

        if (!userId) return res.status(401).json({ err: "token is invalid/expire" });

        const user = await User.findOne({ _id: userId });

        if (!user) return res.status(404).json({ err: "user not found" });


        const payload = {
            userId: user._id,
            iat: Math.floor(Date.now() / 1000) - 30,
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 24),
        }
        jwt.sign(payload, 'mysecretkey', (err, token) => {
            if (err) {
                return res.status(500).JSON({
                    message: 'Authentication Failed'
                });
            } else {
                res.status(200).json({

                    user: {
                        userId: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    },
                    token: token

                })
            }
        })




    } catch (err) {
        res.status(500).json({ err })
    }
})

module.exports = router;
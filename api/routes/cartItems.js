const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const authenticate = require('../middleware/authenticate');
const CartItem = require('../models/cartItem');


router.post('/add', authenticate, (req, res, next) => {
    const { userId } = req.user;
    CartItem.findOne({ user: userId })
        .exec()
        .then(cartItem => {

            if (cartItem) {

                const item = cartItem.cart.find(item => item.product == req.body.product);
                let where, action, set;
                if (item) {
                    action = "$set";
                    where = { "user": userId, "cart.product": req.body.product };
                    set = "cart.$";
                } else {
                    action = "$push";
                    where = { "user": userId };
                    set = "cart"
                }

                CartItem.findOneAndUpdate(where, {
                    [action]: {
                        [set]: {
                            _id: item ? item._id : new mongoose.Types.ObjectId(),
                            product: req.body.product,
                            quantity: item ? (item.quantity + req.body.quantity) : req.body.quantity,
                            price: req.body.price,
                            total: item ? req.body.price * (req.body.quantity + item.quantity) : (req.body.price * req.body.quantity)
                        }
                    }
                })
                    .exec()
                    .then(newItem => {
                        res.status(201).json({
                            message: newItem
                        })
                    })
                    .catch(error => {
                        res.status(500).json({
                            message: error
                        });
                    });



            } else {
                const newCartItem = new CartItem({
                    _id: new mongoose.Types.ObjectId(),
                    user: userId,
                    cart: [
                        {
                            _id: new mongoose.Types.ObjectId(),
                            product: req.body.product,
                            quantity: req.body.quantity,
                            price: req.body.price,
                            total: req.body.quantity * req.body.price
                        }
                    ]
                });

                newCartItem
                    .save()
                    .then(newCart => {
                        res.status(201).json({
                            message: newCart
                        });
                    })
                    .catch(error => {
                        res.status(500).json({
                            error: error
                        });
                    });

            }

        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });

});

router.get('/cart-items', authenticate, async (req, res, next) => {
    try {
        const { userId } = req.user;

        const cartItems = await CartItem.findOne({ user: userId })
            .select('_id user cart')
            .populate({
                path: "cart.product",
                select: "name productPic category",
                populate: {
                    path: "productPic",
                    model: 'Image'
                }
            })



        res.status(200).json({ cartItems })
    } catch (err) {
        res.status(500).json({ err })
    }


});

router.put('/update/quantity', (req, res, next) => {

    const userId = req.body.userId;
    const productId = req.body.productId;
    const quantity = req.body.quantity;
    const total = req.body.total;

    CartItem.update({ "user": userId, "cart.product": productId }, {
        $set: {
            "cart.$.quantity": quantity,
            "cart.$.total": total
        }
    })
        .exec()
        .then(cartItem => {
            res.status(201).json({
                message: cartItem
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error
            });
        });

});

module.exports = router;
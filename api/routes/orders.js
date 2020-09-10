const express = require('express');

const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const authenticate = require('../middleware/authenticate');

const { v4: uuidV4 } = require('uuid');

const router = express.Router();



router.post('/create', authenticate, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { seller, buyer, buyerAddress, orderDate, product,
            paymentType } = req.body;

        const createdOrder = await Order.create({
            seller,
            buyer,
            product,
            orderId: uuidV4(),
            buyerAddress,
            orderDate,
            paymentType,
        });

        const order = await Order.findOne({ _id: createdOrder._id });
        const getBuyer = await User.findOne({ _id: buyer }).select({
            "__v": 0,
            "password": 0,
            "createdAt": 0
        })
        const getProduct = await Product.findOne({ _id: product }).populate("productPic");
        order.product = getProduct;
        order.buyer = getBuyer;
        res.status(200).json({ order })
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
});

router.get("/get-orders/:userType/:userId", authenticate, async (req, res) => {
    try {
        const { userId, userType } = req.params;

        if (userType === "seller" || userType === "buyer") {
            const query = userType === "seller" ? { seller: userId } : { buyer: userId }

            const orders = await Order.find(query).populate({
                path: "product",
                select: { "price": 1, "name": 1 }
            });


            return res.status(200).json({ totalOrders: orders.length, orders })
        } else {
            return res.status('403').json({ err: "wrong user type" });
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ err })

    }
});

router.patch("/update-status/:orderId/:status", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const { orderId, status } = req.params


        console.log(userId, orderId)

        const order = await Order.findOne({ orderId, seller: userId }).populate({
            path: "product",
            select: { "price": 1, "name": 1 }
        });

        if (!order) return res.status(404, "Order is not available");

        const updatedOrder = {
            ...order._doc,
            orderStatus: status
        }

        await order.updateOne({ orderStatus: status });

        res.status(200).json({ _id: order._id, order: updatedOrder })

    } catch (err) {
        return res.status(500).json({ err })
    }
})

module.exports = router;
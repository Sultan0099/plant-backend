const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    orderId: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    buyer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
    buyerAddress: {
        fullName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        pinCode: { type: String, required: true },
        locality: { type: String, required: true },
        address: { type: String, required: true },
        cityDistrictTown: { type: String, required: true },
        province: { type: String, required: true },
        landmark: String,
        alternatePhoneNumber: String
    },
    orderStatus: { type: String, enum: ["new", "shipped", "paid"], default: "new", required: true, },
    orderDate: { type: Date, default: Date.now() },
    paymentType: String,
    paymentStatus: { type: String, default: "not paid" },
    isOrderComplete: { type: Boolean, default: false },
})

module.exports = mongoose.model('Order', orderSchema);
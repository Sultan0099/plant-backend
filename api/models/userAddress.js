const mongoose = require('mongoose');

const userAddressSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: [{
        fullName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        pinCode: { type: String, required: true },
        locality: { type: String, required: true },
        address: { type: String, required: true },
        cityDistrictTown: { type: String, required: true },
        state: { type: String, required: true },
        landmark: String,
        alternatePhoneNumber: String
    }]
});

module.exports = mongoose.model('UserAddress', userAddressSchema);
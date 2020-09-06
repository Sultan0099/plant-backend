const { Schema, model } = require('mongoose');

const imgSchema = new Schema({
    mimeType: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
})

const Image = model("Image", imgSchema);

module.exports = Image;
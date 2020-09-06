const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require("morgan");
const cors = require('cors');
const path = require('path');
const authenticate = require('./api/middleware/authenticate');

const MONGO_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.aikar.mongodb.net/mystore?retryWrites=true&w=majority`;

mongoose.connect('mongodb://localhost:27017/plantApp', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log("database connected"))
    .catch(err => console.error("database error", err));

const adminRoutes = require('./api/routes/admins');
const categoryRoutes = require('./api/routes/categories');
const userRoutes = require('./api/routes/users');
const productRoutes = require('./api/routes/products');
const cartItemRoutes = require('./api/routes/cartItems');
const orderRoutes = require('./api/routes/orders');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
console.log(path.join(__dirname, "uploads"))

app.use("/uploads", express.static(path.join(__dirname, 'uploads')));
app.use('/admin', adminRoutes);
app.use('/category', categoryRoutes);
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', authenticate, cartItemRoutes);
app.use('/order', authenticate, orderRoutes);
// app.use((req, res, next) => {
//     res.status(404).json({
//         message: 'Not Found'
//     })
// })


module.exports = app;
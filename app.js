// importing packages

// Using express.js framework
// Installing packages command 'npm install package-name'
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require("morgan");
const cors = require('cors');
const path = require('path');
const authenticate = require('./api/middleware/authenticate');
require('./config/cloudinary');

// Adding database mongodb
// ORM Mongoose
const MONGO_URI = `mongodb+srv://admin:DJhJohXj2qF6eKZ7@cluster0.rwarx.mongodb.net/plant?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log("database connected"))
    .catch(err => console.error("database error", err));


// Importing Routes
// Routes methods GET, POST, PUT, PATCH, DELETE
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

// Using Routes in Middlware 
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
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
const Category = require('../models/category');
const Image = require('../models/images');

const authenticate = require('../middleware/authenticate');
const upload = require('../../config/multer');
const { streamUpload, cloudinary } = require('../../config/cloudinary');


router.post('/create', authenticate, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const slug = req.body.name.replace(/ /g, '-') + '-' + Date.now();

        const newProduct = await Product.create({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            slug: slug,
            price: req.body.price,
            stock: req.body.stock,
            description: req.body.description,
            productPic: req.body.productPic,
            keyword: req.body.keyword,
            category: req.body.category,
            createdBy: userId
        });



        const product = await Product.findOne({ _id: newProduct._id }).populate("productPic");

        res.status(200).json({ product })

    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }


});


router.get('/me', authenticate, async (req, res) => {
    try {
        console.log("called")
        const { userId } = req.user;
        const products = await Product.find({ createdBy: userId }).populate("productPic");
        res.status(200).json({ products })
    } catch (err) {
        res.status(500).json({ err })
    }
})

// upload.single('product-img'),

router.post("/upload-img",  async (req, res) => {
    try {

        console.log('req body', req.body)
        const uploadResponse = await cloudinary.uploader.upload(req.body.data, {upload_preset:  'ml_default'})
        console.log('uploadResponse', uploadResponse )

        const image = await Image.create({
            mimeType: uploadResponse.resource_type,
            originalName: uploadResponse.etag,
            path: uploadResponse.secure_url
        })

        res.json({ images: [ image ]})
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
})

router.patch("/edit", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const product = await Product.findByIdAndUpdate(req.body.productId, req.body.product);

        if (product.createdBy.toString() !== userId.toString()) {
            return res.status(401).json({ err: "Your are not authorized to change this product" })
        }

        // const updatedProduct = {
        //     ...product._doc,
        //     ...req.body.product
        // }

        const updatedProduct = await Product.findOne({ _id: req.body.productId }).populate("productPic");



        res.status(200).json({ product: updatedProduct });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
})

router.delete("/remove/:productId", authenticate, async (req, res) => {
    try {
        const { userId } = req.user;
        const { productId } = req.params;
        const product = await Product.findOne({ _id: productId });

        if (!product) return res.status(404).json({ err: "product is no longer available" })

        if (product.createdBy.toString() !== userId.toString()) {
            return res.status(401).json({ err: "Your are not authorized to change this product" })
        }

        await product.deleteOne();

        res.status(200).json({ productId: product._id })

    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
})

router.get("/single-product/:productId", authenticate, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ _id: productId }).populate("productPic");
        if (!product) return res.status(404).json({ err: "product not found" });

        res.status(200).json({ product })
    } catch (err) {
        console.log(err)
        res.status(500).json({ err })
    }
})

router.get("/get-product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ _id: productId }).populate("productPic");
        if (!product) return res.status(404).json({ err: "product not found" });

        res.status(200).json({ product })
    } catch (err) {
        console.log(err)
        res.status(500).json({ err })
    }
})

router.post("/search", async (req, res) => {
    try {
        const { searchQuery } = req.body;

        // make array from string and remove duplication
        const queries = [... new Set(searchQuery.split(" "))];
        console.log(queries)

        let productsArray = []
        for (let query of queries) {
            const products = await Product.find({
                "name": { "$regex": query, "$options": "i" }
            }).populate("productPic")
            productsArray = [...productsArray, ...products]
        }

        res.status(200).json({ productsLength: productsArray.length, products: productsArray })
    } catch (err) {
        res.status(500).json({ err })
    }
})

router.get('/', (req, res, next) => {

    Product.find({})
        .select('_id name price productPic slug')
        .exec()
        .then(products => {
            res.status(200).json({
                message: products
            });
        })
        .catch(er => {
            res.status(500).json({
                error: er
            });
        })

});



router.get('/:categorySlug', async (req, res, next) => {
    try {
        const { categorySlug } = req.params;
        const findProduct = await Product.find({ category: categorySlug }).populate("productPic");

        res.status(200).json({ products: findProduct })
    } catch (err) {
        console.log(err)
        res.status(500).json({ err })
    }
});

router.get('/:categorySlug/:productSlug', (req, res, next) => {

    const productSlug = req.params.productSlug;

    Product.findOne({ slug: productSlug })
        .exec()
        .then(product => {
            if (product) {
                res.status(200).json({
                    message: product
                });
            } else {
                return res.status(404).json({
                    message: 'Not Found'
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });


});




module.exports = router;
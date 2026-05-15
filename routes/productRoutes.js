const express = require('express')
const router = express.Router()
const productController   = require('../controller/productController')

router.post('/product/create',productController.addProduct);


router.get('/product/all', productController.getproduct);
router.get('/category/:id',productController.getcategory)
router.get('/inputFields/:id' , productController.getinputFields)
router.patch('/product/toggle/:id', productController.toggleProductStatus);

module.exports = router
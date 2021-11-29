var express = require('express');
var router = express.Router();
const productController = require('../controller/productController')



/* ------------------------ ADMIN DASHBOARD RENDERING ----------------------- */
router.get('/', function(req, res, next) {
  res.render('adminPages/dashboard')
});


/* ----------------------- ADD PRODUCT PAGE RENDERING ----------------------- */
router.get('/addProduct',(req,res)=>{
  res.render('adminPages/addProduct')
})


/* ------------------- PRODUCT ADDING AND SAVE TO DATABASE ------------------ */
router.post("/addProduct",async(req,res)=>{

  await productController.addProduct(req.body).then((proId)=>{
    let productImage = req.files.image
    productImage.mv("./public/productImages/"+proId+".jpg")
  })

  res.redirect('/admin/addProduct')
})


/* ------------------------ PROMOCODE PAGE RENDERING ------------------------ */
router.get('/add-promo-code',(req,res)=>{
  res.render('adminPages/addPromoCode')
})


/* ----------------------- PROMOCODE SAVE TO DATABASE ----------------------- */
router.post('/add-promo-code',(req,res)=>{
  
  productController.addPromoCode(req.body)
  res.redirect('/admin/add-promo-code')
})





module.exports = router;

const { response } = require('express');
var express = require('express');
var router = express.Router();
var productController = require('../controller/productController')
var userController = require('../controller/userController')


/* --------------------------- USER AUTHENTICATION -------------------------- */
const auth = async (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    let products =await productController.getAllProducts()
    res.render('userPages/home', {products});
  }
}


/* --------------------------- HOMEPAGE RENDERING --------------------------- */
router.get('/', auth, async function(req, res, next) {
    let userName = req.session.userName
    let products =await productController.getAllProducts()
    res.render('userPages/home', {products,userName});
});


/* --------------------- LOGIN AND SIGNUP PAGE RENDERING -------------------- */
router.get('/login',(req,res)=>{
  res.render('userPages/login')
})


/* ---------------------- USER REGISTRATION  --------------------- */
router.post('/user-register',async(req,res)=>{
  req.session.userName = req.body.userName
  let userId = await userController.userRegister(req.body)
  req.session.userId = userId
  req.session.loggedIn = true
  res.redirect('/')
})


/* ------------------------- USER LOGIN  ------------------------- */
router.post("/user-login",(req,res)=>{
  userController.doLogin(req.body).then((user)=>{
    req.session.userName =user.userName
    req.session.userId = user._id
    req.session.loggedIn = true
    res.redirect('/')
  }).catch(()=>{
    res.redirect('/login')
  })
})


/* --------------------------- CART PAGE RENDERING -------------------------- */
router.get('/cart',auth,async(req,res)=>{
  let userName = req.session.userName
  let userId = req.session.userId
  let cartProducts = await productController.getCartProduct(userId)
  let cartProductDetails = cartProducts.products

  let finalCartproduct = cartProductDetails.map((i)=>{
    let subTotal = i.quantity * Number(i.price)
    return {...i,subTotal}
    
  })

  let grandTotal =0;
  finalCartproduct.forEach(i =>{
    grandTotal += i.subTotal
    return {...i,grandTotal}
  })

  req.session.grandTotal = grandTotal

  res.render('userPages/cart',{userName,cartProducts:finalCartproduct,grandTotal})
})


/* ---------------------- ITEM ADD TO CART ---------------------- */
router.post('/add-to-cart',auth,(req,res)=>{
  let proId = req.body.proId
  let userId = req.session.userId 
  productController.addToCart(proId,userId)
  res.json({})

})


/* ------------------------- CHECKOUT PAGE RENDERING ------------------------ */
router.get('/checkout', auth, async (req, res, next) =>{
  
  let userName = req.session.userName
  var grandTotal = req.session.grandTotal

  await productController.checkNoteBook(req.session.userId).then((discountPrice)=>{
    req.session.noteDiscountPrice = discountPrice
    req.session.noteRejected = false
    }).catch(()=>{
      req.session.noteRejected = true
    })

   if (req.session.noteDiscountPrice){
    grandTotal = grandTotal-req.session.noteDiscountPrice;
   }    

   await productController.checkSanitizer(req.session.userId).then((discountPrice)=>{
    req.session.sanitizerDiscountPrice = discountPrice
    req.session.sanitizerRejected = false
    }).catch(()=>{
      req.session.sanitizerRejected = true
    })

    if(req.session.sanitizerDiscountPrice){
      grandTotal = grandTotal-req.session.sanitizerDiscountPrice;
    } 

   await productController.checkBag(req.session.userId).then(()=>{
    req.session.bagRejected = false
    }).catch(()=>{
      req.session.bagRejected = true
    })    

    if(req.session.noteRejected || req.session.sanitizerRejected || req.session.bagRejected){
      res.redirect('/cart')
    }else{
      res.render('userPages/checkout',{userName,grandTotal})    
    } 
    
})


/* -------------------- COUPON CODE APPLYING -------------------- */
router.post('/coupon-apply',async(req,res)=>{
  let grandTotal = req.session.grandTotal
  if(grandTotal>=10000){
    await productController.checkCouponApplied(req.session.userId,req.body.code).then((response)=>{
      if(response.couponApplied){
        req.session.grandTotal = grandTotal - 123
      }
    })
  }
    res.json({status : true})
})


/* ----------------------- ORDER PLACED PAGE RENDERING ---------------------- */
router.get('/placeOrder',(req,res)=>{
  res.render('userPages/orderPlaced')
})





module.exports = router;
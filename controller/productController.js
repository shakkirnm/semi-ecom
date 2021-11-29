
var db = require('../config/db')
const objectId = require('mongodb').ObjectId
const { ObjectId } = require('bson')


module.exports = {



    addProduct : (product) =>{
        return new Promise(async(resolve, reject) => {
            let products =  await db.get().collection('products').insertOne(product)
            if(products){
                resolve(products.insertedId)
            }else{
                reject()
            }
            
        })
    },



    getAllProducts : () => {
        return new Promise(async(resolve, reject) => {
            let products = await db.get().collection('products').find().toArray();
            resolve(products)
        })
    },



    addToCart : (proId,userId) =>{

        return new Promise(async(resolve, reject) => {
            
        
            let product = await db.get().collection('products').findOne({_id : ObjectId(proId)})
            let proObj = {
                proId : product._id,
                title : product.title,
                price : product.price,
                quantity : 1,
            }

            let userCart = await db.get().collection('cart').findOne({user : ObjectId(userId)})

            if(userCart) {
                let proExist = userCart.products.findIndex(product => product.proId ==proId)

                if(proExist!=-1){
                    db.get().collection('cart')
                    .updateOne({user:ObjectId(userId),'products.proId':ObjectId(proId)},
                    {
                        $inc : {'products.$.quantity':1}
                    })

                }else{
                db.get()
                    .collection('cart')
                    .updateOne({ user: ObjectId(userId) }, { $push: { products: proObj } })                    
                }
            
            
            }else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [proObj],
                };
                db.get()
                    .collection('cart')
                    .insertOne(cartObj)
                    .then((response) => {
                        resolve();
                    });
            }
        })
    },

    getCartProduct : (userId) =>{
        return new Promise(async(resolve, reject) => {
            let cartproducts = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            resolve(cartproducts)
            
        })
    },

    addPromoCode : (promoDetails) =>{
        return new Promise(async(resolve, reject) => {
            await db.get().collection('promoCode').insertOne(promoDetails)
            resolve()
        })
        
    },

    applyCoupon : (userId) =>{

        return new Promise(async(resolve, reject) => {
            
        })
        
    },
    checkCouponApplied : (userId,code) =>{
        let message = {}
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            if(cart.couponApplied){
                message.couponAlreadyApplied =true
                resolve(message)
            }else{
                if(code == 'PRIME123'){
                    await db.get().collection('cart').updateOne({user : ObjectId(userId)},{$set :{couponApplied :true}})
                    message.couponApplied =true
                    resolve(message)
                }
                    
            }
        })
        

    },

    checkNoteBook : (userId) =>{
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            if(cart){

                var cartProducts = cart.products
            }

            function prodExists(title){
                return cartProducts.some(function(el) {
                    return el.title == title
                })
            }
            if(prodExists('NoteBook')){

                var noteBook = cartProducts.filter(obj => {
                    return obj.title === 'NoteBook'
                })

                let totalNoteBookPrice = (noteBook[0].price)*(noteBook[0].quantity)

                if(totalNoteBookPrice >=500){
                    var discountPrice = (totalNoteBookPrice*10)/100
                    
                    if(discountPrice>60){
                        discountPrice=60
                    }else{
                        discountPrice = discountPrice
                    }
                }
            }else{
                resolve()
            }
           
            if((prodExists('NoteBook')) && (noteBook[0].quantity>=3) ){
                resolve(discountPrice)
            }else{
                reject()
            }

            
            

        })
        

    },

    checkSanitizer : (userId) =>{
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            if(cart){

                var cartProducts = cart.products
            }

            function prodExists(title){
                return cartProducts.some(function(el) {
                    return el.title == title
                })
            }

            if(prodExists('Sanitizer')){
                var Sanitizer = cartProducts.filter(obj => {
                    return obj.title === 'Sanitizer'
                })

                let totalSanitizerPrice = (Sanitizer[0].price)*(Sanitizer[0].quantity)


                if(totalSanitizerPrice >=3000){
                    var discountPrice = 100
                }
            }else{
                resolve()
            }

            if((prodExists('Sanitizer')) && (Sanitizer[0].quantity>=10) ){
                resolve(discountPrice)
            }else{
                reject()
            }
        })
    },

    checkBag : (userId) =>{
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            if(cart){

                var cartProducts = cart.products
            }

            function prodExists(title){
                return cartProducts.some(function(el) {
                    return el.title == title
                })
            }

            if(prodExists('Bag')){
                var Bag = cartProducts.filter(obj => {
                    return obj.title === 'Bag'
                })
            }else{
                resolve()
            }

            if((prodExists('Bag')) && (Bag[0].quantity<=2) ){
                resolve()
            }else{
                reject()
            }
        })
    },


    placeOrder : (userId)=>{
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection('cart').findOne({user : ObjectId(userId)})
            if(cart){
                await db.get().collection('cart').deleteOne({user : objectId(userId)})
            }
            resolve()
        })
        
    }



}

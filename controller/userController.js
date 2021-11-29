var db = require ("../config/db")
var objectId = require('mongodb').ObjectId

module.exports = {

    userRegister : (userDetails) =>{
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection('user').insertOne(userDetails)
            resolve(user.insertedId)
        })
        
    },

    doLogin : (userDetails) =>{
        console.log(userDetails);
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection('user').findOne({userName : userDetails.name}&&{password :userDetails.password})
            if(user){
                resolve(user)
            }else{
                reject()
            }
        })
        
    }

}
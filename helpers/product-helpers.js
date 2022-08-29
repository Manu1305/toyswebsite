
var db=  require('../config/connection')
var collection=require('../config/collection')
const collections = require('../config/collection')
const { ObjectID } = require('bson')
var ObjectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
        
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.insertedId)
        
        })



    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           let products=await db.get().collection(collections.PRODUCT_COLLECTIONS).find().toArray()
           resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTIONS).deleteOne({_id:ObjectId(proId)}).then((response)=>{
                  resolve(response)
            })
        })
    }, 
    // deleteCategory:(catId)=>{
    //     return new Promise ((resolve,reject)=>{
    //        db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:ObjectId(catId)}).then((response)=>{
    //         resolve(response)
    //        })
    //     })
    // } ,


    getProductDetails:(proId)=>{
        console.log(ObjectId(proId))
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:ObjectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
updateProduct:(proId,proDetails)=>{
    console.log(proId,proDetails);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:ObjectId(proId)},{
          $set:{
            Name:proDetails.Name,
            description:proDetails.description,
            price:proDetails.price
            
          }  
        }).then((response)=>{
           resolve(response) 
        })
        
    })
},
addBanner:(banner,callback)=>{
        
    db.get().collection('banner').insertOne(banner).then((data)=>{
        callback(data.insertedId)
    
    })



},
getAllBanner:()=>{
    return new Promise(async(resolve,reject)=>{
       let banner=await db.get().collection(collections.BANNER_COLLECTIONS).find().toArray()
       resolve(banner)
    })
},

deleteBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.BANNER_COLLECTIONS).deleteOne({_id:ObjectId(bannerId)}).then((response)=>{
              resolve(response)
        })
    })
}
,


getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let userdetails=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(userdetails)
    })
},


updateOrder:(proId,proDetails)=>{
    console.log(proId,proDetails);
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(proId)},{
          $set:{
            status:proDetails.status,
            
            
          }  
        }).then((response)=>{
           resolve(response) 
        })
        
    })
},


getOrderDetails:(proId)=>{
    
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION).findOne({_id:ObjectId(proId)}).then((order)=>{
            resolve(order)
        })
    })

}






}
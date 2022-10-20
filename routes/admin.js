var express = require('express');
const { route } = require('./user');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
var categoryHelper=require("../helpers/category-add")
var userHelpers=require('../helpers/user-helpers')


router.get('/login', function(req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if(req.session.loggedIn){
     res.redirect('/admin')
  }else{
    res.render('admin/admin-login',{loginerr:req.session.loginerr,layout:'login-layout'});
    req.session.loginerr=false
  }
})
/* GET users listing. */
router.get('/', function(req, res, next) { 
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
   productHelper.getAllProducts().then((products)=>{
    
    if (req.session.adminLoggedIn){
      
    res.render('admin/view-products',{products,admin:true})}
    else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
    req.session.adminLoggErr = false;}
    
   }) }),   
  
  
  router.get('/add-product',function(req,res) {
    categoryHelper.viewCategory().then((category) => {
      if (req.session.adminLoggedIn) {
        let errmess = req.session.errmess
    

    res.render("admin/add-product",{category,admin:true})
  }})}),
  router.post('/add-product',(req,res)=>{

   productHelper.addProduct(req.body,(id)=>{
    let image=req.files.image
    
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect("/admin/add-product",)
      }
      else{
        console.log(err)
      }
    })
    
   })
  });

const admindb = {
  email: "manu@gmail.com",
  password: 1305
}

router.post('/adminLogin', function (req, res) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if (req.body.email == admindb.email && req.body.password == admindb.password) {
    req.session.adminLoggedIn = true;
    res.redirect('/admin');
  } else {
    req.session.adminLoggErr = true;
    res.redirect('login');
  }
});

router.get('/delete-product/:id',(req,res)=>{
let proId=req.params.id
console.log(proId);
productHelper.deleteProduct(proId).then((respone)=>{
  res.redirect('/admin')
})
})
router.get('/edit-product',async(req,res)=>{
  
  let proId=req.query.id
  let category=categoryHelper.viewCategory()
 productHelper.getProductDetails(proId).then((product)=>{
  
  res.render('admin/edit-product',{category,product,admin:true})
  
})
  
})
router.post('/edit-product/:id',(req,res)=>{

  
   productHelper.updateProduct(req.params.id,req.body).then((response)=>{
    res.redirect("/admin")
   })
  })
 ;





router.get('/adminLoggout', function (req, res, next) {
  req.session.destroy();
  res.redirect('login');
});
router.get('/category-management', ((req, res) => {
  categoryHelper.viewCategory().then((category) => {
    
    if (req.session.adminLoggedIn) {
      res.render('admin/category', { category,admin:true })
    } else {
      res.redirect('/category-management')
    }
  })
}))
router.get('/addCategory', ((req, res) => {
  categoryHelper.viewCategory().then((category) => {
  if (req.session.adminLoggedIn) {
    let errmess = req.session.errmess
    
    res.render('admin/add-category', { errmess,admin:true})
    req.session.errmess = false
  } else {
    res.redirect('/admin')
  }

})})),
router.post('/addCategory', (req,res) => {
  if (req.session.adminLoggedIn) {
    categoryHelper.addCategory(req.body).then((category) => {
      res.redirect('/admin/category-management')
    }).catch((err) => {
      req.session.errmess = err;
      
      res.redirect('/admin/addcategory')
      
    })
  }
})
router.get('/deleteCategory/:id', (req, res) => {
  if (req.session.adminLoggedIn) {
    let proId=req.params.id
    categoryHelper.deleteCategory(req.params.id).then((response) => {
      res.redirect('/admin/category-management')
    })
  }
}),
// router.get('/delete-product/:id',(req,res)=>{
//   let catId=req.params.id
//   console.log(catId);
//   productHelper.deleteProduct(proId).then((respone)=>{
//     res.redirect('/category-management')
//   })
//   })
router.get('/view-users', (req, res)=> {

  userHelpers.getAllUsers().then((userdetails) => {
    if (req.session.adminLoggedIn) {
      let errmess = req.session.errmess
      res.render('admin/view-users', {errmess, userdetails, admin: true });
    } else {
      res.redirect('/admin')
    }
  }
  )
}),
router.get('/delete-user/:id', (req, res) => {
  let usrId = req.params.id;
  userHelpers.deleteUser(usrId).then((response) => {
    res.redirect('/admin/view-users')
  })
}),

router.get('/block/:id',(req,res)=>{
  userHelpers.userblock(req.params.id).then(()=>{
    res.redirect('/admin/view-users')
})
})
router.get('/unblock/:id',(req,res)=>{
  userHelpers.userunblock(req.params.id).then(()=>{
    res.redirect('/admin/view-users')
})
})




router.get('/add-banner',function(req,res) {
 
    if (req.session.adminLoggedIn) {
      
  res.render("admin/add-banner",{admin:true})
}}),





router.post('/add-banner',(req,res)=>{

 productHelper.addBanner(req.body,(id)=>{
  let bimage=req.files.image
  
  bimage.mv('./public/bimages/'+id+'.jpg',(err,done)=>{
    if(!err){
      res.redirect("/admin/viewBanners",)
    }
    else{
      console.log(err)
    }
  })
  
 })
});


router.get('/viewBanners', function(req, res, next) { 
  
   productHelper.getAllBanner().then((banner)=>{
    
    if (req.session.adminLoggedIn){
      
    res.render('admin/viewBanners',{banner,admin:true})}


    else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
    req.session.adminLoggErr = false;}
    
   }) }),   
  

   router.get('/deleteBanner/:id',(req,res)=>{
    let bannerId=req.params.id
   
    productHelper.deleteBanner(bannerId).then((respone)=>{
      res.redirect('/admin/viewBanners')
    })
    })

  
    router.get('/allorders',async(req,res)=>{
      
      let orders=await productHelper.getAllOrders()
      res.render('admin/allorders',{orders,admin:true})
       
     })

     router.post('/editOrder/:id',(req,res)=>{

  
      userHelpers.updateProfile(req.params.id,req.body).then((response)=>{
       res.redirect("/allorders")
      })
     }),
     
     router.post('/editOrders',(req,res)=>{

  
      productHelper.updateOrder(req.body.proId,req.body).then((response)=>{
       res.redirect("/admin/allorders")
      })
     })



     
     router.get('/dashboard',async(req,res)=>{
      
      
      res.render('admin/dashboard',{admin:true})
       
     })
    






     router.get('/orderDetails',function(req, res, next) {
  
      // let user=req.session.user
     
      let proId=req.query.id
      productHelper.getOrderDetails(proId).then((order)=>{
       
        res.render('admin/orderDetails',{order,admin:true});
       })})
    

       router.get('/coupon-management', ((req, res) => {
        productHelper.viewCoupon().then((coupon) => {
          
          if (req.session.adminLoggedIn) {
            res.render('admin/coupon', { coupon,admin:true })
          } else {
            res.redirect('/coupon-management')
          }
        })
      }))

      router.get('/addCoupon', ((req, res) => {
        productHelper.viewCoupon().then((coupon) => {
        if (req.session.adminLoggedIn) {
          let errmess = req.session.errmess
          
          res.render('admin/add-coupon', { errmess,admin:true})
          req.session.errmess = false
        } else {
          res.redirect('/admin')
        }
      
      })})),
      router.post('/addCoupon', (req,res) => {
        if (req.session.adminLoggedIn) {
          productHelper.addCoupon(req.body).then((coupon) => {
            res.redirect('/admin/coupon-management')
          }).catch((err) => {
            req.session.errmess = err;
            
            res.redirect('/admin/coupon')
            
          })
        }
      })
      router.get('/deleteCoupon/:id', (req, res) => {
        if (req.session.adminLoggedIn) {
          let proId=req.params.id
          productHelper.deleteCoupon(req.params.id).then((response) => {
            res.redirect('/admin/coupon-management')
          })
        } else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
        req.session.adminLoggErr = false;}
      }),


      router.get("/view-order-products/:id", async (req, res) => {
        console.log(req.params.id, "ghjhghghj");
        if (req.session.adminLoggedIn) {
          userHelpers.getOrderProducts(req.params.id).then((product) => {
           
            res.render("user/view-order-products", {
             admin:true,
              product,
            });
          });
        }  else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
        req.session.adminLoggErr = false;}
      });
      


module.exports = router;

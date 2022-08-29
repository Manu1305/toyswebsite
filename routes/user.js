const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");
var otpVarification = require("../helpers/otp-validation");
var categoryHelpers = require("../helpers/category-add");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    let baner = productHelper.getAllBanner();
  }

  productHelper.getAllProducts().then((products) => {
    productHelper.getAllBanner().then((banner) => {
      res.render("user/new-product", { products, user, cartCount, banner });
    });
  });
});
router.get("/login", function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/user-login", {
      loginerr: req.session.loginerr,
      layout: "login-layout",
    });
    req.session.loginerr = false;
  }
});

router.get("/signup", function (req, res, next) {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  );
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/signup", { layout: "login-layout" });
  }
});

router.post("/login", function (req, res) {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginerr = true;
      res.redirect("/login");
    }
  });
});
router.post("/signup", function (req, res) {
  req.session.userData = req.body;
  otpVarification.getotp(req.body.number).then((response) => {
    res.redirect("/otp");
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
router.get("/otp", (req, res) => {
  res.render("user/otppage", { otp_error: req.session.otpErr });
}),
  router.post("/otp", (req, res) => {
    console.log("post working");
    let userData = req.session.userData;
    console.log(userData);
    let number = userData.number;
    console.log(number + "number");
    otpVarification.otpVerify(req.body, number).then((data) => {
      if (data.status == "approved") {
        userHelpers.doSignup(req.session.userData).then((response) => {
          req.session.loggedIn = true;
          req.session.user = response;
          res.redirect("/");
        });
      } else {
        req.session.otpErr = "invalid otp";
        res.redirect(req.get("referer"));
      }
    });
  });
router.get("/luckyspin", (req, res) => {
  if (req.session.loggedIn) {
    res.render("user/luckyspin", { layout: "login-layout" });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
}),
  router.get("/cart", async (req, res) => {
    let total = null;
    let products = null;
    if (req.session.loggedIn) {
      total = await userHelpers.getTotalAmount(req.session.user._id);
      let products = await userHelpers.getCartProducts(req.session.user._id);
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      console.log("prod  ", products);
      res.render("user/cart", {
        products,
        cartCount,
        total,
        user: req.session.user,
      });
    } else {
      req.session.loginerr = true;
      res.redirect("/login");
    }
  });

router.get("/viewallproduct", async function (req, res, next) {
  if (req.session.loggedIn) {
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    productHelper.getAllProducts().then((products) => {
      res.render("user/viewallproduct", { products, user, cartCount });
    });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
});
router.get("/add-to-cart/:id", (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
    // res.redirect('/')
  });
});
router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});
router.get("/productdetails", async function (req, res, next) {
  // let user=req.session.user
  if (req.session.loggedIn) {
    let user = req.session.user;
    cartCount = await userHelpers.getCartCount(req.session.user._id);

    let proId = req.query.id;
    productHelper.getProductDetails(proId).then((products) => {
      res.render("user/productdetails", { products, user, cartCount });
    });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
});

router.get("/game", async function (req, res) {
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  let user = req.session.user;
  res.render("user/game", { cartCount, user });
});

router.post("/remove-from-cart", (req, res, next) => {
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
}),
  router.get("/payment", async function (req, res) {
    total = null;
    if (req.session.loggedIn) {
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      let user = req.session.user;
      console.log(user);
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      let address = await userHelpers.getAddressDetails(req.session.user._id);
      res.render("user/payment", { user, cartCount, total, address });
    } else {
      req.session.loginerr = true;
      res.redirect("/login");
    }
  }),
  router.post("/payment", async (req, res) => {

    console.log(req.body,'oooooo');
    let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);

    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
    console.log(req.body);
  });

router.get("/order-success", (req, res) => {
  res.render("user/order-success");
});

router.get("/orders", async (req, res) => {
  if (req.session.loggedIn) {
    let address = await userHelpers.getAddressDetails(req.session.user._id);
    let orders = await userHelpers.getUserOrders(req.session.user._id);
    res.render("user/orders", { user: req.session.user, orders ,address});
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
});

router.get("/view-order-products/:id", async (req, res) => {
  console.log(req.params.id, "ghjhghghj");
  if (req.session.loggedIn) {
    userHelpers.getOrderProducts(req.params.id).then((product) => {
     
      res.render("user/view-order-products", {
        user: req.session.user,
        product,
      });
    });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
});

router.post("/verify-payment", (req, res) => {
  console.log("verify", req.body);
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("done");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "PAYMENT ERROR" });
    });
});

router.get("/add-to-wishlist/:id", (req, res) => {
  console.log("add wish list route initiated");
  userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
    // res.redirect('/')
  });
});

router.post("/remove-from-wishlist", (req, res, next) => {
  userHelpers.removeWishListProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/wishlist", async (req, res) => {
  let products = null;
  if (req.session.loggedIn) {
    products = await userHelpers.getWishListProducts(req.session.user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    console.log("prod  ", products);
    res.render("user/wishlist", {
      products,
      cartCount,
      user: req.session.user,
    });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
});

router.get("/userProfile", function (req, res, next) {
  if (req.session.loggedIn) {
    let userData = req.session.user;
    res.render("user/userProfile", { userData });
  } else {
    req.session.loginerr = true;
    res.redirect("/login");
  }
}),
  router.get("/addAddress", function (req, res, next) {
    if (req.session.loggedIn) {
      
      res.render("user/addAddress");
    } else {
      req.session.loginerr = true;
      res.redirect("/login");
    }
  }),
  router.post("/addAddress", (req, res) => {
    console.log("add-address");
    userHelpers.addAdrress(req.body, req.session.user._id, (id) => {
      res.redirect("/payment");
    });
  });

router.get("/deleteAddress/:id", (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  userHelpers.deleteAddress(proId).then((respone) => {
    res.redirect("/");
  });
});

// router.get('/', function(req, res, next) {
//   res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
//    productHelper.getAllProducts().then((products)=>{

//     if (req.session.adminLoggedIn){

//     res.render('admin/view-products',{products,admin:true})}
//     else{res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr,layout:'login-layout' });
//     req.session.adminLoggErr = false;}

//    }) }),

router.post("/edit-profile/:id", (req, res) => {
  userHelpers.updateProfile(req.params.id, req.body).then((response) => {
    res.redirect("/userProfile");
  });
}),
  router.get("/addresses", async function (req, res, next) {
    if (req.session.loggedIn) {
      let user = req.session.user;
      cartCount = await userHelpers.getCartCount(req.session.user._id);
      let address = await userHelpers.getAddressDetails(req.session.user._id);
      console.log("add", address);
      res.render("user/allAddresses", { address,user,cartCount });
    } else {
      req.session.loginerr = true;
      res.redirect("/login");
    }
  });





  router.get('/orderCancel',function(req, res, next) {
  
    // let user=req.session.user
   
    let proId=req.query.id
    productHelper.getOrderDetails(proId).then((order)=>{
     
      res.render('user/orderCancel',{order});
     })})
  
     router.post('/cancelOrder/:id',(req,res)=>{

  
      productHelper.updateOrder(req.body.proId,req.body).then((response)=>{
       res.redirect("/orders")
      })
     }),

  
     
    


module.exports = router;

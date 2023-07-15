const express = require("express");

//const csrf = require("csurf");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Banner = require("../models/banner");
const Contact = require("../models/contact");
const middleware = require("../middleware");
const router = express.Router();
var mailgun = require('mailgun-js')
  ({ apiKey: 'key-d38db44c45b19a623f8a980e1027c770', domain: process.env.DOMAIN });
const {
  userContactUsValidationRules,
  validateContactUs,
} = require("../configs/validator");

// const csrfProtection = csrf();
// router.use(csrfProtection);

// GET: home page
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category")
      .limit(15);
    const banners = await Banner.find({})
      .limit(3);

    const categories = await Category.find({});

    res.render("index", { pageName: "Trang chủ", products, banners, categories});
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});
// GET: add a product to the shopping cart when "Add to cart" button is pressed

router.post("/add-to-cart", async (req, res) => {
  console.log(req.body.productId);
  const productId = req.body.productId;
  var qty = parseInt(req.query.qty == null ? 1 : req.query.qty);
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let cart;
    if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    } else {
      cart = new Cart({});
    }

    // add the product to the cart
    const product = await Product.findOne({ 'productCode': productId }).populate("category");
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      cart.items[itemIndex].qty += qty;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty += qty;
      cart.totalCost += (product.price * qty);
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: qty,
        price: product.price * qty,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty += qty;
      cart.totalCost += (product.price * qty);

    }
    req.session.cart = cart;
    console.log(req.session.cart);
    req.flash("success", "Item added to the shopping cart");
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// GET: view shopping cart contents
router.get("/shopping-cart", async (req, res) => {
  try {
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.render("shopping-cart", {
        cart: null,
        pageName: "Giỏ hàng",
        products: null,
      });
    }
    // otherwise, load the session's cart
    return res.render("shopping-cart", {
      cart: req.session.cart,
      pageName: "Giỏ hàng",
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: reduce one from an item in the shopping cart
router.get("/reduce/:id", async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      // if (req.user) {
      //   await cart.save();
      // }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: remove all instances of a single product from the cart
router.get("/removeAll/:id", async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: checkout form with csrf token
router.get("/checkout", async (req, res) => {
  const errorMsg = req.flash("error")[0];

  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }

  const errMsg = req.flash("error")[0];
  res.render("checkout", {
    cart: req.session.cart,
    products: await productsFromCart(req.session.cart),
    //csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Thanh toán",
  });
});

// POST: handle checkout logic and payment using Stripe
router.post("/checkout", async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  try {
    const cart = await new Cart(req.session.cart);
    console.log(cart);
    const order = new Order({
      cart: {
        totalQty: cart.totalQty,
        totalCost: cart.totalCost,
        items: cart.items,
      },
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      note: req.body.note,
      paymentMethod: req.body.paymentMethod,
      address: req.body.address,
    });
    console.log(order);
    order.save(async (err, newOrder) => {
      if (err) {
        console.log(err);
        return res.redirect("/checkout");
      }
      var body = `<div>
      <h2 style="color: #478ba2; text-align:center;">Đơn hàng: ${newOrder._id}</h2>
      <h3 style="color: #478ba2;">Số điện thoại: ${newOrder.phoneNumber}<h3>
      </div>
      <h3 style="color: #478ba2;">Email: ${newOrder.email}<h3>
      </div>
      <h3 style="color: #478ba2;">Địa chỉ: ${newOrder.address}<h3>
      </div>
      <h3 style="color: #478ba2;">Tổng tiền: ${newOrder.cart.totalCost}<h3>
      </div>
      <h3 style="color: #478ba2;">Ghi chú: ${newOrder.note}</h3>
      </div>
      <h3 style="color: #478ba2;">Hình thức thanh toán: ${newOrder.paymentMethod}</h3>
      </div>
      `;
      var subject = `Đơn hàng từ TheGioiChau.com`;
      sendMail(process.env.SENDER, process.env.RECEIVER,
        subject, body)
      console.log(req.body.paymentMethod);
      if (req.body.paymentMethod == 'transfer') {
        console.log(newOrder);
        req.session.cart = null;
        return res.render("transfer", {
          order: newOrder,
          //csrfToken: req.csrfToken(),
          pageName: "Chuyển khoản",
        });
      }
      //await cart.save();
      req.flash("success", "Successfully purchased");
      req.session.cart = null;
      res.redirect("/");
    });
  }
  catch (err) {
    console.log(err.message);
    res.redirect("/checkout");
  }
});

router.post("/add-contact", async (req, res) => {
  try {
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      phone: req.body.phone,
    });
    contact.save(async (err, newContact) => {
      if (err) {
        console.log(err);
        return res.redirect("/pages/contact-us");
      }
      var body = `<div>
      <h2 style="color: #478ba2; text-align:center;">Tên khách hàng: ${req.body.name}</h2>
      <h3 style="color: #478ba2;">Email: (${req.body.email})<h3>
      </div>
      <h3 style="color: #478ba2;">Số điện thoại: (${req.body.phone})<h3>
      </div>
      <h3 style="color: #478ba2;">Chủ đề: (${req.body.subject})<h3>
      </div>
      <h3 style="color: #478ba2;">Lời nhắn: </h3>
      <div style="font-size: 30;">
      ${req.body.message}
      </div>
      `;
      var subject = `Liên hệ từ TheGioiChau.com`;
      sendMail(process.env.SENDER, process.env.RECEIVER,
        subject, body)
      req.flash("success", "Successfully purchased");
      res.redirect("/pages/contact-us");
    });
  }
  catch (err) {
    console.log(err.message);
    res.redirect("/pages/contact-us");
  }
});


// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = (
      await Product.findById(item.productId).populate("category")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

sendMail = function (sender_email, receiver_email,
  email_subject, email_body) {

  const data = {
    "from": sender_email,
    "to": receiver_email,
    "subject": email_subject,
    "html": email_body
  };

  mailgun.messages().send(data, (error, body) => {
    if (error) console.log(error)
    else console.log(body);
  });
}

//GET: display abous us page
router.get("/about-us", (req, res) => {
  res.render("about-us", {
    pageName: "Giới thiệu",
  });
});

//GET: display contact us page and form with csrf tokens
router.get("/contact-us", (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error");
  res.render("contact-us", {
    pageName: "Liên hệ",
    successMsg,
    errorMsg,
  });
});

//POST: handle contact us form logic using nodemailer
router.post(
  "/contact-us",
  [userContactUsValidationRules(), validateContactUs],
  (req, res) => {
    // instantiate the SMTP server
    const smtpTrans = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        // company's email and password
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // email options
    const mailOpts = {
      from: req.body.email,
      to: process.env.GMAIL_EMAIL,
      subject: `Enquiry from ${req.body.name}`,
      html: `
      <div>
      <h2 style="color: #478ba2; text-align:center;">Client's name: ${req.body.name}</h2>
      <h3 style="color: #478ba2;">Client's email: (${req.body.email})<h3>
      </div>
      <h3 style="color: #478ba2;">Client's message: </h3>
      <div style="font-size: 30;">
      ${req.body.message}
      </div>
      `,
    };

    // send the email
    smtpTrans.sendMail(mailOpts, (error, response) => {
      if (error) {
        req.flash(
          "error",
          "An error occured... Please check your internet connection and try again later"
        );
        return res.redirect("/pages/contact-us");
      } else {
        req.flash(
          "success",
          "Email sent successfully! Thanks for your inquiry."
        );
        return res.redirect("/pages/contact-us");
      }
    });
  }
);

module.exports = router;

const express = require("express");
const csrf = require("csurf");
const nodemailer = require("nodemailer");
const router = express.Router();
const Blog = require("../models/blog");
const Category = require("../models/category");

router.get("/", async (req, res) => {
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];
    const perPage = 5;
    let page = parseInt(req.query.page) || 1;
    try {
      const blogs = await Blog.find({})
        .sort("createdAt")
        .skip(perPage * page - perPage)
        .limit(perPage);
  
      const count = await Blog.count();

      const categories = await Category.find({});
     
      res.render("blog", {
        pageName: "Tin tức",
        blogs,
        categories,
        successMsg,
        errorMsg,
        current: page,
        breadcrumbs: null,
        pages: Math.ceil(count / perPage),
      });
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
  });

  router.get("/:slug", async (req, res) => {
    const successMsg = req.flash("success")[0];
    const errorMsg = req.flash("error")[0];
    try {
      const blog = await Blog.findOne({ slug: req.params.slug });

      const categories = await Category.find({});

      console.log(blog);
      res.render("blog-detail", {
        pageName: blog.title,
        blog,
        categories,
        successMsg,
        errorMsg,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/");
    }
  });

  module.exports = router;

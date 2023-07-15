const express = require("express");
const router = express.Router();

//GET: display abous us page
router.get("/", (req, res) => {
  res.render("admin/dashboard", {
    pageName: "Giới thiệu",
  });
});

router.get("/categories", (req, res) => {
  res.render("admin/category-list", {
    pageName: "Giới thiệu",
  });
});

module.exports = router;
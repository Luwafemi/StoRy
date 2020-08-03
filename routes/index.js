const express = require("express");
const { ensureGuest, ensureAuth } = require("../middleware/auth");
const router = express.Router();

const Story = require("../models/Story");

//@desc           Login/Landing page
//@route          GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login", { layout: "login" });
});

//@desc           Dashboard
//@route          GET /dashboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean(); //##we add lean() to parse the mongoose object we get, so we can make use of it (as a js object)  || 'Story.find()' compare with 'db.posts.find()'
    // console.log(req.user),
    res.render("dashboard", {
      name: req.user.firstName,
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;

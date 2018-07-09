const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" });

// router.post("/", upload.single("file"), function(req, res) {
//   cloudinary.v2.uploader.upload(req.file.path, function(err, res) {
//     console.log(res);
//   });
// });

// //Events model
// const User = require("../../models/User");

// // @route   POST api/Events
// // @desc    createts events
// // @access  Private
router.post("/", upload.single("file"), (req, res) => {
  cloudinary.v2.uploader
    .upload(req.file.path, function(err, res) {
      console.log(res);
      const image = res.url;
      console.log(image);
      // const newPost = new User({
      //   avatar: image
      // });

      // newPost.save().then(post => res.json(post));
    })
    .then(image => {
      res.json(image);
    });
});

module.exports = router;

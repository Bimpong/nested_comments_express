const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Post model
const Post = require("../../models/Post");
// Profile model
const Profile = require("../../models/Profile");

//Validation
const validatePostInput = require("../../validation/post");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

// @route   Get api/posts
// @desc    Get posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

// @route   Get api/posts/:id
// @desc    Get posts
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: "post not found" }));
});

// @route   POST api/posts
// @desc    createts post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   Delete api/posts/:id
// @desc    deletes a post
// @access  Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          //delete
          post.remove().then(() => res.json({ success: "true" }));
        })
        .catch(err => res.status(404).json({ postnotfound: true }));
    });
  }
);

// @route   like api/posts/like/:id
// @desc    likes a post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "You already liked this post" });
          }

          //otherwise add user id to liked array
          post.likes.unshift({ user: req.user.id });

          //save to db
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "no post found" }));
    });
  }
);

// @route   unlike api/posts/unlike/:id
// @desc    unlikes a post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You haven't liked this post" });
          }

          //otherwise get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //then remove that like
          post.likes.splice(removeIndex, 1);

          //save to db
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "no post found" }));
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    comment on a post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        //add comment info to comment array
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        post.comments.unshift(newComment);

        //save to db
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ operation: "failed" }));
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    DELETE comment on a post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexist: "comment does not exist" });
        }

        //get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice the comment out
        post.comments.splice(removeIndex, 1);

        //save post
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ operation: failed }));
  }
);

module.exports = router;

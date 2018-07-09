const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" });

//Events model
const Events = require("../../models/Events");

//Validation
const validateEventsInput = require("../../validation/events");

// @route   GET api/events/test
// @desc    Tests events route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Events Works" }));

// @route   Get api/Events
// @desc    Get events
// @access  Public
router.get("/", (req, res) => {
  Events.find()
    .sort({ date: -1 })
    .then(events => res.json(events));
});

// @route   Get api/event/:id
// @desc    Get event
// @access  Public
router.get("/:id", (req, res) => {
  Events.findById(req.params.id)
    .then(event => res.json(event))
    .catch(err => res.status(404).json({ noeventfound: "event not found" }));
});

// @route   POST api/Events
// @desc    createts events
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEventsInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newEvent = new Events({
      title: req.body.title,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
      description: req.body.description,
      venue: req.body.venue,
      picture: req.body.picture,
      time: req.body.time,
      eDate: req.body.eDate,
      time: req.body.time
    });

    newEvent.save().then(event => res.json(event));
  }
);

// @route   Delete api/events/:id
// @desc    deletes a events
// @access  Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Events.findById(req.params.id)
        .then(event => {
          //check for event owner
          if (event.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }

          //delete
          event.remove().then(() => res.json({ success: "true" }));
        })
        .catch(err => res.status(404).json({ eventnotfound: true }));
    });
  }
);

// @route   like api/events/like/:id
// @desc    likes a events
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Events.findById(req.params.id)
        .then(event => {
          if (
            event.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "You already liked this event" });
          }

          //otherwise add user id to liked array
          event.likes.unshift({ user: req.user.id, name: req.user.name });

          //save to db
          event.save().then(event => res.json(event));
        })
        .catch(err =>
          res.status(404).json({ eventnotfound: "no event found" })
        );
    });
  }
);

// @route   unlike api/events/unlike/:id
// @desc    unlikes an event
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Events.findById(req.params.id)
        .then(event => {
          if (
            event.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You haven't liked this event" });
          }

          //otherwise get remove index
          const removeIndex = event.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //then remove that like
          event.likes.splice(removeIndex, 1);

          //save to db
          event.save().then(event => res.json(event));
        })
        .catch(err =>
          res.status(404).json({ eventnotfound: "no event found" })
        );
    });
  }
);

// @route   POST api/events/comment/:id
// @desc    comment on an event
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Events.findById(req.params.id)
      .then(event => {
        //add comment info to comment array
        const newComment = {
          text: req.body.text,
          name: req.user.name,
          id_number: req.user.id_number,
          user: req.user.id
        };

        event.comments.unshift(newComment);

        //save to db
        event.save().then(event => res.json(event));
      })
      .catch(err => res.status(404).json({ operation: failed }));
  }
);

// @route   DELETE api/events/comment/:id/:comment_id
// @desc    DELETE comment on a event
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Events.findById(req.params.id)
      .then(event => {
        if (
          event.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexist: "comment does not exist" });
        }

        //get remove index
        const removeIndex = event.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //splice the comment out
        event.comments.splice(removeIndex, 1);

        //save event
        event.save().then(event => res.json(event));
      })
      .catch(err => res.status(404).json({ operation: failed }));
  }
);

module.exports = router;

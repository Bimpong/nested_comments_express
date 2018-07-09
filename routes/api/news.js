const express = require("express");
const router = express.Router();

//@route  GET api/news/test
//@desc   tests news route
//@access public
router.get("/test", (req, res) => res.json({ msg: "news works" }));

module.exports = router;

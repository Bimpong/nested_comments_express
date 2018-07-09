const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cloudinary = require("cloudinary");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" });

//routes
const users = require("./routes/api/users.js");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const news = require("./routes/api/news");
const events = require("./routes/api/events");
const courses = require("./routes/api/courses");
const files = require("./routes/api/files");

const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB config
const db = require("./config/keys.js").mongoURI;

//DB connect
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

//Passport middleware
app.use(passport.initialize());

//passport config
require("./config/passport")(passport);

//cloudinary config
cloudinary.config({
  cloud_name: "*************",
  api_key: "******************",
  api_secret: "*****************"
});

//Using routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
app.use("/api/news", news);
app.use("/api/events", events);
app.use("/api/files", files);
app.use("/api/courses", courses);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));

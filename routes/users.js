const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/users");

const { loginUser, signupUser } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post(
  "/signup",
  //  Basic Validations.
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a valid password").isLength({
      min: 6,
    }),
    body("full_name", "Please enter your full name").isLength({
      min: 2,
    }),
  ],

  //   Callback Function
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, full_name } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User Already Registered." });
      }
      //   Create user from Schema
      user = new User({
        email,
        password,
        full_name,
      });

      //   Hashing Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = { user: { id: user.id } };
      //   Creating JWt Token
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/signin",

  //  Basic Validations
  [
    body("email", "Please Enter a valid Email.").isEmail(),
    body("password", "Please Enter a valid Password.").isLength({ min: 6 }),
  ],

  //   Callback Function
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }

      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !",
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      // retrieve JWT Token
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error",
      });
    }
    // loginUser(req.body);
  }
);

router.get("/getUser", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.send({ message: "Error in Fetching user" });
  }
});

module.exports = router;

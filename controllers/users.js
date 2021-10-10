const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.googleClientToken);

const User = require("../models/users");

module.exports.signupUser = async (req, res) => {
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
    jwt.sign(payload, "randomString", { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        email,
        full_name,
        token,
      });
    });
    //
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error in Saving");
  }
};

module.exports.loginUser = async (req, res) => {
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
    jwt.sign(payload, "randomString", { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        email,
        full_name,
        token,
      });
    });
  } catch (e) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Couldn't Fetch User" });
  }
};

module.exports.continueWithGoogle = async (req, res) => {
  try {
    let token = req.body.token;
    let userData = await verifyToken(token);
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = new User(userData);
      await user.save();
    }
    const payload = { user: { id: user.id } };
    //   Creating JWt Token
    jwt.sign(payload, "randomString", { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        token,
      });
    });
  } catch (e) {
    console.log(err.message);
    res.status(500).send("Error Occured");
  }
};

async function verifyToken(token) {
  const result = await client.verifyIdToken({
    idToken: token,
    audience: process.env.googleClientToken,
  });
  const payload = result.getPayload();
  let user = {
    email: payload.email,
    full_name: payload.name,
    created_at: Date.now(),
  };
  return user;
}

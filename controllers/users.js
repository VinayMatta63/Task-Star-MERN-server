const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/users");

module.exports.signupUser = async ({ email, password, full_name }) => {
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
};

module.exports.loginUser = async ({ email, password }) => {
  try {
    let user = await User.findOne({ email });
    console.log(user);
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
};
module.exports.getUser = async function (req, res) {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
};

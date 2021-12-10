const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const users = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post(
  "/signup",
  // Basic Validations.
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a valid password").isLength({
      min: 6,
    }),
    body("full_name", "Please enter your full name").isLength({
      min: 2,
    }),
  ],
  // Callback Function
  users.signupUser
);

router.post(
  "/signin",
  // Basic Validations
  [
    body("email", "Please Enter a valid Email.").isEmail(),
    body("password", "Please Enter a valid Password.").isLength({ min: 6 }),
  ],
  // Callback Function
  users.loginUser
);

router.post(
  "/google",
  // Validating token
  [body("token", "Please Enter a token").not().isEmpty()],
  // Callback function
  users.continueWithGoogle
);

router.get(
  "/getUser",
  // Middleware to get user based ontoken
  auth,
  // Callback function
  users.getUser
);

module.exports = router;

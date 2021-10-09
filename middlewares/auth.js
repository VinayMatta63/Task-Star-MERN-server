const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (!bearerHeader) return res.status(401).json({ message: "Auth Error" });
  try {
    const token = bearerHeader.split(" ")[1];
    const decoded = jwt.verify(token, "randomString");
    console.log(decoded);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};

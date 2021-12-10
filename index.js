if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const user = require("./routes/users");
const organizations = require("./routes/organizations");
const port = process.env.PORT || 8080;
const db_url = process.env.DB_URL;

const app = express();
app.use(cors());

app.use(express.json());

mongoose.connect(db_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Database connection established");
});

const userCollection = db.collection("users");

// app.use(express.static(path.join(__dirname, "./build")));

app.use("/auth", user);
app.use("/orgs", organizations);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

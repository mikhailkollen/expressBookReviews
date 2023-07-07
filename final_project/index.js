const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
require("dotenv").config();
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token =
    req.session.authorization && req.session.authorization.accessToken;
  console.log("authentication token", req.session.authorization.accessToken);
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

const PORT = 5000;

app.use("/customer/auth", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

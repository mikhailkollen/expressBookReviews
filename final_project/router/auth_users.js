const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
require("dotenv").config();
const regd_users = express.Router();

let users = {};

const isValid = (username) => {
  if (users[username]) {
    return true;
  }
  return false;
};

const authenticatedUser = (username, password) => {
  if (users[username] === password) {
    return true;
  }
  return false;
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ username }, process.env.SECRET_KEY);

  req.session.authorization = {
    accessToken: token,
  };

  return res.status(200).json({ message: "Login successful" });
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = jwt.decode(req.session.authorization.accessToken).username;
  console.log("username", username);

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userReview = book.reviews[username];

  if (userReview) {
    userReview.review = review;
    return res.status(200).json({ message: "Review modified successfully" });
  }

  const newReview = {
    reviewer: username,
    review: review,
  };
  book.reviews[username] = newReview;

  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = jwt.decode(req.session.authorization.accessToken).username;

  if (!isbn || !username) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userReview = book.reviews[username];

  if (!userReview) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.authenticatedUser = authenticatedUser;
module.exports.login = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require("express");
let books = require("./booksdb.js");
const jwt = require("jsonwebtoken");
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
  return new Promise((resolve) => {
    resolve(books);
  });
}

function findBookByISBN(isbn) {
  return new Promise((resolve) => {
    const book = books[isbn];
    resolve(book);
  });
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password missing" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = password;
  const token = jwt.sign({ username, password }, process.env.SECRET_KEY);

  req.session.authorization = {
    accessToken: token,
  };

  console.log("registration token", req.session.authorization.accessToken);

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const books = await getBooks();
    return res.status(200).json({ books });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await findBookByISBN(isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const booksArray = Object.values(books);

    for (let i = 0; i < booksArray.length; i++) {
      const book = booksArray[i];
      if (book.author === author) {
        return res.status(200).json(book);
      }
    }

    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const booksArray = Object.values(books);

    for (let i = 0; i < booksArray.length; i++) {
      const book = booksArray[i];
      if (book.title === title) {
        return res.status(200).json(book);
      }
    }

    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await findBookByISBN(isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports.general = public_users;

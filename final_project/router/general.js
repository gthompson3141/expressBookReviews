const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Please Enter Username & Password." });
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//   res.send(JSON.stringify(books, null, 4));
//   return res.status(300).json({ message: "Yet to be implemented" });
// });

const fetchBooks = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:5000/')
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        reject(error);
      });
  });
};

public_users.get('/', (req, res) => {
  fetchBooks()
    .then(books => {
      res.json(books);
    })
    .catch(error => {
      res.status(500).json({ message: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorSearch = req.params.author;
  let matchedBooks = [];
  for (let id in books) {
    if (books[id].author === authorSearch) {
      matchedBooks.push(books[id]);
    }
  }
  if (matchedBooks.length > 0) {
    res.send(matchedBooks);
  } else {
    res.status(404).json({ message: "No books found for the specified author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleSearch = req.params.title;
  let matchedBooks = [];
  for (let id in books) {
    if (books[id].title === titleSearch) {
      matchedBooks.push(books[id]);
    }
  }
  if (matchedBooks.length > 0) {
    res.send(matchedBooks);
  } else {
    res.status(404).json({ message: "No books found for the specified title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

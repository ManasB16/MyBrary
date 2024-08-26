const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const uploadPath = path.join("public", "uploads/bookCovers");
const Author = require("../models/author");
const Book = require("../models/book");
const multer = require("multer");
// const imageMimeTypes = ["images/jpeg", "images/gif", "images/png"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Ensure this path exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// All books route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// New Book route
router.get("/new", async (req, res) => {
  // const book = await Book.find();
  showNewPage(res, new Book());
});

// Create Book route
router.post("/", upload.single("cover"), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  const { title, author, publishDate, pageCount, description } = req.body;
  console.log(filename);

  const newBook = await Book.create({
    title: title,
    author: author,
    publishDate: new Date(publishDate),
    pageCount: pageCount,
    coverImgName: filename,
    description: description,
  });
  try {
    // res.redirect(`books/${newBook.id}`);
    res.redirect(`books`);
  } catch (error) {
    // if (newBook.coverImgName != null) removeBookCover(newBook.coverImgName);
    showNewPage(res, newBook, true);
  }
});

async function showNewPage(res, book, err = false) {
  try {
    const authors = await Author.find();
    const params = { book: book, authors: authors };
    if (err) params.errMsg = "Error creating";
    res.render("books/new", params);
  } catch (error) {
    res.redirect("/books");
  }
}

async function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), (err) => {
    if (err) console.log(err);
  });
}

module.exports = router;

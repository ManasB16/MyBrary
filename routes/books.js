const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
// const path = require("path");
// const fs = require("fs");
// const uploadPath = path.join("public", "uploads/bookCovers");
// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath); // Ensure this path exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage: storage });

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
  renderNewPage(res, new Book());
});

// Create Book route
router.post("/", async (req, res) => {
  // const filename = req.file != null ? req.file.filename : null;
  // console.log(filename);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const { title, author, publishDate, pageCount, description, cover } =
    req.body;

  const file = req.files.file;

  const book = new Book({
    title: title,
    author: author,
    publishDate: new Date(publishDate),
    pageCount: pageCount,
    coverImg: new Buffer.from(file.data, "base64"),
    coverImgType: file.mimetype,
    description: description,
  });
  // saveCover(book, cover);
  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch (error) {
    // if (newBook.coverImgName != null) removeBookCover(newBook.coverImgName);
    renderNewPage(res, book, true);
  }
});

// function saveCover(book, coverEncoded) {
//   if (coverEncoded == null) return;
//   const cover = JSON.parse(coverEncoded);
//   if (cover != null && imageMimeTypes.includes(cover.type)) {
//     book.coverImg = new Buffer.from(cover.data, "base64");
//     book.coverImgType = cover.type;
//   }
// }

// async function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), (err) => {
//     if (err) console.log(err);
//   });
// }

// Show Book Route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

// Edit Book Route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

// Update Book Route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

// Delete Book Page
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.deleteOne();
    res.redirect("/books");
  } catch (err) {
    console.log(err);

    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

// async function showNewPage(res, book, err = false) {
//   try {
//     const authors = await Author.find();
//     const params = { book: book, authors: authors };
//     if (err) params.errMsg = "Error creating";
//     res.render("books/new", params);
//   } catch (error) {
//     res.redirect("/books");
//   }
// }

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

module.exports = router;

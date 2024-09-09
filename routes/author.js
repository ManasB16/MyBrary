const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// All authors route
router.get("/", async (req, res) => {
  const searchOptions = {};
  if (req.query.name != null && req.query.name != "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New Author route
router.get("/new", async (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Create Author route
router.post("/", async (req, res) => {
  const { name } = req.body;
  const author = new Author({
    name: name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
    // res.redirect(`authors`);
  } catch (error) {
    res.render("authors/new", {
      author: author,
      errorMsg: "Error saving author",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", {
      author: author,
      booksByAuthor: books,
    });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

// Delete route
router.delete("/:id", async (req, res) => {
  let author;
  // console.log(req.params.id);
  try {
    let book = await Book.find({ author: req.params.id });
    let books = await Book.find().sort({ createdAt: "desc" }).limit(10);
    // console.log(books, author);

    if (book.length <= 0) {
      await Author.findByIdAndDelete(req.params.id);
      res.redirect(`/authors`);
    } else {
      res.render("index", {
        books: books,
        errorMessage: "Error deleting author",
      });
    }
  } catch (err) {
    // if (author == null) {
    //   res.redirect("/");
    // } else {
    //   res.redirect(`/authors/${author.id} `);
    // }
    console.log(err);
  }
});

module.exports = router;

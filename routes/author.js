const express = require("express");
const router = express.Router();
const Author = require("../models/author");

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
router.get("/new", (req, res) => {
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
    res.redirect(`authors`);
  } catch (error) {
    res.render("authors/new", {
      author: author,
      errorMsg: "Error saving author",
    });
  }
});

module.exports = router;

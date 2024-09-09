const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/author");
const booksRouter = require("./routes/books");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(fileUpload());

// Serve static files from 'public' directory
app.use(express.static("public/uploads/bookCovers"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Middleware to parse JSON data

const mongoose = require("mongoose");
// Mongoose connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error: ", err));

// Route handlers
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", booksRouter);

// Start the server
app.listen(process.env.PORT || 3000);

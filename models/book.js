const mongoose = require("mongoose");
const path = require("path");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Author",
  },
  publishDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true,
  },
  coverImgName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

bookSchema.virtual("coverImgPath").get(function () {
  if (this.coverImgName != null)
    return path.join("/public", "uploads/bookCovers", this.coverImgName);
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;

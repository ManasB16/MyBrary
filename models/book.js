const mongoose = require("mongoose");
// const path = require("path");

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
  coverImg: {
    type: Buffer,
    required: true,
  },
  coverImgType: {
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
  if (this.coverImg != null && this.coverImgType != null) {
    return `data:${
      this.coverImgType
    };charset=utf-8;base64,${this.coverImg.toString("base64")}`;
  }
});

module.exports = mongoose.model("Book", bookSchema);

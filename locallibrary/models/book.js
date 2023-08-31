const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// The main difference here is that we've created two references to other models:
//-> author is a reference to a single Author model object, and is required.
//-> genre is a reference to an array of Genre model objects. We haven't declared this object yet!

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/book/${this._id}`;
});

// Export model
module.exports = mongoose.model("Book", BookSchema);

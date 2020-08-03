const mongoose = require("mongoose");
const Storyschema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "public",
    enum: ["public", "private"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, //the objectId mongoDB adds to documents.
    ref: "User", //##command looks like: 'go to User model,look for document with the ObjectId, grab its values/data (use it in populate())'
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Story", Storyschema);

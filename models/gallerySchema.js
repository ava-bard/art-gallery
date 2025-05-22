//require mongoose
const mongoose = require("mongoose");

//make schema
const gallerySchema = mongoose.Schema({
    Title: { type: String, required: true, unique: true },
    Artist: { type: String, required: true },
    Year: { type: String, required: true },
    Category: { type: String, required: true },
    Medium: { type: String, required: true },
    Description: { type: String, required: false },
    Poster: { type: String, required: true },
    Likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    Reviews: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review',
        }
      ]
});

module.exports = mongoose.model("Gallery", gallerySchema);

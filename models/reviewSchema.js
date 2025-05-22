//require mongoose
const mongoose = require('mongoose');

//make schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery', required: true }, 
  comment: { type: String, required: true },
});

module.exports = mongoose.model('Review', reviewSchema);
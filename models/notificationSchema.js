//require mongoose
const mongoose = require('mongoose');

//make schema
const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true},
  content: { type: String, required: true },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }
});

module.exports = mongoose.model('Notification', notificationSchema);
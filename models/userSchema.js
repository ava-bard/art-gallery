//require mongoose
const mongoose = require("mongoose");

//make schema
const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loggedin: { type: Boolean, required: true},
    isArtist: { type: Boolean, required: true },
    postedArt: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artwork'
        }
    ],
    workshops: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workshop'
        }
    ],
    followers: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: 
    [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ],
    Likes: 
    [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Gallery' 
        }
    ],
    Reviews:
    [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Review', // Reference to the Review model
        }
    ]
});

module.exports = mongoose.model("User", userSchema);

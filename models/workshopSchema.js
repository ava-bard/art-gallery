//require mongoose
const mongoose = require("mongoose");

//make schema
const workshopSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Date: { type: String, required: true },
    Location: { type: String, required: true },
    Artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model("Workshop", workshopSchema);
    

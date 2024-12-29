const mongoose = require("mongoose");


const EventSchema = new mongoose.Schema({
    title: String,
    date: Date,
    description: String,
    location: String,
    category: String,
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
mongoose.model("Item", EventSchema);
const mongoose = require("mongoose"); //import mongoose

// Events Schema
const declineEventsModel = new mongoose.Schema({
    _id: { type: Number },
    event_id: { type: Number, ref: "events" },
    user_id: { type: Number, ref: "speakers" },
    type: { type: String }
});

// mapping
mongoose.model("decline", declineEventsModel);

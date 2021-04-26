const mongoose = require("mongoose");


const webinarMessageSchema = mongoose.Schema(
  {
    userName: { type: String},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    message: { type: String, required: true},
    webinarId: {type: mongoose.Schema.Types.ObjectId, required: true},
    
    
  },
  { timestamps: true }
);


module.exports = mongoose.model("webinarmessage", webinarMessageSchema);

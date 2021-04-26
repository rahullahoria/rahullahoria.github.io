const mongoose = require("mongoose");


const webinarPoolSchema = mongoose.Schema(
  {
    userName: { type: String},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    response: { type: String, required: true},
    question: { type: String, required: true},
    webinarId: {type: mongoose.Schema.Types.ObjectId, required: true},
    
    
  },
  { timestamps: true }
);


module.exports = mongoose.model("webinarpool", webinarPoolSchema);

const mongoose = require("mongoose");


const userWebinarSchema = mongoose.Schema(
  {
    userId : { type: mongoose.Schema.Types.ObjectId, required: true },
    webinarId : { type: mongoose.Schema.Types.ObjectId, required: true }
    
  },
  { timestamps: true }
);


module.exports = mongoose.model("userWebinar", userWebinarSchema);

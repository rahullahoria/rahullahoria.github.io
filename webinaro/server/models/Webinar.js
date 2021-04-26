const mongoose = require("mongoose");


const webinarSchema = mongoose.Schema(
  {
    startTime : { type : Date, default: Date.now},
    duration : { type: Number, default: 60},
    title: { type: String },
    des: { type: String },
    speaker: { type: String },
    flowId : {type: mongoose.Schema.Types.ObjectId, required: true},
    
  },
  { timestamps: true }
);


module.exports = mongoose.model("webinar", webinarSchema);

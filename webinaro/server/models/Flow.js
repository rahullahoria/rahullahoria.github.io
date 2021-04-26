const mongoose = require("mongoose");


const flowSchema = mongoose.Schema(
  {
    videoUrl : { type: String },
    seedMes : []

    
  },
  { timestamps: true }
);


module.exports = mongoose.model("flow", flowSchema);

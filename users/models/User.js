const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String },
    // orgId: {type: mongoose.Schema.Types.ObjectId, required: true},
    referral_code: { type: String },
    name: { type: String, required: true },
    status: { type: String, required: true, default: "active" },
    verified: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);

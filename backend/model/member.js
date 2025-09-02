const mongoose = require("mongoose");
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    orgId: String,
    name: String,
    email: String,
    password: String,
    phone: {
      type: String,
      default: null,
    },
    token: String,
    otp: String,
    status: {
      type: Boolean,
      default: true,
    },
    access: {
      type: Array,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const SUmemberSchema = new Schema(
  {
    username: String,
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
    authorization: {
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SU_Member", SUmemberSchema);

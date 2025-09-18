const mongoose = require("mongoose");
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    orgId: String,
    name: String,
    email: String,
    password: String,
    costCenter: {
      type: Schema.Types.ObjectId,
      ref: "Cost_Center",
    },
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);

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
      ref: "Member",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    createdBySU: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
      default: null,
    },
    updatedBySU: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);

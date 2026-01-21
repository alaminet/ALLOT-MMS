const mongoose = require("mongoose");
const { Schema } = mongoose;

const orgUserSchema = new Schema(
  {
    orgId: Number,
    orgName: String,
    TIN: String,
    trade: String,
    phone: Object,
    email: Object,
    taxInfo: Object,
    officeAddress: Object,
    businessAddress: Object,
    paymentInfo: Object,

    // Common Schema
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
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
    createdBySU: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
    updatedBySU: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ORG_User", orgUserSchema);

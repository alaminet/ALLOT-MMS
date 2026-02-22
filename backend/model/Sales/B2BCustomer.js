const mongoose = require("mongoose");
const { Schema } = mongoose;

const B2BCustomerSchema = new Schema(
  {
    orgId: String,
    code: Number,
    name: String,
    phone: Object,
    email: Object,
    TIN: String,
    taxInfo: Object,
    type: {
      type: String,
      enum: ["Local", "Import"],
    },
    officeAddress: Object,
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("B2B_Customer", B2BCustomerSchema);

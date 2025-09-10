const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierSchema = new Schema(
  {
    orgId: String,
    code: Number,
    name: String,
    phone: Array,
    email: Array,
    TIN: String,
    taxInfo: Array,
    type: {
      type: String,
      enum: ["Local", "Import"],
    },
    officeAddress: Array,
    paymentInfo: Array,

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
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);

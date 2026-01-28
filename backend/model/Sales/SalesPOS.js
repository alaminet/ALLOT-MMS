const mongoose = require("mongoose");
const { Schema } = mongoose;

const salesPOSSchema = new Schema(
  {
    orgId: String,
    code: Number,
    billing: {
      number: String,
      name: String,
      address: String,
    },
    payments: {
      totalBill: Number,
      vat: Number,
      discount: Number,
      discountType: String,
      adjustment: Number,
      payment: [
        {
          amount: Number,
          payBy: String,
          payRef: String,
          payAt: { type: Date, default: new Date() },
          receBy: {
            type: Schema.Types.ObjectId,
            ref: "Member",
          },
        },
      ],
    },
    products: Array,

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

module.exports = mongoose.model("Sales_POS", salesPOSSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;

const trnxDetailsSchema = new Schema(
  {
    orgId: String,
    tnxType: String,
    tnxRef: String,
    itemCode: String,
    itemSKU: String,
    itemName: String,
    itemUOM: String,
    itemPrice: Number,
    tnxQty: Number,
    location: String,
    remarks: String,
    costCenter: String,

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

module.exports = mongoose.model("Transaction_Details", trnxDetailsSchema);

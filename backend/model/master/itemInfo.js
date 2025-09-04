const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemInfoSchema = new Schema(
  {
    orgId: String,
    code: Number,
    name: String,
    SKU: String,
    UOM: String,
    discription: String,
    group: String,
    type: String,
    safetyStock: {
      type: Number,
      default: null,
    },
    isShelfLife: {
      type: Boolean,
      default: false,
    },
    lastPrice: {
      type: Number,
      default: 0,
    },
    avgPrice: {
      type: Number,
      default: 0,
    },

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

module.exports = mongoose.model("Item_Info", itemInfoSchema);

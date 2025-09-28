const mongoose = require("mongoose");
const { Schema } = mongoose;

const trnxRecSchema = new Schema(
  {
    orgId: String,
    code: Number,
    tnxType: String,
    sourceType: {
      type: String,
      enum: ["Local", "Import"],
    },
    sourceRef: String,
    headerText: String,
    invoiceNo: String,
    documentAt: Date,
    receivedAt: Date,
    itemDetails: [
      {
        code: String,
        SKU: String,
        name: String,
        UOM: String,
        unitPrice: Number,
        receiveQty: Number,
        location: String,
        remarks: String,
        isDeleted: {
          type: Boolean,
          default: false,
        },
      },
    ],

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

module.exports = mongoose.model("Transaction_Recevie", trnxRecSchema);

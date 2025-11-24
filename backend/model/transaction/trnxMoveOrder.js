const mongoose = require("mongoose");
const { Schema } = mongoose;

const trnxMoveOrderSchema = new Schema(
  {
    orgId: String,
    code: Number,
    reference: String,
    headerText: String,
    costCenter: {
      type: Schema.Types.ObjectId,
      ref: "Cost_Center",
    },
    requestedBy: {
      type: Object,
      default: null,
    },
    checkedBy: {
      type: Object,
      default: null,
    },
    approvedBy: {
      type: Object,
      default: null,
    },
    confirmedBy: {
      type: Object,
      default: null,
    },
    holdBy: {
      type: Object,
      default: null,
    },
    closedBy: {
      type: Object,
      default: null,
    },
    itemDetails: [
      {
        code: {
          type: Schema.Types.ObjectId,
          ref: "Item_Info",
          default: null,
        },
        SKU: String,
        name: String,
        UOM: String,
        reqQty: Number,
        issueQty: { type: Number, default: 0 },
        onHand: Number,
        remarks: String,
        isDeleted: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Common Schema
    status: {
      type: String,
      enum: ["In-Process", "Checked", "Approved", "Hold", "Closed"],
      default: "In-Process",
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

module.exports = mongoose.model("Transaction_MoveOrder", trnxMoveOrderSchema);

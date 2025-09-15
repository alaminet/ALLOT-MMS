const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseReqSchema = new Schema(
  {
    orgId: String,
    code: Number,
    reference: String,
    type: {
      type: String,
      enum: ["Local", "Import"],
    },
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
    note: String,
    itemDetails: [
      {
        code: {
          type: Schema.Types.ObjectId,
          ref: "Item_Info",
          default: null,
        },
        name: String,
        spec: String,
        UOM: String,
        brand: String,
        unitPrice: Number,
        reqQty: Number,
        POQty: {
          type: Number,
          default: 0,
        },
        recQty: {
          type: Number,
          default: 0,
        },
        onHandQty: {
          type: Number,
          default: 0,
        },
        consumePlan: String,
        remarks: String,
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

module.exports = mongoose.model("Purchase_Requisition", purchaseReqSchema);

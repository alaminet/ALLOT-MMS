const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseOrderSchema = new Schema(
  {
    orgId: String,
    code: Number,
    type: {
      type: String,
      enum: ["Local", "Import"],
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
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
    note: String,
    delveryTerms: String,
    deliveryLocation: String,
    billingLocation: String,
    requiredDoc: String,
    paymentTerms: String,
    paymentMode: String,
    POCurrency: String,
    deliveryTarget: Date || null,
    itemDetails: [
      {
        code: {
          type: Schema.Types.ObjectId,
          ref: "Item_Info",
          default: null,
        },
        PRRef: {
          type: Schema.Types.ObjectId,
          ref: "Purchase_Requisition",
          default: null,
        },
        PRLineId: String,
        PRCode: String,
        SKU: String,
        name: String,
        spec: String,
        UOM: String,
        POQty: Number,
        GRNQty: { type: Number, default: 0 },
        POPrice: Number,
        reqPOVAT: { type: Number, default: 0 },
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

module.exports = mongoose.model("Purchase_Order", purchaseOrderSchema);

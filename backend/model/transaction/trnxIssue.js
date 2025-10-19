const mongoose = require("mongoose");
const { Schema } = mongoose;

const trnxIssueSchema = new Schema(
  {
    orgId: String,
    code: Number,
    tnxType: String,
    reference: String,
    headerText: String,
    costCenter: String,
    documentAt: Date,
    issuedAt: Date,
    itemDetails: [
      {
        code: String,
        SKU: String,
        name: String,
        UOM: String,
        issuePrice: Number,
        issueQty: Number,
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

module.exports = mongoose.model("Transaction_Issue", trnxIssueSchema);

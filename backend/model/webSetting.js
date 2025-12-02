const mongoose = require("mongoose");
const { Schema } = mongoose;

const webSettingSchema = new Schema(
  {
    orgId: Number,
    dashboard: Object,
    accounts: {
      currency: String,
    },
    terms: {
      deliveryTerms: String,
      deliveryLocation: String,
      billSubmission: String,
      POReqDoc: String,
      paymentTerms: String,
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

module.exports = mongoose.model("Web_Setting", webSettingSchema);

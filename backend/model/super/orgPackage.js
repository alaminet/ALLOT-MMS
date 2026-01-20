const mongoose = require("mongoose");
const { Schema } = mongoose;

const orgPackageSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "ORG_User",
    },
    affiliater: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
    affaliteAmount: Number,
    dueDate: {
      type: Date,
      default: new Date(),
    },
    module: Object,
    authorization: Object,
    limit: Object,
    price: Object,

    // Common Schema
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "SU_Member",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ORG_Package", orgPackageSchema);

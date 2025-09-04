const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemGroupSchema = new Schema(
  {
    orgId: String,
    name: String,
    code: String,

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

module.exports = mongoose.model("Item_Group", itemGroupSchema);

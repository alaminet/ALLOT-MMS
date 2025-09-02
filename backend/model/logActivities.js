const mongoose = require("mongoose");
const { Schema } = mongoose;

const logSchema = new Schema(
  {
    orgId: String,
    action: String,
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    refModel: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Log", logSchema);

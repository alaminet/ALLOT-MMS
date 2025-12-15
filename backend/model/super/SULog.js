const mongoose = require("mongoose");
const { Schema } = mongoose;

const SUlogSchema = new Schema(
  {
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

module.exports = mongoose.model("SU_Log", SUlogSchema);

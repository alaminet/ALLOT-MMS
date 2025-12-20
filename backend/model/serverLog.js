const mongoose = require("mongoose");
const { Schema } = mongoose;

const serverlogSchema = new Schema(
  {
    orgId: String,
    step: String,
    status: String,
    message: String,
    code: String,
    details: String,
    controller: String,
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Server_Log", serverlogSchema);

const mongoose = require("mongoose");

let mongoConfig = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {})
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoNetworkError:", err.message);
      console.log("Retrying connection");
      setTimeout(mongoConfig, 30000); // 30,000 ms = 30 seconds
    });
};

module.exports = mongoConfig;

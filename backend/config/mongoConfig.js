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
      setTimeout(mongoConfig, 3000); // 3,000 ms = 3 seconds
    });
};

module.exports = mongoConfig;

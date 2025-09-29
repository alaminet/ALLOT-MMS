const mongoose = require("mongoose");

let mongoConfig = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoNetworkError:", err.message);
      console.log("Retrying connection");
      setTimeout(connectWithRetry, 30000); // 60,000 ms = 1 minute
    });
};

module.exports = mongoConfig;

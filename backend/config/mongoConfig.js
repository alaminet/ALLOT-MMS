const mongoose = require("mongoose");

let mongoConfig = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("mongoDB Connected!"));
};

module.exports = mongoConfig;

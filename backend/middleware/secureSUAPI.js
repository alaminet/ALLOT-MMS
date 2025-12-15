const secureSUAPI = async (req, res, next) => {
  try {
    if (req.headers.authorization === process.env.API_SECRET_SU) {
      next();
    } else {
      res.status(401);
      res.send({ error: "unauthorized API called " });
    }
  } catch (error) {
    res.status(500).send({ message: error.message || "Secure API Error" });
  }
};

module.exports = secureSUAPI;

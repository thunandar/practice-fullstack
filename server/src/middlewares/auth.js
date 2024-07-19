const jwt = require("jsonwebtoken");
const { jwtToken } = require("../config/vars");

exports.verifyToken = (req, res, next) => {
  const access_token = req.body.access_token || req.query.access_token || req.headers["x-access-token"];

  if (!access_token) {
    return res.send({
        status: 1,
        message: "access_token is required"
    });
  }
  try {
    const decoded = jwt.verify(access_token, jwtToken);
    req.user = decoded;
  } catch (err) {
    return res.send({
        status: 1,
        message: "Invalid Token"
    });
  }
  return next();
};

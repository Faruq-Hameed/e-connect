const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(403).send({ message: "no token found, Login" });
  } else {
    try {
      req.payload = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch (err) {
      //clear cookie when the token has expired so the user can login without clearing the cookies
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
      });

      res.status(500).send(`${err.message}, Login again`);
    }
  }
};

module.exports = { authentication };

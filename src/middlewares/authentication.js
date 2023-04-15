const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(403).send({ message: "no token found, Login" });
  } else {
    try {
      req.payload = jwt.verify(token, process.env.JWT_SECRET);
      const now = Date.now().valueOf() / 1000;
      if (payload.exp - now < 300) {
        // if the token expires in less than 5 minutes
        // Refresh the token and send it to the client
        await res.clearCookie("token", {
          httpOnly: true,
          secure: true,
        });
        const payload = generatePayload(user);
        /**Attaching payload to cookie * and allow it to clear automatically after expiration*/
        const newToken = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES });
        res.cookie("token", newToken, {
          httpOnly: true,
          expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now,
        });
      }
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

module.exports = authentication ;

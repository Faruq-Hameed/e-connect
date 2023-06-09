const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { generatePayload,doesUserAlreadyExist } = require("../utils");
const { User } = require("../db/models");
require("dotenv").config();
const {userSchema} = require("../utils/schemas")

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

const {loginSchema } = require("../utils/schemas");

 
const createAccount = async (req, res,next) => {
  try {
    //validating the user's inputed data with joi schema
    const validation = userSchema(req.body);
    if (validation.error) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .send(validation.error.details[0].message);
      return;
    }
    //preventing the duplication of email addresses or usernames in the database
    const userAlreadyExist = await doesUserAlreadyExist(User, validation.value);
    if (userAlreadyExist) {
      return res
        .status(userAlreadyExist.status)
        .json({ message: userAlreadyExist.message });
    }

    const newUser = new User(validation.value);
    await newUser.save();
    req.payload = newUser
    next()
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
};
 
/**user login controller */
const userLogin = async (req, res) => {
  // Check if a user is active at the moment on the device
  /**Validate the data in the req.body */
  const validation = loginSchema(req.body);
  const { error, value } = validation;
  if (error) {
    return res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ message: error.details[0].message });
  }
 
  try {
    /**find a user with the provided email and check if the email and password matched */
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send("user with email not found");
    }

    const doesPasswordMatch = await user.comparePassword(password);
    if (!doesPasswordMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send("wrong password provided try again with another password");
    }

    /*check if a user is signed in on the device(the browser) at the moment and logout the user */
    if (existingToken) {
      console.log({decodedToken})
      /**if the new user is different from the currently login user */
      if (decodedToken.userId !== user._id)
        res.clearCookie("token", {
          httpOnly: true,
          secure: true,
        });
      // update the current login user isActive status to false
      await User.findByIdAndUpdate(decodedToken.userId, {
        $set: {
          status: 'offline'
        },
      });
    }
    /**Attaching payload to cookie * and allow it to clear automatically after expiration*/
    const payload = generatePayload(user);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    console.log({token})
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + (30 * 60 * 1000)) // 30 minutes from now,
    });

    user.status = 'online'; //the user is online status is changed to online

    await user.save();
    res.status(StatusCodes.OK).json({ data: user });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).send(err.message);
  }
};

/**user logout controller */
const userLogout = async (req, res) => {
 const {userId} = req.payload
  // update the user isActive status to false
  await User.findByIdAndUpdate(userId, {
    $set: {
     status: 'offline'
    },
  });

  //clear the authenticated user token after updating the user
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
  });
  res.status(StatusCodes.OK).json({ message: "user logged out" });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    //find the email from the user schema
    const user = await User.findOne({ email });

    //   //if user is not found , return a response of 404
    if (!user) {
      return res
      .status(StatusCodes.NOT_FOUND)
      .send({ message: "User with email address not found"})
    }

    // if found, create a token
    const token = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.forgetPasswordExpires = Date.now() + 1000 * 60 * 10; //The token shout last for 10 mins

    //create data for mailing
    const data = {
      to: email,
      subject: "Forgot password confirmation",
      text: `Hello! 
          You are receiving this email because we received a password reset request for your account.\n\n
          <a href="${process.env.APP_URL}${process.env.PORT}/api/citrone/resetPassword/${token}">Reset Password</a> \n\n
          This password reset link will expire in 60 minutes.
          If you did not request a password reset, no further action is required.
          `,
      html: `Hello!
      You are receiving this email because we received a password reset request for your account.\n\n
      <a href="${process.env.APP_URL}${process.env.PORT}/api/citrone/resetPassword/${token}">Reset Password</a> \n\n
      This password reset link will expire in 60 minutes.
      If you did not request a password reset, no further action is required.
      `,
    };

    mail(data);

    await user.save();

    res
      .status(200)
      .send({ message: "Mail has been sent to the email address provided" });
    return;
  } catch (error) {
    throw new Error(error);
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await User.findOne({
      passwordResetToken: hashToken,
      forgetPasswordExpires: { $gte: Date() },
    });

    //if the user returns null
    if (!user) {
      res.status(408).send("Token has expired. Try again later");
      return;
    }
    const { password, confirmPassword } = req.body;

    // check if password is undefined
    if (!password) {
      res.status(400).send("Password must be provided");
      return;
    }

    //check if the password matches with confirm password
    if (password !== confirmPassword) {
      res.status(403).send("Password does not match");
      return;
    }

    user.forgetPasswordExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    res.status(200).send({ message: "Password has been successfully reset" });
  } catch (error) {
    throw new Error(error);
  }
  return;
};

module.exports = {
  createAccount,
  userLogin,
  userLogout,
};

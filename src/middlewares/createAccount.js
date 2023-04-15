const { StatusCodes } = require("http-status-codes");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
// require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateSignUpMail = async (req, res, next) => {
  try {
    const { payload } = req.body;

    /** my gmail information */

    //The config object is missing a secure and port field,
    //There by stopping the email from sending

    const config = {
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    };

    const maxAge = "10m";
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: maxAge, // 10mins
    });

    // send the token to the database and the email address of the user
    const user = await User.findByIdAndUpdate(payload.userId, {
      $set: { registrationToken: token },
    });

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Stutern",
        link: `http://www.stutern.com`,
      },
    });

    let response = {
      body: {
        name: payload.username,
        intro: "Welcome Stutern Citrone Platform",
        action: {
          instructions: "Please click the button below to verify your account",
          button: {
            color: "green",
            text: "Verify email address",
            link: `http://localhost:8070/api/citrone/email/verify/${token}`,
          },
        },
        outro: "happy learning. we wish you the very best",
      },
    };

    let mail = MailGenerator.generate(response);

    const message = {
      from: "faruqhameed1@gmail.com", //save a sender on the .env and fetch
      to: user.email,
      subject: "citrone email verification one",
      html: mail,
    };

    transporter.sendMail(message).then((info) => {
      return res.status(201).json({
        msg: "check your email for verification",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifySignUpMail = async (req, res) => {
  try {
    const { token } = req.params;

    const verifyToken = jwt.verify(token, JWT_SECRET);

    if (!verifyToken) {
      return res
        .status(401)
        .send({ message: "email verification failed, sign up again" });
    }

    await User.findByIdAndUpdate(verifyToken.userId, {
      status: "approved",
      registrationToken: undefined,
    });
    //update the registrationToken field to undefined

    res
      .status(StatusCodes.OK)
      .send({ message: "account creation successfully kindly go login" });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

module.exports = {
  generateSignUpMail,
  verifySignUpMail,
};

const { StatusCodes } = require("http-status-codes");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { User } = require("../db/models");
// require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateSignUpMail = async (req, res, next) => {
  try {
    const { payload } = req;

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

    let transporter = nodemailer.createTransport(config);

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Faruq E-connect",
        link: `http://www.stutern.com`,
      },
    });

    let response = {
      body: {
        name: payload.name + " " + payload.lName,
        intro: "Welcome Stutern Citrone Platform",
        action: {
          instructions: "Thanks for signing up on Faruq E-connect",
          button: {
            color: "green",
            text: "login here",
            link: "http://localhost:1235/login"
          },
        },
        outro: "happy learning. we wish you the very best",
      },
    };

    let mail = MailGenerator.generate(response);

    const message = {
      from: process.env.EMAIL, //save a sender on the .env and fetch
      to: payload.email,
      subject: "welcome",
      html: mail,
    };

    await transporter.sendMail(message)
    res.status(200).json({message: "account created successfully", data: req.payload });

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

module.exports = generateSignUpMail;


// module.exports = {
//   generateSignUpMail,
//   verifySignUpMail,
// };

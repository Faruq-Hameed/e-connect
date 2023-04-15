const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const { User, Friends } = require("../db/models");
require("dotenv").config();
const {
  userSchema,
  userPatchSchema,
  userPasswordSchema,
} = require("../schemas");
const { doesUserAlreadyExist } = require("../utils");

const getAllUsersAccount = async (req, res) => {
  const users = await User.find();
  res.status(200).json({ data: users });
};

const getUserAccount = async (req, res) => {
  const { userId } = req.payload;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
    }
    res.status(StatusCodes.OK).json({ data: user });
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
};

const createUserAccount = async (req, res) => {
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
    Friends.create({ user: newUser._id });
    res.status(200).json({ data: newUser });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err.message);
  }
};



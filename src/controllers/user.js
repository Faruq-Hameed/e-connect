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

const findUser = async (req, res) => {
  // you can use any params to search for a user

  if (Object.keys(req.query).length === 0) {
    //check if the query has any key and check the length
    res.status(400).send("search query is required"); // incase the user did not provide a search query
    return;
  }
  // the first truthy query parameter will be used for the search query
  const { fName, lName, uName, email, phone } = req.query;
  const searchQuery = uName
    ? uName
    : fName
    ? fName
    : lName
    ? lName
    : email
    ? email
    : phone
    ? phone
    : undefined;
  User.findOne(searchQuery)
    .then((user) => {
      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send(`user with ${searchQuery} not found`); //for unknown users
      }
      res.status(200).json({ data: user });
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
};

 
const updateUser = async(req, res) => {
  const user = getObjectById(users, req.params.userId)
  if (!user) return res.status(404).send(`user not found`) //for unknown userId
  if (deletedUserAccount(user, res)) return true //if the user has already been deleted and return true to terminate the process here

  const userIndex = getIndexById(users, req.params.userId)
  const validation = userSchema(req.body)

  if (validation.error) {
      res.status(400).send(validation.error.details[0].message);
      return;
  }


  //checking the existing users for the new username and new email address provided if it being used by another user
  for (element of users) {// an element is a user object
      if (element !== user && element.username === req.body.username) { //only check if the element (user object) is not the current user
          return res.status(409).send('username already exists')
      }
  }

  for (element of users) {// an element is a user object
      if (element !== user && element.email === req.body.email) {//only check if the element (user object) is not the current user
          return res.status(409).send('email already exists')
      }

  }

  // getting user password from secured database needed here for authorizing the user
  const userPassword = getObjectById(passwords, req.params.userId).password
  if (req.body.password !== userPassword) return res.status(401).send('incorrect password'); // password is not changed here but needed for verification

  // if the new username and email provided are not being used then the update proceeds as expected below
  const updatedUser = req.body
  updatedUser.id = user.id; //retaining the original id because id is not changeable
  updatedUser.friendsId = user.friendsId;

  users.splice(userIndex, 1, updatedUser)

  res.status(200).json({ 'user updated info': updatedUser })
}

const updateUserProfile = async (req, res) => {
  //use the authentication to receive user details from the payload saved to jwt
  const { userId } = req.payload;

  if (req.body.password) {
    //if password is submitted by the user
    res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: "User can't change password via this endpoint" });
    return;
  }

  try {
    await User.findByIdAndUpdate(userId, { $set: value });

    res.status(202).send({ message: "user profile has been edited!!!" });
  } catch (error) {
    throw new Error({ error });
  }
  return;
};

module.exports = { getAllUsersAccount, getUserAccount, findUser };
const {
  userSchema,
  userPatchSchema,
  friendsSchema,
  acceptFriendSchema,
  userPasswordSchema,
  friendsSchemaWithUsername,
  userChatsWithFriendSchema,
} = require("./userSchemas");

module.exports = {
  userSchema,
  userPatchSchema,
  friendsSchema,
  acceptFriendSchema,
  userPasswordSchema,
  friendsSchemaWithUsername,
  userChatsWithFriendSchema,
  loginSchema: require('./loginSchema')
};

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: [true, 'please provide a your first name']
    },
    lName: {
        type: String,
        required: [true, 'please provide your last name']
    },
    uName: {
        type: String,
        required: [true, 'please choose a user name']
    },
    email: {
        type: String,
        required: [true, 'please provide your email address']
    },
    password: {
        type: String,
        required: [true, 'please provide your password']
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    incomingFriendsId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pendingFriendsId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],


    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
},
    { timestamps: true }
)



// Hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

  const User = mongoose.model('User', userSchema); 

module.exports = User;
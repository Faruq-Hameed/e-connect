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
    phone: {
        type: String,
        validate: {
          validator: function(v) {
            return /\d{3}-\d{3}-\d{4}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
      },
    email: {
        type: String,
        required: [true, 'please provide your email address']
    },
    password: {
        type: String,
        required: [true, 'please provide your password']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    verified:{
        type: Boolean,
        enum: [true, false],
        default: false
    },
    status:{
        type: String,
        enum: ['online', 'away', 'offline'],
        default: 'offline'
    }
},
    { timestamps: true },
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

  
userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

  const User = mongoose.model('User', userSchema); 
module.exports = User;
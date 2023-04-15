const mongoose = require('mongoose')
const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'sender id required']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
       required: [true, 'receiver id required']
    },
    message: {
      type: String,
       required: [true, 'message cannot be empty']
    },
   status: {
    type: String,
    enum: ['sent', 'received'],
     required: true,
    default: 'sent'
   }
  },
  { timestamps: true } //this will show when the message was sent/created and when edited 
);

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
const mongoose = require('mongoose')
const FriendsSchema = new mongoose.Schema({
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
},
friends: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        dateAccepted: new Date()
    }
],
IncomingFriends: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
],
pendingFriendsId: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        dateSent: new Date()
    }
]
})

module.exports= mongoose.model('Friend', FriendsSchema);



const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const {getObjectByAny, getObjectById,findIndexOf,} = require('../../functions') //functions to get any object in an array with the supplied arguments
const {  friendsSchema, acceptFriendSchema } = require('../../schemas')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json(allChats)
})

router.get('/:userId/:friendId', (req, res) => {
    const user = getObjectById(users, req.params.userId)
    const friend = getObjectById(users, req.params.friendId) //using the provided friendId to get the friend(user) object from the database
    const friendIdIndex = findIndexOf(user.friendsId, req.params.friendId) // i need this to check if the user and friends are truly friends
    if (friendIdIndex < 0) return res.status(404).send(`no friend with name ${friend.name} in your friend list. Please check the provided friendId`);

    const userChats = getObjectById(allChats, req.params.userId)//getting all the user's chats from the database(chats.js)
    
    const userChatsWithFriend = getObjectByAny(userChats.chats,'friendId', req.params.friendId)//getting chats between the user and the friend
    console.log(userChatsWithFriend)
 if (userChatsWithFriend.length === 0){ //if the array is empty
        return res.status(200).send(`you have no chats history with ${friend.username}`)
    }

    res.status(200).json({'Chat history with the friend': userChatsWithFriend})

})

module.exports = router
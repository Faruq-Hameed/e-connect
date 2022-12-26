const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const {getObjectByAny, getObjectById,findIndexOf,} = require('../../functions') //functions to get any object in an array with the supplied arguments
const {  friendsSchema,userChatsSchema } = require('../../schemas')

const router = express.Router()

router.get('/', (req, res) => { //all chats history for all users
    res.status(200).json(allChats)
})

router.get('/:userId', (req, res) => {
    const user = getObjectById(users, req.params.userId)
    const userChats = getObjectById(allChats, req.params.userId)//getting all the user's chats from the database(chats.js)
    
    if (!user) return res.status(404).send('user not found')

    const validation = userChatsSchema(req.body) //password validation
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); //
        return;
    }

    const userPassword = getObjectById(passwords, user.id) //getting the user password to check against the password field in

    if(req.body.password !== userPassword.password){ //password is a key in the userPassword object
        return res.status(403).send('incorrect password')
    }
    
    res.status(200).json({userChats: userChats})


})


router.get('/:userId/:friendId', (req, res) => {
    const user = getObjectById(users, req.params.userId)
    const friend = getObjectById(users, req.params.friendId) //using the provided friendId to get the friend(user) object from the database
    if (!user) return res.status(404).send('user not found')
    if (!friend) return res.status(404).send('friend does not exist')

    const friendIdIndex = findIndexOf(user.friendsId, req.params.friendId) // i need this to check if the user and friends are truly friends
    if (friendIdIndex < 0) return res.status(404).send(`no friend with name ${friend.name} in your friend list. Please check the provided friendId`);

    const userChats = getObjectById(allChats, req.params.userId)//getting all the user's chats from the database(chats.js)
    const userChatsWithTheFriend = userChats.chats.find(friend => friend.friendId ===parseInt(req.params.friendId))
    
    if (userChatsWithTheFriend.chats.length === 0){ //if user and friends are truly friend but no chat history is available
        return res.status(200).send(`you have no chats history with ${friend.username}`)
    }

    res.status(200).json({'Chat history with the friend': userChatsWithTheFriend})

})


//chatting between the friend

router.post('/chatting', (req, res) => {
    
})
module.exports = router
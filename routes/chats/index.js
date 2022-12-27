const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const { getObjectByAny, getObjectById, findIndexOf, } = require('../../functions') //functions to get any object in an array with the supplied arguments
const { friendsSchema, userChatsSchema, friendsSchemaWithUsername, userChatsWithFriendSchema } = require('../../schemas')

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

    if (req.body.password !== userPassword.password) { //password is a key in the userPassword object
        return res.status(403).send('incorrect password')
    }

    res.status(200).json({ userChats: userChats })


})


router.get('/:userId/:friendId', (req, res) => {
    const user = getObjectById(users, req.params.userId)
    const friend = getObjectById(users, req.params.friendId) //using the provided friendId to get the friend(user) object from the database
    if (!user) return res.status(404).send('user not found')
    if (!friend) return res.status(404).send('friend does not exist')

    const friendIdIndex = findIndexOf(user.friendsId, req.params.friendId) // i need this to check if the user and the friend are truly friends
    if (friendIdIndex < 0) return res.status(404).send(`no friend with name ${friend.name} in your friend list. Please check the provided friendId`);

    const userChats = getObjectById(allChats, req.params.userId)//getting all the user's chats from the database(chats.js)
    const userChatsWithTheFriend = userChats.chats.find(friend => friend.friendId === parseInt(req.params.friendId))

    if (userChatsWithTheFriend.chats.length === 0) { //if user and friends are truly friend but no chat history is available
        return res.status(200).send(`you have no chats history with ${friend.username}`)
    }

    res.status(200).json({ 'Chat history with the friend': userChatsWithTheFriend })

})


//chatting between the friend
// friendsSchemaWithUsername,userChatsWithFriendSchema
router.post('/', (req, res) => {
    const validation1 = friendsSchemaWithUsername(req.query)
    if (validation1.error) {
        res.status(400).send(validation1.error.details[0].message); //
        return;
    }

    const validation2 = userChatsWithFriendSchema(req.body) //this is for the req.body which will contain the chat(texts)
    if (validation2.error) {
        res.status(400).send(validation2.error.details[0].message); //
        return;
    }

    const user = getObjectById(users, req.query.userId) //getting the user object with the id
    const friend = getObjectByAny(users, 'username', req.query) //getting the friend object with the username
    if (!user) return res.status(404).send('user not found')
    if (!friend) return res.status(404).send('friend does not exist')

    const friendIdIndex = findIndexOf(user.friendsId, friend.id) // i need this to check if the user and the friend are truly friends
    if (friendIdIndex < 0) return res.status(404).send(`no friend with name ${friend.username} in your friend list. Please check the provided friendId`);

    const userChats = getObjectById(allChats, req.query.userId)//getting all the user's chats from the database(chats.js)
    const friendChats = getObjectById(allChats, friend.id) //using the friend id to get all the friend's chats(object) with all his friends

    const userChatsWithTheFriend = userChats.chats.find(chatObj => chatObj.friendId === friend.id) //this is an object of friend and user Chats in all chats of the user
    const friendChatsWithTheUser = friendChats.chats.find(chatObj => chatObj.friendId === user.id) //the chat of the friend with the user from the friend chats object

     //if the user and the friend have never chatted with each other, sent and received properties won't be available for them,]
     //so we need to create a new chat array of object for them that will contain the properties and values  
     if(!userChatsWithTheFriend.chats.length) {
        userChatsWithTheFriend.chats[0] = {sent : []} //all the sent message of the user to the friend will be added here and sent to the server
        userChatsWithTheFriend.chats[1] = {received : []} //all the received message of the user from the friend will be added here and sent to the server

        friendChatsWithTheUser.chats[0] = {sent : []} //all the sent message of the friend to the user will be added here and sent to the server
        friendChatsWithTheUser.chats[1] = {received : []} //all the received message of the friend from the user will be added here and sent to the server
     }

    const newChats = req.body.texts // the req.body contains the new chat that will be added to both the user and friend chat history

    userChatsWithTheFriend.lastChatted =  new Date //updating the last chatted date to today for the user
    friendChatsWithTheUser.lastChatted = new Date //updating the last chatted date to today for the friend
   console.log({userChatsWithTheFriend});
   console.log({friendChatsWithTheUser});
    userChatsWithTheFriend.chats[0].sent.push(newChats) //adding the new chats to the user chat history with the friend. Index 0 is the sent object and its value is array of strings
    friendChatsWithTheUser.chats[1].received.push(newChats) //adding the new chats to the friend chat history with the user. Index 1 is the received object and its value is array of strings

    res.status(200).json(newChats)
})
module.exports = router
const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const { getElementById, getByAny, getIndexById, getFriendsByIds } = require('../../functions') //functions to get any element with the supplied arguments
const { userSchema, userPatchSchema, friendsSchema } = require('../../schemas')

const router = express.Router()


//get all friends of a user with the userId
router.get('/:userId/', (req, res) => { //to get all friends of a user with the userId
    const user = getElementById(users, req.params.userId)// each user has friendsId so we can get the friends with their various id's 
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    const totalFriends = user.friendsId.length
    if (totalFriends === 0) return res.status(200).send(`${user.name} has no friends`)
    //The user's friends will returned as an array of objects
    //The users friends only contains Id's of their friends so we need to get those friends by their friendId
    //and return the friend username and id as part of the response to the request on this router(api/friends/:userId)
    const userFriends = [{currentFriends: []}, {awaitingFriends: []}, {incomingFriends: []}] 

    for (let i = 0; i < totalFriends; i++) { //getting the friends with their respective id's  in the user's friends list(friendsId)
        let friend = getElementById(users, user.friendsId[i])
        const usernameAndIds = { id: friend.id, username: friend.username }
        userFriends[0].currentFriends.push(usernameAndIds)
    }

    for (let i = 0; i < user.awaitingFriendsId.length; i++) { //getting the friends with their respective id's  in the user's friends list(awaitingFriendsId)
        let friend = getElementById(users, user.awaitingFriends[i])
        const usernameAndIds = { id: friend.id, username: friend.username }
        userFriends[1].awaitingFriends.push(usernameAndIds)
    }

    for (let i = 0; i < user.incomingFriendsId.length; i++) { //getting the friends with their respective id's  in the user's friends list(incomingFriendsId)
        let friend = getElementById(users, user.incomingFriendsId[i])
        const usernameAndIds = { id: friend.id, username: friend.username }
        userFriends[2].incomingFriends.push(usernameAndIds)
    }

    res.status(200).send(`${user.username} has ${totalFriends} friends. They are \n ${userFriends}`)
})



//a user needs to know another user id to add them to friends list
router.post('/addFriends', (req, res) => {
    const input = friendsSchema(req.body)
    if (input.error) {
        res.status(400).send(input.error.details[0].message); // error handling
        return;
    }

    // A sent request is sent to the new friend with the friendId to accept the request or reject
    //The user will not be notified if the request is rejected but notice if the request is accepted in his friendId list
    const user = getElementById(users, req.body.userId)
    const newFriend = getElementById(users,  req.body.friendId)

    
    if (!user) return res.status(404).send(`user with id ${req.body.userId} does not exist`)
    if (!newFriend) return res.status(404).send(`the new friend with id ${req.body.friendId} does not exist`)
    
    if (user.id === newFriend.id) {// incase the user supplied the same userId as friendId in the request
        res.status(404).send('you cannot add yourself as a friend')
        return
    }

    //checking if the friend is already in the user's friends list i.e(friendId is already existing)
    for (friendId in user.friendsId) {
        if (friendId === newFriend.id) {
            return res.status(404).send(`${newFriend.name} is already in your friend list`)
        }
    }

    user.awaitingFriendsId.push(newFriend.id)   // adding the friend id to the awaitingFriendsId array
    newFriend.incomingFriendsId.push(user.id)

    res.status(200).send(`Your friend request has been sent to ${newFriend.name}`)
    
})
module.exports = router
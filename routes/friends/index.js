const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const { getElementById, getByAny, getIndexById, getFriendsByIds } = require('../../functions') //functions to get any element with the supplied arguments
const { userSchema, userPatchSchema, friendsSchema } = require('../../schemas')

const router = express.Router()


//get all friends of a user with the userId
router.get('/:userId/', (req, res) => { //to get all friends of a user with the userId provided in the request params
    const user = getElementById(users, req.params.userId)// each user has friendsId so we can get the friends with their various id's 
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    //The totalFriends is the total number of friends including the current, incoming and pending friends
    const totalFriends = user.friendsId.length + user.incomingFriendsId.length + user.pendingFriendsId.length 
    if (totalFriends === 0) return res.status(200).send(`${user.name} has no friends`)
    //The user's friends will returned as an array of objects
    //The users friends only contains Id's of their friends so we need to get those friends by their friendId
    //and return the friend username and id as the response to the request on this router(api/friends/:userId)
    const userFriends = [{currentFriends: []}, {pendingFriends: []}, {incomingFriends: []}] //the res to the req on this router

    for (let i = 0; i < user.friendsId.length; i++) { //getting the friends with their respective id's  in the user's friends list(friendsId)
        if(user.friendsId.length < 1 ) break; // if the user has no friends i.e no current friend in his current friends list
        let friend = getElementById(users, user.friendsId[i]) //each index(i) holds an element in the index in user.friendsId
        const usernameAndIds = { id: friend.id, username: friend.username } //we only need the username and id to be returned 
        userFriends[0].currentFriends.push(usernameAndIds)
    }

    for (let i = 0; i < user.pendingFriendsId.length; i++) { //getting the friends with their respective id's  in the user's friends list(pendingFriendsId)
        if(user.friendsId.length < 1 ) break; // if the user has no pending friends request which he his waiting for approval
        let friend = getElementById(users, user.pendingFriendsId[i])//each index(i) holds an element in the index in user.pendingFriendsId
        const usernameAndIds = { id: friend.id, username: friend.username }//we only need the username and id to be returned 
        userFriends[1].pendingFriends.push(usernameAndIds)
    }

    for (let i = 0; i < user.incomingFriendsId.length; i++) { //getting the friends with their respective id's  in the user's friends list(incomingFriendsId)
        if(user.friendsId.length < 1 ) break; // if the user has no incoming friends request that he hasn't responded to
        let friend = getElementById(users, user.incomingFriendsId[i]) //each index(i) holds an element in the index in user.incomingFriendsId
        const usernameAndIds = { id: friend.id, username: friend.username }//we only need the username and id to be returned 
        userFriends[2].incomingFriends.push(usernameAndIds)
    }

    res.status(200).json({userFriends}) //returning the response as a json object 
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

    function checkIfFriendExists(user,arr){
        for (friendId of user[arr]) {
            if (friendId === newFriend.id) {
                res.status(409).send(`${newFriend.name} is already in your friend list`)
                return true //this return cannot terminate the whole request but rather terminate the function only
            }
        }
    }
    //preventing a friend request not to be sent to a user if the friendId is already in the user's friend list in any way.
    //i.e if it is present in current friend list or pending friend lists or the incoming friend list.
    if (checkIfFriendExists(user, 'friendsId') || checkIfFriendExists(user, 'pendingFriendsId') ||checkIfFriendExists(user, 'incomingFriendsId')){
        return //If the above result is true then the function response is sent to the client and the whole process terminate thereafter
        //the return key word is needed so that the user friend's request won't be sent again after the conflict message is sent
    }
  

    user.pendingFriendsId.push(newFriend.id)   // adding the friend id to the pendingFriendsId array
    newFriend.incomingFriendsId.push(user.id)

    res.status(200).send(`Your friend request has been sent to ${newFriend.name}`)
    
})
module.exports = router
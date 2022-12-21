const { application } = require('express');
const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const { getElementById, getByAny, getIndexById, getFriendsByIds } = require('../../functions') //functions to get any element with the supplied arguments
const { userSchema, userPatchSchema, friendsSchema, acceptFriendSchema } = require('../../schemas')

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

    //function needed to prevent repetitions because this function replaced 3 similar logics from being re-written 
    function createFriendsByIds(arr1, arr2, index) {
        for (let i = 0; i < user[arr1].length; i++) { //arr1 is expected to be an array (e.g friendsId) which is a property of the user object
            if (user[arr1].length < 1) break; // if the array is empty i.e no friends, then stop the iteration and the array is returned empty
            let friend = getElementById(users, user[arr1][i]) //each index(i) holds an element in the index which is an id of another user(i.e friend)
            const usernameAndIds = { id: friend.id, username: friend.username } //we only need the username and id of the friend(s)to be returned 
            userFriends[index][arr2].push(usernameAndIds) //pushing to the appropriate index(e.g index 0 is currentFriends array)
        }
    }
    createFriendsByIds('friendsId','currentFriends',0) //the index 0 is for currentFriends in userFriends and the correct array is friendsId in user
    createFriendsByIds('pendingFriendsId','pendingFriends',1) //the index 0 is for pendingFriends in userFriends and the correct array is pendingFriendsId in user
    createFriendsByIds('incomingFriendsId','incomingFriends',2)//the index 0 is for incomingFriends in userFriends and the correct array is     createFriendsByIds('incomingFriendsId','incomingFriends',2)//the index 0 is for incomingFriends and the correct array is pendingFriendsId in user
    in user


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
        res.status(409).send('you cannot add yourself as a friend')
        return
    }

    function checkIfFriendExists(user,arr){ //user is the object and the arr( array of ids ) is an a property of the object.
        for (friendId of user[arr]) {
            if (friendId === newFriend.id) { //each iteration holds different id that it then checked against a particular id throughout
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

router.put('/', (req, res) => {
    const input = acceptFriendSchema(req.query) //the input field must contain a boolean value for acceptRequest
    if (input.error) {
        res.status(400).send(input.error.details[0].message); // error handling
        return;
    }
    const user = getElementById(users, req.query.userId)
    const newFriend = getElementById(users,  req.query.friendId)


    const friendIdIndex = user.incomingFriendsId.findIndex(element => element === parseInt(req.query.friendId)) // to get the index of the friendid in the user's incoming friendsId
    const idInPendingFriendIds = newFriend.pendingFriendsId.indexOf(parseInt(req.query.friendId)) //get the id index in the friend pending friends list if it exist there


    if (friendIdIndex < 0) return res.status(404).send(`no friend request from ${newFriend.name}. Please check the provided friendId`);
  

    if (!req.query.acceptRequest === 'false') {//if the user doesn't want to accept the friend request
        for (friendId of user.incomingFriendsId) {//each friendId holds an element which is an id of a particular user(friend)
            console.log('reject friend request')
            if (friendId === newFriend.id) {
                user.incomingFriendsId.splice(friendIdIndex, 1) //removing the id from the incomingFriendsId since the request is not accepted  
                res.status(200).send(`You rejected the friend request of ${newFriend.username}. You can add him later in the future.`);
                return
            }
        }
    }

    for (friendId of user.incomingFriendsId) {//each friendId holds an element which is an id of a particular user(friend)
        if (friendId === newFriend.id && req.query.acceptRequest === 'true') { //when the iteration element get to the new friend id & accept is true

            user.friendsId.push(newFriend.id) //add the new friend id to the list of the user's friends (i.e friendsId)        
            newFriend.friendsId.push(parseInt(req.query.userId)); // the friend request has  been accepted here and added user id to the friends friend's list too   

            user.incomingFriendsId.splice(friendIdIndex, 1) //removing the id from the incomingFriendsId once the request is accepted            
            newFriend.pendingFriendsId.splice(idInPendingFriendIds, 1) //removing the id from the pendingFriends id of the friend(newFriend) once the request is accepted

            res.status(200).send(`friend request successfully accepted. The ${newFriend.username} will be notified`)

        }
    }


})

module.exports = router
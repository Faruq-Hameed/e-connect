const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
const { getObjectById,findIndexOf,deletedUserAccount, deletedFriendAccount} = require('../../functions') //functions to get any object in array with the supplied arguments
const {  friendsSchema, acceptFriendSchema } = require('../../schemas')

const router = express.Router()


//get all friends of a user with the userId
router.get('/:userId/', (req, res) => { //to get all friends of a user with the userId provided in the request params
    const user = getObjectById(users, req.params.userId)// each user has friendsId so we can get the friends with their various id's 
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted. return true so that the process can terminate here
    
    //The totalFriends is the total number of friends including the current, incoming and pending friends
    const totalFriends = user.friendsId.length + user.incomingFriendsId.length + user.pendingFriendsId.length
    if (totalFriends === 0) return res.status(200).send(`${user.name} has no friends`)
    //The user's friends will returned as an array of objects
    //The users friends only contains Id's of their friends so we need to get those friends by their friendId
    //and return the friend username, id and status as the response to the request on this router(api/friends/:userId)
    const userFriends = [{ currentFriends: [] }, { pendingFriends: [] }, { incomingFriends: [] }] //the res to the req on this router

    //function needed to prevent repetitions of 3 similar logics from being re-written and not advisable to be written inside the function module
    function createFriendsByIds(arr1, arr2, index) {

        for (let i = 0; i < user[arr1].length; i++) { //arr1 is expected to be an array (e.g friendsId) which is a property of the user object
            if (user[arr1].length < 1) break; // if the array is empty i.e no friends, then stop the iteration and the array is returned empty
            
            let friend = getObjectById(users, user[arr1][i]) //each index(i) holds an element in the index which is an id of another user(i.e friend) object
            const usernameIdsAndStatus = { id: friend.id, username: friend.username, status : friend.status } //we only need the username, id & status of the friend(s)to be returned 
            userFriends[index][arr2].push(usernameIdsAndStatus) //pushing to the appropriate index(e.g index 0 is currentFriends array)
        }
    }
    //calling the function
    createFriendsByIds('friendsId', 'currentFriends', 0) //the index 0 is for currentFriends in userFriends and the correct array is friendsId in user
    createFriendsByIds('pendingFriendsId', 'pendingFriends', 1) //the index 1 is for pendingFriends in userFriends and the correct array is pendingFriendsId in user
    createFriendsByIds('incomingFriendsId', 'incomingFriends', 2)////the index 2 is for incomingFriends and the correct array is incomingFriendsId in user

    res.status(200).json({ userFriends }) //returning the response as a json object 
})



//a user needs to know another user id to add them to friends list
router.post('/addFriends', (req, res) => {// for handling the sending of friend requests among users and users and the server// for handling the sending of friend requests among users and users and the server
    const validation = friendsSchema(req.body)
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); // error handling
        return;
    }

    // A sent request is sent to the new friend with the friendId to accept the request or reject
    const user = getObjectById(users, req.body.userId)
    if (!user) return res.status(404).send(`user with id ${req.body.userId} does not exist`)
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted. return true so that the process can terminate here
   
    const newFriend = getObjectById(users, req.body.friendId)
    if (!newFriend) return res.status(404).send(`the new friend with id ${req.body.friendId} does not exist`)
    if (deletedFriendAccount(newFriend, res)) return true //if the friend account has been deleted we returned a response and terminate the process
   
    if (user.id === newFriend.id) {// incase the user supplied the same userId as friendId in the request
        res.status(409).send('you cannot add yourself as a friend')
        return
    }

    function checkIfFriendExists(user, arr) { //user is the object and the arr( array of ids ) is an a property of the object.
        for (friendId of user[arr]) {
            if (friendId === newFriend.id) { //each iteration holds different id that it then checked against a particular id throughout
                res.status(409).send(`${newFriend.name} is already in your friend list`)
                return true //this return cannot terminate the whole request but rather terminate the function only
            }
        }
    }
    //preventing a friend request not to be sent to a user if the friendId is already in the user's friend list in any way.
    //i.e if it is present in current friend list or pending friend lists or the incoming friend list.
    if (checkIfFriendExists(user, 'friendsId') || checkIfFriendExists(user, 'pendingFriendsId') || checkIfFriendExists(user, 'incomingFriendsId')) {
        return //If the above result is true then the function response is sent to the client and the whole process terminate thereafter
        //the return key word is needed so that the user friend's request won't be sent again after the conflict message is sent
    }


    user.pendingFriendsId.push(newFriend.id)   // adding the friend id to the pendingFriendsId array
    newFriend.incomingFriendsId.push(user.id)

    res.status(200).send(`Your friend request has been sent to ${newFriend.name}`)

})

router.put('/', (req, res) => { //use to handle the accepting of the friend request sent to the user
    const validation = acceptFriendSchema(req.query) //the input field must contain a boolean value for acceptRequest
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); // error handling
        return;
    }

    const user = getObjectById(users, req.query.userId)
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted. return true so that the process can terminate here
   
    const friendIdIndex = findIndexOf(user.incomingFriendsId, req.query.friendId) // to get the index of the friendId in the user's incoming friendsId
    if (friendIdIndex < 0) return res.status(404).send(`no friend with Id ${req.query.friendId} in your friend list. Please check the provided friendId`);
    
    const newFriend = getObjectById(users, req.query.friendId)
    if (deletedFriendAccount(newFriend, res)) { //if the user that sent the request was deleted before the request was to be accepted
        user.incomingFriendsId.splice(friendIdIndex, 1) //removing the id from the user's incomingFriendsId since the account is already deleted          
        return true //a friend request from a deleted account won't be accepted it will be terminated here.
    }
    
    const idInPendingFriendIds = findIndexOf(newFriend.pendingFriendsId, req.query.userId) //get the id index in the friend pending friends list if it exist there

    user.incomingFriendsId.splice(friendIdIndex, 1) //removing the id from the user's incomingFriendsId since it will attended to          
    newFriend.pendingFriendsId.splice(idInPendingFriendIds, 1) //removing the id from the pendingFriends id of the friend(newFriend) too

    if (req.query.acceptRequest === 'true') {  // if the user wants to accept the friend request
        user.friendsId.push(newFriend.id) //add the new friend id to the list of the user's friends (i.e friendsId)        
        newFriend.friendsId.push(parseInt(req.query.userId)); // the friend request has  been accepted here and added user id to the friends friend's list too   

        //creating an empty chat object for the user and the new friend in the database
        const userChats = getObjectById(allChats, req.query.userId)//getting the user's chats object from the database(chats.js)
        const friendChats = getObjectById(allChats, req.query.friendId) //getting the friend's chats object from the database(chats.js)

        const userChatsWithTheFriend =  {friendId: newFriend.id, chats: []} //creating an empty chat object for the new friend in userChatsWithTheFriend
        const friendChatsWithTheUser = {friendId: user.id, chats: []}//creating an empty chat object for the user in friend chat

        userChats.chats.push(userChatsWithTheFriend) //adding the new chat object of the friend in the users's chats array
        friendChats.chats.push(friendChatsWithTheUser)//adding the same new chat object of the user in the friend's chats array   

        return res.status(200).send(`friend request successfully accepted. You can message ${newFriend.username}. ${newFriend.username} will be notified`)
    }

    if (req.query.acceptRequest === 'false') {//if the user doesn't want to accept the friend request the friend will not be notified
        return res.status(200).send(`You rejected the friend request of ${newFriend.username}. You can add him later in the future.`);
    }

})

router.delete('/cancel', (req, res) => { //route to cancel a sent friend request by a user
    const validation = friendsSchema(req.query)
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); // error handling
        return;
    }

    const user = getObjectById(users, req.query.userId) //using the provided userId to get the user object from the database
    if (!user) return res.status(404).send(`user with id ${req.body.userId} does not exist`)
    const friend = getObjectById(users, req.query.friendId) //using the provided friendId to get the friend(user) object from the database
    if (!friend) return res.status(404).send(`the new friend with id ${req.body.friendId} does not exist`)
    
    const friendIdIndex = findIndexOf(user.pendingFriendsId, req.query.friendId)   // to find the index of the friend id in the user's pendingFriendsId array
    if (friendIdIndex < 0) return res.status(404).send(`You don't sent any friend request to user with the name ${friend.name}. Please check the provided friendId`);

    user.pendingFriendsId.splice(friendIdIndex, 1) //remove the friend's Id from the pendingFriendsId array of the user

    if (friend.status !== 'deleted') { //if the friend account is still active  or not a deleted account
        const userIdIndex = findIndexOf(friend.incomingFriendsId, req.query.userId) //the friend's will have the friend request deleted if the friend account is still active
        friend.incomingFriendsId.splice(userIdIndex, 1) //removing the id of the user from the friend's friends list too
    }

    res.status(200).send('The pending friend request has been successfully canceled')

})

router.delete('/', (req, res) =>{ //deleting a friend of the user
    const validation = friendsSchema(req.query)
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); // error handling
        return;
    }

    const user = getObjectById(users, req.query.userId) //using the provided userId to get the user object from the database
    if (!user) return res.status(404).send(`user with id ${req.body.userId} does not exist`)

    const friend = getObjectById(users, req.query.friendId) //using the provided friendId to get the friend(user) object from the database
    if (!friend) return res.status(404).send(`the new friend with id ${req.body.friendId} does not exist`)


    const friendIdIndex = findIndexOf(user.friendsId, req.query.friendId)   // to find the index of the friend id in the user's friendsId
    const userIdIndex =findIndexOf(friend.friendsId, req.query.userId) //find the id index of the user in the friend's friendsId too

    if (friendIdIndex < 0) return res.status(404).send(`You don't have a friend with the name ${friend.name}. Please check the provided friendId`);

    //the user will loose the chats histories with the friend after deleting the friend
    const userChats = getObjectById(allChats, req.query.userId)//getting all the user's chats from the database(chats.js)
    const userChatsWithTheFriendIndex = getIndexById(userChats, req.query.friendId)//getting the index of the user and friend chats in user chats
    userChats.chats.splice(userChatsWithTheFriendIndex, 1) // deleting the chats

    user.friendsId.splice(friendIdIndex, 1) //removing the id from the user's friends list 
    friend.friendsId.splice(userIdIndex, 1) //removing the id of the user from the friend's friends list too

    res.status(200).send('friend successfully deleted')

    //user can also delete his friend if he founds out that his friend's account has been deleted
})

module.exports = router
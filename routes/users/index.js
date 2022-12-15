const express = require('express');
const Joi = require('joi')

const { users, allChats } = require('../../db');
const { getElementById, getByAny, getIndexById } = require('../../functions') //functions to get any element with the supplied arguments
const { userSchema, userPatchSchema } = require('../../schemas')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({ 'all users': users })
})

router.get('/search/user/', (req, res) => { // you can use any params to search for a user
    let user;
    if (req.query.username) {//using username to get a particular user 
        user = getByAny(users, 'username', req.query)
    }
    else if (req.query.name) {//using name to get a particular user 
        user = getByAny(users, 'name', req.query)
    }
    else if (req.query.email) {//using email to get a particular user 
        user = getByAny(users, 'email', req.query)
    }
    if (!user) return res.status(404).send(`user not found`) //for unknown users

    res.status(200).json({ 'user': user })
})

router.get('/:userId', (req, res) => { //get a user with the given id
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    res.status(200).json({ 'user': user })
})

router.get('/:userId/friends', (req, res) => { //to get all friends of a user with the userId
    const user = getElementById(users, req.params.userId)// each user has friendsId so we can get the friends with their various id's 
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    const totalFriends = user.friendsId.length
    if (totalFriends === 0) return res.status(200).send(`${user.name} has no friends`)
    let userFriends = ''
    for (id of user.friendsId) { //getting the friends with their respective id's  in the user's friends list(friendsId)
        let friend = getElementById(users, id)
        userFriends += (user.username + ' is a friend of ' + friend.username + '\n') // creating sentences for user friends          
    }
    res.status(200).send(`${user.username} has ${totalFriends} friends. They are \n ${userFriends}`)

})

//new user sign up request
router.post('/', (req, res) => {
    const input = userSchema(req.body) //validating req.body with schema
    if (input.error) {
        res.status(400).send(input.error.details[0].message);
        return;
    }
    //preventing the duplication of email addresses or usernames in the database
    const usernameExist = getByAny(users, 'username', req.body); //getting the user with the username from any of the users if it exists
    const emailExist = getByAny(users, 'email', req.body); //getting the user with the email from any of the users if it exists
    if (usernameExist) return res.status(409).send('username already exists')
    if (emailExist) return res.status(409).send('email already exists');

    const newUser = req.body
    newUser.id = users.length + 1;
    newUser.friendsId = []; //empty array because the user doesn't have friend yet

    users.push(newUser);
    res.status(200).json({ 'user details': newUser })


})


//updating user details
router.put('/:userId', (req, res) => {
    const user = getElementById(users, req.params.userId)
    const userIndex = getIndexById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId

    const input = userSchema(req.body)
    if (input.error) {
        res.status(400).send(input.error.details[0].message);
        return;
    }
    //checking the existing users for the new username and new email address provided if it being used by another user
    for (element of users) {// an element is a user object
        if (element !== user && element.username === req.body.username) { //only check if the element (user object) is not the current user
            return res.status(409).send('username already exists')
        }
    }

    for (element of users) {// an element is a user object
        if (element !== user && element.email === req.body.email) {//only check if the element (user object) is not the current user
            return res.status(409).send('email already exists')
        }

    }
    // if the new username and email provided are not being used then the update proceeds as expected below
    const updatedUser = req.body
    updatedUser.id = user.id; //retaining the original id because id is not changeable
    updatedUser.friendsId = user.friendsId;
    users.splice(userIndex, 1, updatedUser)

    res.status(200).json({ 'user updated info': updatedUser })
})


router.patch('/:userId', (req, res) => {
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId

    const input = userPatchSchema(req.body)
    if (input.error) {
        res.status(400).send(input.error.details[0].message);
        return;
    }
    //any of these inputs if present will be updated to the new value
    const { name, email, username } = req.body //any of these inputs if present will be updated to the new value

    if (name) user.name = name //if new name is provided then update existing value to the new value

    if (username) {//checking if the new username provided already exists(i.e being used by another user)
        for (element of users) {// an element is a user object
            if (element !== user && element.username === req.body.username) {//only check if the element (user object) is not the current user
                return res.status(409).send('username already exists')
            }
            user.username = username //if no user is using the username provided then proceed to updating the email
        }
    }
    if (email) { //checking if the new email provided already exists(i.e being used by another user)
        for (element of users) { // an element is a user object
            if (element !== user && element.email === req.body.email) { //only check if the element (user object) is not the current user
                return res.status(409).send('email already exists')
            }
        }
        user.email = email //if no user has the email address the proceed to updating the email
    }

    res.status(200).json({ 'user updated info': user })
})


router.delete('/:userId', (req, res) => {
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId
    if (req.body.password !== user.password) return res.status(401).send('incorrect password') //authorizing the user by checking password
    const userIndex = getIndexById(users, req.params.userId) //getting the index of the user to delete
    //deleting the user chats history from the server by getting the index of the user chats in the server(chat.js)
    const userChatsIndex = getIndexById(allChats, req.params.userId)

    users.splice(userIndex, 1) // delete the user from the server(users list)
    allChats.splice(userChatsIndex, 1) // delete the user chats from all chats in the server(chat.js)

    res.status(200).end('delete successful')
})
module.exports = router
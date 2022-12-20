const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../db');
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
    newUser.incomingFriendsId = []; //empty array because the user doesn't have any request friend yet
    newUser.pendingFriendsId = []; //empty array because the user haven't sent out any friend request yet
    

    //the password will be stored in a secure place in the database and will be deleted from the user's database(from req.body)
    const userPasswordInfo = { id: newUser.id, password: newUser.password }
    delete newUser.password //deleting the password from the newUser object. It is already in where we want it stored
    passwords.push(userPasswordInfo) //adding the password to the password dictionary. It can be gotten with the user id.

    users.push(newUser);
    res.status(200).json({ 'user details': newUser })


})


//updating user details
router.put('/:userId', (req, res) => {
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId


    const userIndex = getIndexById(users, req.params.userId)
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

    // getting user password from secured database needed here for authorizing the user
    const userPassword = getElementById(passwords, req.params.userId).password
    if (req.body.password !== userPassword) return res.status(401).send('incorrect password'); // password is not changed here but needed for verification

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

    // getting user password from secured database needed here for authorizing the user
    // password is not changed here but needed for authorization purposes
    const userPassword = getElementById(passwords, req.params.userId).password
    if (req.body.password !== userPassword) return res.status(401).send('incorrect password');

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

    //getting password from secured database for authorization
    const userPassword = getElementById(passwords, req.params.userId).password //getting password from secured database
    if (req.body.password !== userPassword) return res.status(401).send('incorrect password');
    const userPasswordIndex = getIndexById(passwords, req.params.userId) //getting password from secured database
    passwords.splice(userPasswordIndex, 1) // delete the user password from the server(secured database)


    const userIndex = getIndexById(users, req.params.userId) //getting the index of the user to delete
    users.splice(userIndex, 1) // delete the user from the server(users list)

    //deleting the user chats history from the server by getting the index of the user chats in the server(chat.js)
    const userChatsIndex = getIndexById(allChats, req.params.userId)
    allChats.splice(userChatsIndex, 1) // delete the user chats from all chats in the server(chat.js)

    res.status(200).end('delete successful')
})
module.exports = router
const express = require('express');
const Joi = require('joi')

const { users, allChats, passwords } = require('../../src/db');
const { getObjectById, getObjectByAny, getIndexById ,deletedUserAccount,generateOtp} = require('../../src/functions') //functions to get any object in an array with the supplied arguments
const { userSchema, userPatchSchema ,userPasswordSchema} = require('../../src/schemas')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({ 'all users': users })
})

router.get('/search/user/', (req, res) => { // you can use any params to search for a user

    if ( Object.keys(req.query).length === 0)    { //check if the query has any key and check the length
        res.status(400).send('search query is required')// incase the user did not provide a search query
        return
    }
   
    let user;
    if (req.query.username) {//using username to get a particular user 
        user = getObjectByAny(users, 'username', req.query)
    }
    else if (req.query.name) {//using name to get a particular user 
        user = getObjectByAny(users, 'name', req.query)
    }
    else if (req.query.email) {//using email to get a particular user 
        user = getObjectByAny(users, 'email', req.query)
    }
    if (!user) return res.status(404).send(`user not found`) //for unknown users
    
    res.status(200).json({ 'user': user })  
})

router.get('/:userId', (req, res) => { //get a user with the given id
    const user = getObjectById(users, req.params.userId)
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted. return true so that the process can terminate here
    res.status(200).json({ 'user': user })
})


//new user sign up request
router.post('/', (req, res) => {
    const validation = userSchema(req.body) //validating req.body with schema
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message);
        return;
    }
    //preventing the duplication of email addresses or usernames in the database
    const usernameExist = getObjectByAny(users, 'username', req.body); //getting the user with the username from any of the users if it exists    
    const emailExist = getObjectByAny(users, 'email', req.body); //getting the user with the email from any of the users if it exists
    if (usernameExist) return res.status(409).send('username already exists')
    if (emailExist) return res.status(409).send('email already exists');
    

    const newUser = req.body

    newUser.id = users.length + 1; //generate unique id for the new user
    newUser.status = 'active'; //the user is active since he his just signing up
    newUser.friendsId = []; //empty array because the user doesn't have friend yet
    newUser.incomingFriendsId = []; //empty array because the user doesn't have any request friend yet
    newUser.pendingFriendsId = []; //empty array because the user haven't sent out any friend request yet
    users.push(newUser); //adding a new user to the list of users in the database

    //the password will be stored in a secure place in the database and will be deleted from the user's database(from req.body)
    const userPasswordInfo = { id: newUser.id, password: newUser.password }
    delete newUser.password //deleting the password from the newUser object. It is already in where we want it stored    
    passwords.push(userPasswordInfo) //adding the password to the password dictionary. It can be gotten with the user id.
    
    const newUserChatsObject = {id : newUser.id, chats: []} //crating an empty chats object for the new user in the database
    allChats.push(newUserChatsObject) //adding the empty chats array fot the user
    
    res.status(200).json({ 'user details': newUser })


})


//updating all details of the user with the userId
router.put('/:userId', (req, res) => {
    const user = getObjectById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted and return true to terminate the process here

    const userIndex = getIndexById(users, req.params.userId)
    const validation = userSchema(req.body)

    if (validation.error) {
        res.status(400).send(validation.error.details[0].message);
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
    const userPassword = getObjectById(passwords, req.params.userId).password
    if (req.body.password !== userPassword) return res.status(401).send('incorrect password'); // password is not changed here but needed for verification

    // if the new username and email provided are not being used then the update proceeds as expected below
    const updatedUser = req.body
    updatedUser.id = user.id; //retaining the original id because id is not changeable
    updatedUser.friendsId = user.friendsId;

    users.splice(userIndex, 1, updatedUser)

    res.status(200).json({ 'user updated info': updatedUser })
})


router.patch('/:userId', (req, res) => { //updating some of the details of the user
    const user = getObjectById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId
    if (deletedUserAccount(user, res)) return true //if the user has already been deleted the response is returned and the process terminates
    
    const validation = userPatchSchema(req.body)
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message);
        return;
    }


    //any of these keys if present will be updated to the new value
    const { name, email, username } = req.body //any of these keys if present will be updated to the new value

    // getting user password from secured database needed here for authorizing the user
    // password is not changed here but needed for authorization purposes
    const userPassword = getObjectById(passwords, req.params.userId).password
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


router.get('/:userId/delete/otp', (req, res) => {// user must get an otp to authenticate his account deletion
    const user = getObjectById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId
    if (deletedUserAccount(user, res)) return true //return true needed to terminate the process

    const validation = userPasswordSchema(req.body) //password validation
    if (validation.error) {
        res.status(400).send(validation.error.details[0].message); //
        return;
    }

    const userPassword = getObjectById(passwords, req.params.userId).password //getting password from secured database
    if (req.body.password !== userPassword) return res.status(401).send('incorrect password');

    user.otp = generateOtp()

    setTimeout(()=>{ //the generated otp will be cleared after 1 minute
        delete user.otp
    },60000)

    res.status(200).send('confirm the OTP sent to you. It will expire in a minute');
})

router.delete('/:userId', (req, res)=>{//A user can only delete his account if he has the correct otp
    const user = getObjectById(users, req.params.userId)
    if (!user) return res.status(404).send(`user not found`) //for unknown userId
    if (deletedUserAccount(user, res)) return true //return true needed to terminate the process

    const otp = user.otp //the otp sent to the user account will be used for authorizing the delete
    if (otp && parseInt(req.query.otp) !== otp) return res.status(401).send('incorrect otp check the otp and try again'); //if the user provided a wrong otp
    if (!otp) return res.status(410).send('kindly generate a new otp and try again');//supplying otp when it is not existing
   
    //if the user provided a correct otp then we delete request is carried out
    const userPasswordIndex = getIndexById(passwords, req.params.userId) //getting password index from secured database
    passwords.splice(userPasswordIndex, 1) // delete the user password from the server(secured database)

    const userIndex = getIndexById(users, req.params.userId) //getting the index of the user to delete
    users.splice(userIndex, 1, {id: user.id, status: 'deleted' }) // delete the user from the server(users list) and replace with an deleted key object so that the id generation won't be affected

    //deleting the user chats history from the server by getting the index of the user chats in the server(chat.js)
    const userChatsIndex = getIndexById(allChats, req.params.userId)
    allChats.splice(userChatsIndex, 1) // delete the user chat object(histories) from allChats object in the server(chat.js)

    res.status(200).end('delete successful')
})
module.exports = router
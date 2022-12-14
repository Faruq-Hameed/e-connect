const express = require('express');
const Joi = require('joi')

const {users, allChats} = require('../../db');
const {getElementById, getByAny} = require('../../functions')
const {userSchema} = require('../../schemas')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({'all users': users})
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
    if (!user ) return res.status(404).send(`user not found`) //for unknown users

    res.status(200).json({ 'user': user })
})

router.get('/:userId', (req, res) => { //get a user with the given id
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    res.status(200).json({'user': user})
})

router.get('/:userId/friends', (req, res)=>{ //to get all friends of a user with the userId
    const user = getElementById(users, req.params.userId)// each user has friendsId so we can get the friends with their various id's 
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    const totalFriends = user.friendsId.length
    if (totalFriends === 0) return res.status(200).send(`${user.name} has no friends`)
    let userFriends =  ''
    for (id of user.friendsId){ //getting the friends with their respective id's  in the user's friends list(friendsId)
        let friend = getElementById(users, id)
        userFriends += (user.username + ' is a friend of ' + friend.username + '\n') // creating sentences for user friends          
    }
    res.status(200).send(`${user.username} has ${totalFriends} friends. They are \n ${userFriends}`)
    
})

router.post('/',(req, res)=>{
    const input = userSchema(req.body)
    if (input.error) {
        res.status(400).send(input.error.details[0].message);
        return;
    }

})

module.exports = router
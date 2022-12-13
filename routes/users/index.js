const express = require('express');
const {users, allChats} = require('../../db');
const {getElementById, getByAny} = require('../../functions')

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({'all users': users})
})

router.get('/search/user/', (req, res) => {
    const user = users.find(user => user['username'] === req.query.username) 
    // const user = getByAny(users, 'username', req.query)
    console.log(user)
    if (!user) return res.status(404).send(`user with username ${req.query.username} not found`)
    res.status(200).json({'user': user})
    
})

router.get('/:userId', (req, res) => {
    const user = getElementById(users, req.params.userId)
    if (!user) return res.status(404).send(`user with id ${req.params.userId} not found`)
    res.status(200).json({'user': user})
})



module.exports = router
const express = require('express')
const logger = require('morgan')
require('dotenv').config({path: './.env'})
const {users, friends, chats} = require('./routes')

const app = express()
const port = process.env.PORT || 3000


app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/users', users)
app.use('/api/friends', friends)
app.use('/api/chats', chats)


app.use('*', (req, res) =>{
    res.status(400).send('unknown url') //handling all bad url requests
})

app.listen(port, (req, res) =>{
    console.log(`listening on port ${port}`)
});
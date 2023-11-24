const express = require('express')
const logger = require('morgan')
require('dotenv').config({path: './.env'})
const Helmet = require('helmet')
const startServer = require('./src/db/connection')
const {users, friends, chats} = require('./src/routes')


const app = express()
const port = process.env.PORT || 3000

//connecting to database
startServer()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/api/users', users)
app.use('/api/friends', friends)
app.use('/api/chats', chats)

app.use('/static',express.static('./public'))
app.set('view engine', 'pug');
app.set('views', './views');


app.use('*', (req, res) =>{
    res.status(400).send('unknown url') //handling all bad url requests
})

app.listen(port, (req, res) =>{
    console.log(`listening on port ${port}`)
});
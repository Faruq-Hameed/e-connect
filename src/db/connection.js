const mongoose = require('mongoose')
const URI = process.env.MONGODB_URL
const startServer = async () =>{
    mongoose.connect(URI + '/e-connect')
    .then(() => {
        console.log('now using db connection at ' + URI + '/e-connect')
    })
    .catch(err => console.log(err.message))
}

module.exports = (startServer)

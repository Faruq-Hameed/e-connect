function getObjectById(array, id) {
    const object = array.find(obj => obj.id === parseInt(id))
    return object
} 

function getIndexById(array, id) {
    const index = array.findIndex(obj => obj.id === parseInt(id))
    return index
}
function getObjectByAny(array, any, req){ //using any argument to get the object
    const object = array.find(obj => obj[any] === req[any])
    return object
}

function findIndexOf(array, element){
    const index = array.findIndex(e => e === parseInt(element))
    return index
}

function deletedUserAccount(user, res) {//if the current user's account has already been deleted and the client is doing something on behalf of the user
    if (user.status === 'deleted') {
        res.status(400).send('user account has been deleted')
        return true
    }
}

function deletedFriendAccount(friend,res){ //if the user has already been deleted and another user is trying to reach the account
    if (friend.status === 'deleted') {
        res.status(400).send('user account has been deleted. You cannot connect him again')
        return true
    }
}


function generateOtp() { //generates a random number(between 13029 and 99918) of 5 characters as otp for a user 
    return Math.floor(Math.random() * (99918 -13029 ) + 13029);
  }
module.exports = {getObjectById, getObjectByAny, getIndexById, findIndexOf, deletedUserAccount, deletedFriendAccount,generateOtp}
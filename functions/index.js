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

// function deletedUserAccount( input) {//if the user with the id has already been deleted
//     if (input == 'user' && user.deleted) {
//         return res.status(404).send('user account has been deleted')
        
//     }

    const deletedUserAccount = (user) => {
        if (user.deleted) return res.status(200).send('user account has been deleted')//if the user has already been deleted

    }
        
    


//     if (newFriend.deleted) { //incase the friend has already been deleted and the user was trying to add him
//         return res.status(404).send('user account has been deleted. You cannot add him')
//     }

//     if (friend.deleted) {//if the friend has already been deleted and user wants to chat with him
//         return res.status(404).send('your friend account has been deleted')
//     }
// }




module.exports = {getObjectById, getObjectByAny, getIndexById, findIndexOf, deletedUserAccount}
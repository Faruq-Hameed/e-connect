function getObjectById(array, id) {
    const object = array.find(obj => obj.id === parseInt(id))
    return object
}

function getIndexById(array, id) {
    const index = array.findIndex(obj => obj.id === parseInt(id))
    return index
}
function getObjectByAny(array, any, req){
    const object = array.find(obj => obj[any] === req[any])
    return object
}

function findIndexOf(array, element){
    const index = array.findIndex(e => e === parseInt(element))
    return index
}


module.exports = {getObjectById, getObjectByAny, getIndexById, findIndexOf}
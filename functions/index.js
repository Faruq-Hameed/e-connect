function getElementById(array, id) {
    const element = array.find(obj => obj.id === parseInt(id))
    return element
}

function getIndexById(array, id) {
    const index = array.findIndex(obj => obj.id === parseInt(id))
    return index
}
function getByAny(array, any, req){
    const element = array.find(obj => obj[any] === req[any])
    return element
}

function findIndexOf(array, element){
    const index = array.findIndex(e => e === parseInt(element))
    return index
}


module.exports = {getElementById, getByAny, getIndexById, findIndexOf}
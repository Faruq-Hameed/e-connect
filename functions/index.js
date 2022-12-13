function getElementById(array, id) {
    const element = array.find(obj => obj.id === parseInt(id))
    return element
}

function getByAny(array, any, req){
    const element = array.find(obj => obj[any] === req[any])
    return element
}

module.exports = {getElementById, getByAny}
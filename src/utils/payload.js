module.exports = generatePayload

function generatePayload(user){
    return{
        userId: user._id,
        uName: user.uName,
        role: user.role
    }
}
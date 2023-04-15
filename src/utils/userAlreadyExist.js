const {StatusCodes} = require('http-status-codes')

//checking if the email or mobile number already exists for post request
const doesUserExist = async (model, value) => {
    const doesEmailExist = await model.findOne({ email: value.email })
    if (doesEmailExist) {
        let result = { status: StatusCodes.CONFLICT, message: 'email already exists' }
        return result;
    }
    const doesPhoneNumberExist = await model.findOne({ phoneNumber: value.phoneNumber })
    if (doesPhoneNumberExist) {
        let result = { status: StatusCodes.CONFLICT, message: 'phone number already exists' }
        return result;
    }
    const doesUserNameExist = await model.findOne({ phoneNumber: value.uName })
    if (doesPhoneNumberExist) {
        let result = { status: StatusCodes.CONFLICT, message: 'username already exists' }
        return result;
    }
}

module.exports = doesUserExist